'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface LogEntry {
  id: string
  timestamp: number
  level: 'log' | 'info' | 'warn' | 'error' | 'debug'
  message: string
  args: any[]
  stack?: string
}

// Debug modu kontrolü - HER ZAMAN TRUE (test için)
const isDebugMode = () => {
  if (typeof window === 'undefined') return true // SSR'da da true dön ki render edilsin
  const urlParams = new URLSearchParams(window.location.search)
  const isDev = process.env.NODE_ENV === 'development'
  const hasDebugParam = urlParams.get('debug') === '1'
  // HER ZAMAN TRUE - test için
  return true // isDev || hasDebugParam
}

export function DebugConsoleOverlay() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [mounted, setMounted] = useState(false)
  const logContainerRef = useRef<HTMLDivElement>(null)
  const originalConsoleRef = useRef<any>(null)
  const isPatchingRef = useRef(false)

  // Son 300 log'u tut
  const MAX_LOGS = 300

  // Mount kontrolü
  useEffect(() => {
    setMounted(true)
    console.log('[Debug Console] Component mounted and ready!')
  }, [])

  const addLog = useCallback((entry: LogEntry) => {
    // Mount kontrolü - sadece mount olduktan sonra log ekle
    if (!mounted) return
    
    try {
      // setTimeout ile async yap ki React state update'i bloklamasın
      setTimeout(() => {
        try {
          setLogs(prev => {
            try {
              const newLogs = [...prev, entry]
              return newLogs.slice(-MAX_LOGS)
            } catch (err) {
              // State update hatası - fallback
              return prev
            }
          })
        } catch (err) {
          // setLogs hatası - sessizce geç
        }
      }, 0)
    } catch (err) {
      // addLog hatası - sessizce geç
      // Orijinal console'a yazmaya devam edecek
    }
  }, [mounted])

  // Auto scroll
  useEffect(() => {
    if (autoScroll && isOpen && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs, isOpen, autoScroll])

  // Console monkey-patch
  useEffect(() => {
    if (!mounted) return
    if (isPatchingRef.current) return
    
    try {
      console.log('[Debug Console] Setting up console patch...')

      isPatchingRef.current = true
      
      // Orijinal console metodlarını sakla
      const originalLog = console.log.bind(console)
      const originalInfo = console.info.bind(console)
      const originalWarn = console.warn.bind(console)
      const originalError = console.error.bind(console)
      const originalDebug = console.debug.bind(console)

      originalConsoleRef.current = {
        log: originalLog,
        info: originalInfo,
        warn: originalWarn,
        error: originalError,
        debug: originalDebug,
      }

      const createLogEntry = (
        level: LogEntry['level'],
        ...args: any[]
      ): LogEntry => {
        try {
          const message = args
            .map(arg => {
              if (typeof arg === 'string') return arg
              if (arg instanceof Error) return arg.message
              try {
                return JSON.stringify(arg, null, 2)
              } catch {
                return String(arg)
              }
            })
            .join(' ')

          let stack: string | undefined
          if (level === 'error' && args[0] instanceof Error) {
            stack = args[0].stack
          } else {
            try {
              const error = new Error()
              stack = error.stack
            } catch {
              stack = undefined
            }
          }

          return {
            id: `${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            level,
            message,
            args,
            stack,
          }
        } catch (err) {
          // Fallback entry
          return {
            id: `${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            level,
            message: String(args[0] || 'Unknown'),
            args: [],
            stack: undefined,
          }
        }
      }

      // Patch console methods - güvenli wrapper
      console.log = (...args: any[]) => {
        try {
          const entry = createLogEntry('log', ...args)
          addLog(entry)
        } catch (err) {
          // Hata durumunda sadece orijinal console'a yaz
        }
        try {
          originalLog(...args)
        } catch (err) {
          // Orijinal console da hata verirse sessizce geç
        }
      }

      console.info = (...args: any[]) => {
        try {
          originalInfo(...args)
        } catch (err) {
          // Orijinal console da hata verirse sessizce geç
        }
        try {
          const entry = createLogEntry('info', ...args)
          addLog(entry)
        } catch (err) {
          // Overlay'e ekleme hatası - sessizce geç
        }
      }

      console.warn = (...args: any[]) => {
        try {
          originalWarn(...args)
        } catch (err) {
          // Orijinal console da hata verirse sessizce geç
        }
        try {
          const entry = createLogEntry('warn', ...args)
          addLog(entry)
        } catch (err) {
          // Overlay'e ekleme hatası - sessizce geç
        }
      }

      console.error = (...args: any[]) => {
        try {
          originalError(...args)
        } catch (err) {
          // Orijinal console da hata verirse sessizce geç
        }
        try {
          const entry = createLogEntry('error', ...args)
          addLog(entry)
        } catch (err) {
          // Overlay'e ekleme hatası - sessizce geç
        }
      }

      console.debug = (...args: any[]) => {
        try {
          originalDebug(...args)
        } catch (err) {
          // Orijinal console da hata verirse sessizce geç
        }
        try {
          const entry = createLogEntry('debug', ...args)
          addLog(entry)
        } catch (err) {
          // Overlay'e ekleme hatası - sessizce geç
        }
      }
    } catch (err) {
      console.error('[Debug Console] Error setting up patch:', err)
      isPatchingRef.current = false
      return
    }

    // Global error handlers
    const handleError = (event: ErrorEvent) => {
      const entry: LogEntry = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        level: 'error',
        message: `[Uncaught Error] ${event.message}`,
        args: [event.error],
        stack: event.error?.stack || event.filename,
      }
      addLog(entry)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const entry: LogEntry = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        level: 'error',
        message: `[Unhandled Promise Rejection] ${event.reason}`,
        args: [event.reason],
        stack: event.reason?.stack,
      }
      addLog(entry)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    console.log('[Debug Console] Console patch completed successfully!')

    return () => {
      // Restore original console
      try {
        if (originalConsoleRef.current) {
          console.log = originalConsoleRef.current.log
          console.info = originalConsoleRef.current.info
          console.warn = originalConsoleRef.current.warn
          console.error = originalConsoleRef.current.error
          console.debug = originalConsoleRef.current.debug
        }
      } catch (err) {
        // Restore sırasında hata olursa sessizce geç
      }
      try {
        window.removeEventListener('error', handleError)
        window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      } catch (err) {
        // Remove listener sırasında hata olursa sessizce geç
      }
      isPatchingRef.current = false
    }
  }, [addLog, mounted])

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      log.message.toLowerCase().includes(search) ||
      log.level.toLowerCase().includes(search) ||
      log.stack?.toLowerCase().includes(search)
    )
  })

  // Log level colors
  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return '#ef4444'
      case 'warn':
        return '#f59e0b'
      case 'info':
        return '#3b82f6'
      case 'debug':
        return '#8b5cf6'
      default:
        return '#6b7280'
    }
  }

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    })
  }

  // Mount kontrolü
  if (!mounted) {
    return null
  }

  const shouldShow = isDebugMode()
  
  if (!shouldShow) {
    return null
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .debug-console-overlay {
            position: fixed;
            bottom: ${isOpen ? '0' : '20px'};
            right: ${isOpen ? '0' : '20px'};
            width: ${isOpen ? '600px' : '60px'};
            height: ${isOpen ? '500px' : '60px'};
            background: white;
            border: 2px solid #3b82f6;
            border-radius: ${isOpen ? '8px 0 0 0' : '50%'};
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            z-index: 99999;
            display: flex;
            flex-direction: column;
            transition: all 0.3s ease;
            font-family: 'Courier New', monospace;
            font-size: 12px;
          }
          .debug-console-header {
            background: #3b82f6;
            color: white;
            padding: 8px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
            user-select: none;
            border-radius: ${isOpen ? '6px 0 0 0' : '50%'};
            height: ${isOpen ? 'auto' : '60px'};
            width: ${isOpen ? 'auto' : '60px'};
            justify-content: center;
          }
          .debug-console-header.open {
            border-radius: 6px 0 0 0;
          }
          .debug-console-content {
            flex: 1;
            overflow-y: auto;
            padding: 8px;
            background: #1e1e1e;
            color: #d4d4d4;
            display: ${isOpen ? 'block' : 'none'};
          }
          .debug-console-log {
            padding: 4px 8px;
            margin: 2px 0;
            border-left: 3px solid;
            font-size: 11px;
            line-height: 1.4;
            word-break: break-word;
          }
          .debug-console-log:hover {
            background: rgba(255, 255, 255, 0.05);
          }
          .debug-console-log-time {
            color: #858585;
            margin-right: 8px;
          }
          .debug-console-log-level {
            font-weight: bold;
            margin-right: 8px;
            text-transform: uppercase;
            font-size: 10px;
          }
          .debug-console-log-message {
            color: inherit;
          }
          .debug-console-log-stack {
            color: #858585;
            font-size: 10px;
            margin-top: 4px;
            padding-left: 12px;
            white-space: pre-wrap;
          }
          .debug-console-controls {
            display: ${isOpen ? 'flex' : 'none'};
            gap: 8px;
            padding: 8px;
            background: #f3f4f6;
            border-top: 1px solid #e5e7eb;
          }
          .debug-console-search {
            flex: 1;
            padding: 4px 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 12px;
          }
          .debug-console-btn {
            padding: 4px 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            font-size: 11px;
          }
          .debug-console-btn:hover {
            background: #f9fafb;
          }
          .debug-console-btn.danger {
            background: #ef4444;
            color: white;
            border-color: #dc2626;
          }
          .debug-console-btn.danger:hover {
            background: #dc2626;
          }
          .debug-console-stats {
            display: ${isOpen ? 'block' : 'none'};
            padding: 4px 8px;
            background: #f3f4f6;
            border-top: 1px solid #e5e7eb;
            font-size: 10px;
            color: #6b7280;
            text-align: center;
          }
        `
      }} />
      
      <div className="debug-console-overlay">
        <div 
          className={`debug-console-header ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? 'Küçült' : 'Debug Console'}
        >
          {isOpen ? (
            <>
              <span>🐛 Debug Console ({logs.length})</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsOpen(false)
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '0 4px',
                }}
              >
                ×
              </button>
            </>
          ) : (
            <span style={{ fontSize: '24px' }}>🐛</span>
          )}
        </div>

        {isOpen && (
          <>
            <div className="debug-console-controls">
              <input
                type="text"
                className="debug-console-search"
                placeholder="Log ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="debug-console-btn"
                onClick={() => {
                  setLogs([])
                  console.log('[Debug Console] Logs cleared')
                }}
              >
                Temizle
              </button>
              <button
                className="debug-console-btn"
                onClick={() => setAutoScroll(!autoScroll)}
                style={{
                  background: autoScroll ? '#3b82f6' : 'white',
                  color: autoScroll ? 'white' : 'black',
                }}
              >
                Auto
              </button>
            </div>

            <div className="debug-console-stats">
              {filteredLogs.length} / {logs.length} log
              {logs.filter(l => l.level === 'error').length > 0 && (
                <span style={{ color: '#ef4444', marginLeft: '8px' }}>
                  {logs.filter(l => l.level === 'error').length} hata
                </span>
              )}
            </div>

            <div className="debug-console-content" ref={logContainerRef}>
              {filteredLogs.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#858585' }}>
                  {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz log yok'}
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="debug-console-log"
                    style={{ borderLeftColor: getLevelColor(log.level) }}
                  >
                    <span className="debug-console-log-time">{formatTime(log.timestamp)}</span>
                    <span
                      className="debug-console-log-level"
                      style={{ color: getLevelColor(log.level) }}
                    >
                      {log.level}
                    </span>
                    <span className="debug-console-log-message">{log.message}</span>
                    {log.stack && (
                      <div className="debug-console-log-stack">{log.stack}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

