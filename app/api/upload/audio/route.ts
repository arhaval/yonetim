import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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

    // Dosya tipini kontrol et (ses dosyaları)
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/m4a']
    if (!allowedTypes.some(type => file.type.includes(type.split('/')[1]))) {
      return NextResponse.json(
        { error: 'Sadece ses dosyaları yüklenebilir (MP3, WAV, OGG, M4A)' },
        { status: 400 }
      )
    }

    // Dosya boyutunu kontrol et (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Dosya boyutu 50MB\'dan büyük olamaz' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Dosya adını oluştur (timestamp + orijinal ad)
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${originalName}`

    // Uploads klasörünü oluştur (yoksa)
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'audio')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Dosyayı kaydet
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, buffer)

    // Public URL'yi döndür
    const publicUrl = `/uploads/audio/${fileName}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
    })
  } catch (error) {
    console.error('Error uploading audio file:', error)
    return NextResponse.json(
      { error: 'Dosya yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}












