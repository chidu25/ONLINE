import { NextResponse } from 'next/server';
import { addMessage, getMessages } from '@/lib/db';
import { buildPrompt, callOpenRouter } from '@/lib/chat';

export async function POST(request: Request) {
  const body = await request.json();
  const { prompt, sessionId = 'default', modelId } = body as {
    prompt?: string;
    sessionId?: string;
    modelId?: string;
  };

  if (!prompt || !prompt.trim()) {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
  }

  const cleanPrompt = prompt.trim();
  addMessage(sessionId, 'user', cleanPrompt);

  const history = getMessages(sessionId);
  try {
    const { reply, model } = await callOpenRouter(buildPrompt(history), modelId);
    addMessage(sessionId, 'assistant', reply);
    const messages = getMessages(sessionId);
    return NextResponse.json({ reply, messages, model });
  } catch (error) {
    addMessage(
      sessionId,
      'assistant',
      'I hit a temporary issue reaching OpenRouter. Please try again in a moment.'
    );
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
