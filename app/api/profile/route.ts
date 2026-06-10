import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { upsertParentProfile } from "@/lib/db/parent-profiles";
import { ParentProfile } from "@/lib/parent-profile";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

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

export async function PUT(request: Request) {
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

  let body: { profile?: unknown };

  try {
    body = (await request.json()) as { profile?: unknown };
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が正しくありません。" },
      { status: 400 }
    );
  }

  if (!isValidProfile(body.profile)) {
    return NextResponse.json(
      { error: "プロフィールの形式が正しくありません。" },
      { status: 400 }
    );
  }

  const saved = await upsertParentProfile(userId, body.profile);

  if (!saved) {
    return NextResponse.json(
      { error: "プロフィールの保存に失敗しました。" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
