import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  const db = getServerClient();
  if (!db) return NextResponse.json({ error: 'Contact service has not been configured.' }, { status: 503 });
  const origin = req.headers.get('origin');
  if (origin) {
    try { if (new URL(origin).host !== req.nextUrl.host) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 }); }
    catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 403 }); }
  }
  let payload: Record<string, unknown>;
  try { payload = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request data.' }, { status: 400 }); }
  if (payload.website) return NextResponse.json({ ok: true }); // honeypot
  const name = String(payload.name ?? '').trim();
  const email = String(payload.email ?? '').trim();
  const service = String(payload.service ?? '').trim();
  const message = String(payload.message ?? '').trim();
  if (name.length < 2 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200 || service.length > 120 || message.length < 10 || message.length > 3000) {
    return NextResponse.json({ error: 'Please check your name, email and message.' }, { status: 400 });
  }
  const { error } = await db.from('enquiries').insert({ name, email, service, message, status: 'new' });
  if (error) return NextResponse.json({ error: 'Unable to send enquiry. Please try WhatsApp instead.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
