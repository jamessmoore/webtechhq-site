'use server'

import { sendContactFormEmail } from '@/lib/email'

export type ContactFormState = {
  status: 'idle' | 'success' | 'error'
  message?: string
}

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret || !token) return false

  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  })

  const data = await res.json()
  return data.success === true
}

export async function sendContactMessage(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = formData.get('name')?.toString().trim() ?? ''
  const email = formData.get('email')?.toString().trim() ?? ''
  const subject = formData.get('subject')?.toString().trim() ?? ''
  const message = formData.get('message')?.toString().trim() ?? ''
  const recaptchaToken = formData.get('recaptchaToken')?.toString() ?? ''

  if (!name || !email || !subject || !message) {
    return { status: 'error', message: 'Please fill out all fields.' }
  }

  const recaptchaOk = await verifyRecaptcha(recaptchaToken)
  if (!recaptchaOk) {
    return { status: 'error', message: 'CAPTCHA verification failed. Please try again.' }
  }

  try {
    await sendContactFormEmail({ name, email, subject, message })

    return { status: 'success', message: "Thanks, I'll get back to you soon." }
  } catch (err) {
    console.error('Contact form send failed:', err)
    return { status: 'error', message: 'Something went wrong. Please try again or email me directly.' }
  }
}
