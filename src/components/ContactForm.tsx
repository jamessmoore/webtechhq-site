'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { sendContactMessage, type ContactFormState } from '@/app/contact/actions'

const initialState: ContactFormState = { status: 'idle' }

const labelStyle = {
  color: '#FFFFFF',
}

const fieldStyle = {
  backgroundColor: '#143C6A',
  border: '0.8px solid #162D5A',
  color: '#EEF6FF',
  borderRadius: '2px',
}

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialState)
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const [lastStatus, setLastStatus] = useState(state.status)

  if (state.status !== lastStatus) {
    setLastStatus(state.status)
    if (state.status === 'success') {
      setRecaptchaToken('')
    }
  }

  useEffect(() => {
    if (state.status === 'success') {
      recaptchaRef.current?.reset()
    }
  }, [state.status])

  return (
    <form action={formAction} className="flex flex-col gap-[5px]">
      <div>
        <label htmlFor="name" className="font-sans text-[18px] tracking-widest mb-2 block" style={labelStyle}>
          NAME
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full px-3 py-2 font-sans text-[14px] focus:outline-none"
          style={fieldStyle}
        />
      </div>

      <div>
        <label htmlFor="email" className="font-sans text-[18px] tracking-widest mb-2 block" style={labelStyle}>
          EMAIL
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full px-3 py-2 font-sans text-[14px] focus:outline-none"
          style={fieldStyle}
        />
      </div>

      <div>
        <label htmlFor="interest" className="font-sans text-[13px] md:text-[18px] tracking-widest mb-2 block" style={labelStyle}>
          WHAT ARE YOU MOST INTERESTED IN?
        </label>
        <select
          id="interest"
          name="interest"
          defaultValue=""
          className="w-full px-3 py-2 font-sans text-[14px] focus:outline-none"
          style={fieldStyle}
        >
          <option value="">Select one…</option>
          <option value="Business Analytics">Business Analytics</option>
          <option value="AI Consulting & Agent Development">AI Consulting &amp; Agent Development</option>
          <option value="Intelligent Automation">Intelligent Automation</option>
          <option value="DevOps & Cloud Infrastructure Audits">DevOps &amp; Cloud Infrastructure Audits</option>
          <option value="SaaS Development">SaaS Development</option>
          <option value="Cloud Management">Cloud Management</option>
          <option value="SRE Contract — Remote, Senior">SRE Contract — Remote, Senior</option>
          <option value="Something else">Something else</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="font-sans text-[18px] tracking-widest mb-2 block" style={labelStyle}>
          MESSAGE
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="w-full px-3 py-2 font-sans text-[14px] leading-relaxed focus:outline-none resize-none"
          style={fieldStyle}
        />
      </div>

      <input type="hidden" name="recaptchaToken" value={recaptchaToken} />
      {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? (
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
          onChange={(value) => setRecaptchaToken(value ?? '')}
          onExpired={() => setRecaptchaToken('')}
          theme="dark"
        />
      ) : (
        <p className="font-sans text-[9px] tracking-widest" style={{ color: '#E0556F' }}>
          reCAPTCHA not configured — set NEXT_PUBLIC_RECAPTCHA_SITE_KEY
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !recaptchaToken}
        className="font-sans font-bold text-[16px] tracking-widest px-7 py-3 mt-[4px] transition-all duration-200 self-start disabled:opacity-50 hover:[box-shadow:0_0_10px_2px_rgba(61,127,212,0.45),0_0_24px_6px_rgba(137,212,255,0.25)] hover:!text-white"
        style={{ backgroundColor: '#238636', border: '1px solid #238636', color: '#FFFFFF', borderRadius: '6px' }}
      >
        {pending ? 'SENDING…' : 'SEND MESSAGE ›'}
      </button>

      {state.status !== 'idle' && (
        <p
          className="font-sans text-[11px] leading-relaxed"
          style={{ color: state.status === 'success' ? '#89D4FF' : '#E0556F' }}
        >
          {state.message}
        </p>
      )}
    </form>
  )
}
