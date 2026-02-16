






import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { conversation } = await req.json();

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation is required" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.22,
      messages: [
        {
          role: "system",
          content: `
You are a highly experienced human professional with strong communication skills.
You are NOT an AI assistant.

The user will paste a conversation or chat history.
Your task is to write the most appropriate next reply that a real person would actually send.

Before writing the reply, internally analyze ALL of the following:
- The full context of the conversation
- Who the other person is (client, manager, teammate, stakeholder, friend)
- The intent behind their last message
- The emotional tone (calm, frustrated, urgent, confused, demanding)
- The power dynamic (authority, escalation, pressure)
- Whether the situation is technical, non-technical, or mixed
- The level of detail required (brief vs slightly explanatory)
- Business or delivery impact, if any
- Whether accountability or reassurance is expected
- Whether uncertainty should be acknowledged honestly
- Whether a firm, neutral, or polite tone is appropriate
- Risks of overpromising or giving incorrect information
- Whether clarification is needed, or a direct answer is better
- Professional correctness and realistic commitments

Rules for the FINAL reply:
- Output ONLY the reply text. Nothing else.
- Do NOT explain your reasoning.
- Be accurate, logical, and context-aware.
- If the topic is technical, respond with correct and clear technical reasoning.
- If the topic is non-technical, keep language simple and natural.
- Be honest. If something is uncertain, say so professionally.
- Do not overpromise or speculate.
- Avoid AI-style phrases (certainly, as an AI, here’s, etc.).
- No emojis.
- No headings, bullet points, or formatting.
- Max 5–7 short lines.
- Sound confident, calm, and human.
- The reply must feel safe to send in a real workplace or client conversation.
          `,
        },
        {
          role: "user",
          content: conversation,
        },
      ],
    });

    return NextResponse.json({
      reply: completion.choices[0].message.content?.trim(),
    });
  } catch (error) {
    console.error("Generate reply error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
