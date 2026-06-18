import { NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { messages, profile } = await request.json();
    const msgs = Array.isArray(messages) ? messages : [];

    const systemContent = `You are "PrepMentor", a 24/7 AI academic mentor for the Preparation AI platform.
You help students preparing for competitive exams (${profile?.examGoal || 'JEE Main / NEET / GRE / etc.'}) with:
- Explaining concepts and doubts across Physics, Chemistry, Math, Biology, English, Reasoning
- Analysing their mock test performance and giving specific improvement tips
- Creating study plans (daily/weekly/monthly)
- Motivating them when they feel burnt out or anxious
- Suggesting learning strategies, time management and focus techniques

Be concise, warm, practical and exam-focused. Use short paragraphs and bullet points where helpful.
Limit response to 250 words unless asked otherwise. Never invent fake scores; if the user shares their performance, reason from it.`;

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      model: 'glm-4.6',
      stream: false,
      messages: [
        { role: 'system', content: systemContent },
        ...msgs.map((m: { role: string; content: string }) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
    });

    const reply = completion?.choices?.[0]?.message?.content || 'I am here to help. Could you rephrase your question?';
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json(
      { reply: `I'm having trouble connecting right now, but I'm still here for you. Quick tip: revise your weakest topic today and do 10 practice problems. (${(e as Error).message})` },
      { status: 200 }
    );
  }
}
