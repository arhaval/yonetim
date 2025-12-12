'use client'

export default function TestInputPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Input Test Sayfası</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test Input:</label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full"
            placeholder="Buraya yazabilir misiniz?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Test Textarea:</label>
          <textarea
            className="border border-gray-300 rounded p-2 w-full"
            placeholder="Buraya yazabilir misiniz?"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Test Select:</label>
          <select className="border border-gray-300 rounded p-2 w-full">
            <option value="">Seçin</option>
            <option value="1">Seçenek 1</option>
            <option value="2">Seçenek 2</option>
          </select>
        </div>
      </div>
    </div>
  )
}





