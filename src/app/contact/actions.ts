'use server'

import { auth } from '@/auth'
import { sendContactFormEmail } from '@/lib/email'
import { verifyRecaptcha } from '@/lib/recaptcha'

export type ContactFormState = {
  status: 'idle' | 'success' | 'error'
  message?: string
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

  try {
    const recaptchaOk = await verifyRecaptcha(recaptchaToken)
    if (!recaptchaOk) {
      return { status: 'error', message: 'CAPTCHA verification failed. Please try again.' }
    }

    const session = await auth()
    const isRegisteredUser = Boolean(session?.user?.id)
    await sendContactFormEmail({ name, email, subject, message, isRegisteredUser })

    return { status: 'success', message: "Thanks, I'll get back to you soon." }
  } catch (err) {
    console.error('Contact form send failed:', err)
    return { status: 'error', message: 'Something went wrong. Please try again or email me directly.' }
  }
}
