import { NextResponse } from "next/server";
import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { buildSystemPrompt } from "@/lib/chat-prompt";
import { getConversationsByUserId } from "@/lib/db/conversations";
import { getParentProfileByUserId } from "@/lib/db/parent-profiles";
import { ParentProfile } from "@/lib/parent-profile";
import { isSupabaseConfigured } from "@/lib/supabase-admin";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  profile: ParentProfile;
  messages: ChatMessage[];
};

const MODEL = "claude-sonnet-4-6";

function toChatMessages(
  messages: Array<{ role: string; content: string }>
): ChatMessage[] {
  return messages
    .filter(
      (message) =>
        (message.role === "user" || message.role === "assistant") &&
        message.content.trim()
    )
    .map((message) => ({
      role: message.role as "user" | "assistant",
      content: message.content.trim(),
    }));
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "APIキーが設定されていません。" },
      { status: 500 }
    );
  }

  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が正しくありません。" },
      { status: 400 }
    );
  }

  let { profile, messages } = body;

  if (!profile || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "プロフィールまたはメッセージが不足しています。" },
      { status: 400 }
    );
  }

  const userId = await resolveUserId();

  if (userId && isSupabaseConfigured()) {
    const dbProfile = await getParentProfileByUserId(userId);
    if (dbProfile) {
      profile = dbProfile;
    }

    const dbMessages = toChatMessages(
      (await getConversationsByUserId(userId)).map((message) => ({
        role: message.role,
        content: message.content,
      }))
    );

    const clientMessages = toChatMessages(messages);

    if (dbMessages.length >= clientMessages.length) {
      messages = dbMessages;
    } else {
      messages = clientMessages;
    }
  } else {
    messages = toChatMessages(messages);
  }

  if (messages.length === 0) {
    return NextResponse.json(
      { error: "送信できるメッセージがありません。" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        thinking: { type: "adaptive" },
        output_config: { effort: "low" },
        system: buildSystemPrompt(profile, { isLoggedIn: Boolean(userId) }),
        messages,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Anthropic API error:", response.status, errorBody);
      return NextResponse.json(
        { error: "AIからの返答を取得できませんでした。" },
        { status: 502 }
      );
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };

    const reply = data.content?.find((block) => block.type === "text")?.text;

    if (!reply) {
      return NextResponse.json(
        { error: "AIからの返答が空でした。" },
        { status: 502 }
      );
    }

    return NextResponse.json({ message: reply.trim() });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "通信中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}
