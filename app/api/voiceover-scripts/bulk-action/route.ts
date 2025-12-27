import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { createAuditLog } from '@/lib/audit-log'

type BulkAction = 'approve' | 'reject' | 'pay' | 'archive'

// Toplu işlem endpoint'i (sadece admin/manager)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user-id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    // Admin/Manager kontrolü
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
      return NextResponse.json(
        { error: 'Bu işlem için admin veya manager yetkisi gerekmektedir' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { ids, action, reason, price } = body

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'En az bir kayıt seçilmelidir' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject', 'pay', 'archive'].includes(action)) {
      return NextResponse.json(
        { error: 'Geçersiz aksiyon' },
        { status: 400 }
      )
    }

    // Seçilen scriptleri kontrol et
    const scripts = await prisma.voiceoverScript.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        voiceActor: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (scripts.length === 0) {
      return NextResponse.json(
        { error: 'Seçilen kayıtlar bulunamadı' },
        { status: 404 }
      )
    }

    const results: {
      success: string[]
      failed: Array<{ id: string; reason: string }>
    } = {
      success: [],
      failed: [],
    }

    // Her script için işlemi gerçekleştir
    for (const script of scripts) {
      try {
        let updateData: any = {}
        let shouldUpdate = true
        let errorMessage = ''

        switch (action) {
          case 'approve':
            if (!script.audioFile) {
              errorMessage = 'Ses dosyası yüklenmemiş'
              shouldUpdate = false
              break
            }
            if (script.status !== 'VOICE_UPLOADED') {
              errorMessage = 'Sadece ses yüklenmiş metinler onaylanabilir'
              shouldUpdate = false
              break
            }
            if (!price || price <= 0) {
              errorMessage = 'Geçerli bir ücret girin'
              shouldUpdate = false
              break
            }
            updateData = {
              status: 'APPROVED',
              price: price,
            }
            break

          case 'reject':
            if (!reason || reason.trim() === '') {
              errorMessage = 'Reddetme nedeni gereklidir'
              shouldUpdate = false
              break
            }
            updateData = {
              status: 'REJECTED',
              rejectionReason: reason.trim(),
            }
            break

          case 'pay':
            if (script.status !== 'APPROVED') {
              errorMessage = 'Sadece onaylanmış metinler ödendi olarak işaretlenebilir'
              shouldUpdate = false
              break
            }
            if (!script.price || script.price <= 0) {
              errorMessage = 'Metin için ücret girilmemiş'
              shouldUpdate = false
              break
            }
            updateData = {
              status: 'PAID',
            }
            break

          case 'archive':
            updateData = {
              status: 'ARCHIVED',
            }
            break
        }

        if (!shouldUpdate) {
          results.failed.push({
            id: script.id,
            reason: errorMessage,
          })
          continue
        }

        // Eski değerleri kaydet (audit log için)
        const oldValue = {
          status: script.status,
          price: script.price,
          rejectionReason: script.rejectionReason,
        }

        // Güncelle
        const updatedScript = await prisma.voiceoverScript.update({
          where: { id: script.id },
          data: updateData,
        })

        // Finansal kayıt oluştur (approve ve pay için)
        if (action === 'approve' && script.voiceActorId) {
          try {
            await prisma.financialRecord.create({
              data: {
                type: 'expense',
                category: 'voiceover',
                amount: price,
                description: `Seslendirme: ${script.title} - ${script.voiceActor?.name || 'Bilinmeyen'}`,
                date: new Date(),
                voiceActorId: script.voiceActorId,
              },
            })
          } catch (financialError: any) {
            console.error('Finansal kayıt oluşturma hatası:', financialError)
            // Finansal kayıt oluşturulamasa bile metin onaylanmış olarak kalmalı
          }
        } else if (action === 'pay' && script.voiceActorId) {
          try {
            await prisma.financialRecord.create({
              data: {
                type: 'expense',
                category: 'voiceover',
                amount: script.price,
                description: `Seslendirme ücreti - ${script.title}${script.voiceActor ? ` (${script.voiceActor.name})` : ''}`,
                date: new Date(),
                voiceActorId: script.voiceActorId,
              },
            })
          } catch (financialError: any) {
            console.error('Finansal kayıt oluşturma hatası:', financialError)
          }
        }

        // Audit log
        await createAuditLog({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          action: `script_${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'pay' ? 'paid' : 'archived'}` as any,
          entityType: 'VoiceoverScript',
          entityId: script.id,
          oldValue,
          newValue: {
            status: updatedScript.status,
            price: updatedScript.price,
            rejectionReason: updatedScript.rejectionReason,
          },
          details: {
            title: script.title,
            bulkAction: true,
            totalSelected: ids.length,
          },
        })

        results.success.push(script.id)
      } catch (error: any) {
        results.failed.push({
          id: script.id,
          reason: error.message || 'Bilinmeyen hata',
        })
      }
    }

    return NextResponse.json({
      message: `${results.success.length} kayıt başarıyla işlendi${results.failed.length > 0 ? `, ${results.failed.length} kayıt başarısız oldu` : ''}`,
      results,
    })
  } catch (error: any) {
    console.error('Error performing bulk action:', error)
    return NextResponse.json(
      { error: error.message || 'Toplu işlem başarısız oldu' },
      { status: 500 }
    )
  }
}

