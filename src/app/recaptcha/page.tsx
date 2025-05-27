'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';

const V3_SITE_KEY = 'YOUR_V3_SITE_KEY';
const V2_SITE_KEY = 'YOUR_V2_SITE_KEY';

export default function HomePage () {
  const [ email, setEmail ] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  // This will be the callback for v2 invisible recaptcha
  const onV2Verified = async (token: string) => {
    try {
      const response = await fetch('/api/verify-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        // Submit the form after v2 verification
        console.log('reCAPTCHA v2 verified successfully');
      } else {
        alert('reCAPTCHA v2 verification failed');
      }
    } catch (error) {
      alert('Error verifying reCAPTCHA v2');
    }
  };

  // Expose onV2Verified globally for Google reCAPTCHA to call
  useEffect(() => {
    (window as any).onV2Verified = onV2Verified;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!window.grecaptcha) {
      alert('reCAPTCHA not loaded yet');
      return;
    }

    try {
      // Run reCAPTCHA v3 with action 'submit'
      const token = await window.grecaptcha.execute(process.env.NEXT_PUBLIC_GOOGLE_V3_SITE_KEY, { action: 'submit' });

      // Send v3 token to backend for verification
      const response = await fetch('/api/verify-v3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const result = await response.json();
      console.log('reCAPTCHA v3 result:', result);

      if (!result.allow) {
        // Safe to submit directly
        console.log('reCAPTCHA v3 verified successfully');
      } else {
        // Fallback: trigger invisible v2 challenge
        window.grecaptcha.execute();
      }
    } catch (error) {
      console.error('Error running reCAPTCHA v3:', error);
      alert('Error running reCAPTCHA');
    }
  };

  return (
    <>
      {/* Load reCAPTCHA v3 */}
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_GOOGLE_V3_SITE_KEY}`}
        strategy="afterInteractive"
      />

      {/* Load reCAPTCHA v2 Invisible */}
      <Script
        src="https://www.google.com/recaptcha/api.js"
        strategy="afterInteractive"
      />

      <form id="yourForm" ref={formRef} onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Submit</button>

        {/* Invisible reCAPTCHA v2 widget */}
        <div
          className="g-recaptcha"
          data-sitekey={process.env.NEXT_PUBLIC_GOOGLE_V2_SITE_KEY}
          data-callback="onV2Verified"
          data-size="invisible"
        ></div>
      </form>
    </>
  );
}