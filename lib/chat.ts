import { MessageRecord } from './db';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export function buildPrompt(messages: MessageRecord[]): ChatMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.content
  }));
}

export async function callOpenRouter(messages: ChatMessage[]) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured.');
  }

  const model = process.env.OPENROUTER_MODEL || 'nousresearch/nous-hermes-llama2-13b';

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.APP_BASE_URL || 'http://localhost:3000',
      'X-Title': 'Uncensored AI Chat',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 600
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${errorText}`);
  }

  const json = await response.json();
  const reply = json.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new Error('OpenRouter returned an empty response.');
  }

  return reply;
}
