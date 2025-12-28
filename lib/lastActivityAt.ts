/**
 * lastActivityAt Helper Functions
 * 
 * Her model için en son aktivite tarihini hesaplar.
 * lastActivityAt = GREATEST(createdAt, updatedAt, action timestamps...)
 */

/**
 * VoiceoverScript için lastActivityAt hesapla
 */
export function getVoiceoverScriptLastActivityAt(script: {
  createdAt: Date | string
  updatedAt: Date | string
  producerApprovedAt?: Date | string | null
  adminApprovedAt?: Date | string | null
}): Date {
  const dates: Date[] = [
    new Date(script.createdAt),
    new Date(script.updatedAt),
  ]
  
  if (script.producerApprovedAt) {
    dates.push(new Date(script.producerApprovedAt))
  }
  
  if (script.adminApprovedAt) {
    dates.push(new Date(script.adminApprovedAt))
  }
  
  return new Date(Math.max(...dates.map(d => d.getTime())))
}

/**
 * Stream için lastActivityAt hesapla
 */
export function getStreamLastActivityAt(stream: {
  createdAt: Date | string
  updatedAt: Date | string
  date?: Date | string
}): Date {
  const dates: Date[] = [
    new Date(stream.createdAt),
    new Date(stream.updatedAt),
  ]
  
  if (stream.date) {
    dates.push(new Date(stream.date))
  }
  
  return new Date(Math.max(...dates.map(d => d.getTime())))
}

/**
 * Content için lastActivityAt hesapla
 */
export function getContentLastActivityAt(content: {
  createdAt: Date | string
  updatedAt: Date | string
  publishDate?: Date | string
}): Date {
  const dates: Date[] = [
    new Date(content.createdAt),
    new Date(content.updatedAt),
  ]
  
  if (content.publishDate) {
    dates.push(new Date(content.publishDate))
  }
  
  return new Date(Math.max(...dates.map(d => d.getTime())))
}

/**
 * FinancialRecord için lastActivityAt hesapla
 */
export function getFinancialRecordLastActivityAt(record: {
  createdAt: Date | string
  updatedAt: Date | string
  occurredAt?: Date | string
  date?: Date | string
}): Date {
  const dates: Date[] = [
    new Date(record.createdAt),
    new Date(record.updatedAt),
  ]
  
  if (record.occurredAt) {
    dates.push(new Date(record.occurredAt))
  }
  
  if (record.date) {
    dates.push(new Date(record.date))
  }
  
  return new Date(Math.max(...dates.map(d => d.getTime())))
}

/**
 * Payment için lastActivityAt hesapla
 */
export function getPaymentLastActivityAt(payment: {
  createdAt: Date | string
  updatedAt: Date | string
  paidAt?: Date | string | null
}): Date {
  const dates: Date[] = [
    new Date(payment.createdAt),
    new Date(payment.updatedAt),
  ]
  
  if (payment.paidAt) {
    dates.push(new Date(payment.paidAt))
  }
  
  return new Date(Math.max(...dates.map(d => d.getTime())))
}

/**
 * TeamPayment için lastActivityAt hesapla
 */
export function getTeamPaymentLastActivityAt(payment: {
  createdAt: Date | string
  updatedAt: Date | string
  paidAt?: Date | string | null
}): Date {
  const dates: Date[] = [
    new Date(payment.createdAt),
    new Date(payment.updatedAt),
  ]
  
  if (payment.paidAt) {
    dates.push(new Date(payment.paidAt))
  }
  
  return new Date(Math.max(...dates.map(d => d.getTime())))
}

/**
 * Generic lastActivityAt hesapla - updatedAt veya createdAt'ten büyük olanı
 */
export function getGenericLastActivityAt(entity: {
  createdAt: Date | string
  updatedAt: Date | string
}): Date {
  const createdAt = new Date(entity.createdAt)
  const updatedAt = new Date(entity.updatedAt)
  return createdAt > updatedAt ? createdAt : updatedAt
}

