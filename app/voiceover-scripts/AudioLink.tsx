'use client'

import { Download } from 'lucide-react'

export default function AudioLink({ audioFile, className }: { audioFile: string, className?: string }) {
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <a
        href={audioFile}
        target="_blank"
        rel="noopener noreferrer"
        className={className || "inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-600 to-yellow-600 text-white text-sm font-medium rounded-lg hover:from-orange-700 hover:to-yellow-700 transition-all duration-200"}
      >
        <Download className="w-4 h-4 mr-2" />
        Ses Dinle
      </a>
    </div>
  )
}

