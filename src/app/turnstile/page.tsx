'use client';
import Script from 'next/script';


export default function TurnstilePage () {
  return (
    <>
      {/* Load Turnstile API */}
      <Script
        src={'https://challenges.cloudflare.com/turnstile/v0/api.js'}
        strategy="afterInteractive"
      />
      <form action="/api/verify-turnstile" method="POST">
        <input name="email" type="email" required placeholder="Email" />
        {/* The actual widget */}
        <div
          className="cf-turnstile"
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_INVISIBLE_SITE_KEY} // test sitekey
          data-action="login"
          data-theme="light"
        />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}