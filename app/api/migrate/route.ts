import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { StoredMessage } from "@/lib/conversation-storage";
import { replaceConversationsByUserId } from "@/lib/db/conversations";
import { upsertParentProfile } from "@/lib/db/parent-profiles";
import { ParentProfile } from "@/lib/parent-profile";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

type MigrateRequestBody = {
  profile: ParentProfile | null;
  messages: StoredMessage[];
};

function isValidProfile(profile: unknown): profile is ParentProfile {
  if (!profile || typeof profile !== "object") {
    return false;
  }

  const keys: (keyof ParentProfile)[] = [
    "consultTarget",
    "name",
    "age",
    "personality",
    "relationship",
    "hobbies",
    "avoidTopics",
  ];

  return keys.every((key) => key in profile);
}

function isValidMessages(messages: unknown): messages is StoredMessage[] {
  if (!Array.isArray(messages)) {
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

  let body: MigrateRequestBody;

  try {
    body = (await request.json()) as MigrateRequestBody;
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が正しくありません。" },
      { status: 400 }
    );
  }

  const { profile, messages } = body;

  if (!isValidMessages(messages)) {
    return NextResponse.json(
      { error: "会話データの形式が正しくありません。" },
      { status: 400 }
    );
  }

  if (profile !== null && !isValidProfile(profile)) {
    return NextResponse.json(
      { error: "プロフィールの形式が正しくありません。" },
      { status: 400 }
    );
  }

  if (!profile && messages.length === 0) {
    return NextResponse.json(
      { error: "保存するデータがありません。" },
      { status: 400 }
    );
  }

  if (profile) {
    const profileSaved = await upsertParentProfile(userId, profile);
    if (!profileSaved) {
      return NextResponse.json(
        { error: "プロフィールの保存に失敗しました。" },
        { status: 500 }
      );
    }
  }

  let conversationsSaved = true;

  if (messages.length > 0) {
    conversationsSaved = await replaceConversationsByUserId(userId, messages);
  }

  if (!conversationsSaved) {
    return NextResponse.json(
      { error: "会話の保存に失敗しました。" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
