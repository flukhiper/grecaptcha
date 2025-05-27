// app/api/verify-captcha/route.ts
import { NextResponse } from 'next/server';

export async function POST (req: Request) {
  const { token } = await req.json();

  const secret = process.env.NEXT_PUBLIC_GOOGLE_V3_SECRET_KEY || '';

  const formData = new URLSearchParams();
  formData.append('secret', secret);
  formData.append('response', token);

  const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: formData.toString()
  });

  const data = await verifyRes.json();
  console.log('CAPTCHA V3 verification response:', data);

  if (data.success) {
    return NextResponse.json({ allow: data.success && data.score >= 0.5, message: '✅ CAPTCHA verified successfully' });
  } else {
    return NextResponse.json({ message: '❌ CAPTCHA failed', error: data }, { status: 400 });
  }
}
