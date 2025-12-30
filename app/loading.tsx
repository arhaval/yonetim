// Minimal loading state - sadece subtle indicator
export default function Loading() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse" style={{ width: '30%' }} />
    </div>
  )
}

