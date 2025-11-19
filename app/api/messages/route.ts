import { NextResponse } from 'next/server';
import { getMessages } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId') || 'default';
  const messages = getMessages(sessionId);
  return NextResponse.json({ messages });
}
