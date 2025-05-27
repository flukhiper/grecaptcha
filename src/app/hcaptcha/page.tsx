'use client';
import { useState, useRef } from 'react';
import Script from 'next/script';

export default function HcaptchaPage () {
  const [ token, setToken ] = useState(null);
  const [ message, setMessage ] = useState('');
  const widgetId = useRef(null);

  // Callback for successful captcha
  const onVerify = (token) => {
    setToken(token);
    setMessage('Captcha completed!');
  };

  // Load and render hCaptcha when script is ready
  const onLoad = () => {
    if (typeof window !== 'undefined' && window.hcaptcha && widgetId.current === null) {
      widgetId.current = window.hcaptcha.render('hcaptcha-container', {
        sitekey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY,
        callback: onVerify,
        'error-callback': () => setMessage('Captcha error, please try again.'),
        'expired-callback': () => {
          setToken(null);
          setMessage('Captcha expired, please complete again.');
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage('Please complete the captcha first.');
      return;
    }

    const res = await fetch('/api/verify-h', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    const data = await res.json();
    console.log('response', data);

    if (data.allow) {
      setMessage('Captcha verified on server!');
    } else {
      setMessage('Captcha verification failed, try again.');
      if (window.hcaptcha && widgetId.current !== null) {
        window.hcaptcha.reset(widgetId.current);
      }
      setToken(null);
    }
  };

  return (
    <>
      <Script
        src="https://js.hcaptcha.com/1/api.js?render=explicit"
        onLoad={onLoad}
        strategy="afterInteractive"
      />
      <form onSubmit={handleSubmit}>
        <div id="hcaptcha-container"></div>
        <button type="submit">Submit</button>
      </form>
      <p>{message}</p>
    </>
  );
}
