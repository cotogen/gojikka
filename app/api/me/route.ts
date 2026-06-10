import { resolveUserId } from "@/lib/auth/resolve-user-id";
import { getConversationsByUserId } from "@/lib/db/conversations";
import { getParentProfileByUserId } from "@/lib/db/parent-profiles";
import { isSupabaseConfigured } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function GET() {
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

  const [profile, messages] = await Promise.all([
    getParentProfileByUserId(userId),
    getConversationsByUserId(userId),
  ]);

  return NextResponse.json({
    profile,
    messages,
  });
}
