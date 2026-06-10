import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { StoredMessage } from "@/lib/conversation-storage";
import {
  appendConversationMessages,
  deleteAllConversationsByUserId,
  deleteUserMessageByUserId,
} from "@/lib/db/conversations";
import { deleteParentProfileByUserId } from "@/lib/db/parent-profiles";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

function isValidMessages(messages: unknown): messages is StoredMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) {
    return false;
  }

  return messages.every(
    (message) =>
      message &&
      typeof message === "object" &&
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string" &&
      typeof message.createdAt === "string"
  );
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "データベースが設定されていません。" },
      { status: 503 }
    );
  }

  const userId = await resolveUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "ログインが必要です。" },
      { status: 401 }
    );
  }

  let body: { messages?: unknown };

  try {
    body = (await request.json()) as { messages?: unknown };
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が正しくありません。" },
      { status: 400 }
    );
  }

  if (!isValidMessages(body.messages)) {
    return NextResponse.json(
      { error: "会話データの形式が正しくありません。" },
      { status: 400 }
    );
  }

  const saved = await appendConversationMessages(userId, body.messages);

  if (!saved) {
    return NextResponse.json(
      { error: "会話の保存に失敗しました。" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "データベースが設定されていません。" },
      { status: 503 }
    );
  }

  const userId = await resolveUserId();

  if (!userId) {
    return NextResponse.json(
      { error: "ログインが必要です。" },
      { status: 401 }
    );
  }

  const url = new URL(request.url);

  if (url.searchParams.get("reset") === "true") {
    const [conversationsDeleted, profileDeleted] = await Promise.all([
      deleteAllConversationsByUserId(userId),
      deleteParentProfileByUserId(userId),
    ]);

    if (!conversationsDeleted || !profileDeleted) {
      return NextResponse.json(
        { error: "会話のリセットに失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  }

  let body: { createdAt?: string; content?: string };

  try {
    body = (await request.json()) as { createdAt?: string; content?: string };
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が正しくありません。" },
      { status: 400 }
    );
  }

  const { createdAt, content } = body;

  if (!createdAt || !content) {
    return NextResponse.json(
      { error: "削除するメッセージが指定されていません。" },
      { status: 400 }
    );
  }

  const deleted = await deleteUserMessageByUserId(userId, createdAt, content);

  if (!deleted) {
    return NextResponse.json(
      { error: "メッセージの削除に失敗しました。" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
