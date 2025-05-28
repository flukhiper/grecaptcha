import { NextResponse } from 'next/server';

export async function POST (req: Request) {
  const body = await req.text();
  const params = new URLSearchParams(body);
  
  const token = params.get('cf-turnstile-response') || '';

  const secret = process.env.NEXT_PUBLIC_TURNSTILE_INVISIBLE_SECRET_KEY || '';

  const formData = new URLSearchParams();
  formData.append('secret', secret);
  formData.append('response', token);

  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData.toString()
  });

  const data = await verifyRes.json();
  console.log('CAPTCHA verification response:', data);

  if (data.success) {
    return NextResponse.json({ success: true, message: '✅ CAPTCHA verified successfully' });
  } else {
    return NextResponse.json({ message: '❌ CAPTCHA failed', error: data }, { status: 400 });
  }
}
