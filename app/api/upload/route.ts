import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      )
    }

    // Dosya tipini kontrol et
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Sadece resim dosyaları yüklenebilir' },
        { status: 400 }
      )
    }

    // Dosya boyutunu kontrol et (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Dosya boyutu 5MB\'dan büyük olamaz' },
        { status: 400 }
      )
    }

    // Dosyayı base64'e çevir
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    
    // Data URL oluştur
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json({
      success: true,
      url: dataUrl,
      fileName: file.name,
    })
  } catch (error: any) {
    console.error('Error uploading file:', error)
    const errorMessage = error?.message || 'Dosya yüklenirken bir hata oluştu'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}










