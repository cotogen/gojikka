"use client";

import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ChatUserMessage from "@/app/components/ChatUserMessage";
import SaveConversationButton from "@/app/components/SaveConversationButton";
import {
  clearGuestData,
  loadConversation,
  saveConversation,
  StoredMessage,
} from "@/lib/conversation-storage";
import { formatMessageTime } from "@/lib/format-datetime";
import {
  loadParentProfile,
  ParentProfile,
} from "@/lib/parent-profile";

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
  createdAt: string;
};

function toMessage(stored: StoredMessage, index: number): Message {
  return {
    id: `${stored.role}-${index}-${stored.createdAt}`,
    role: stored.role,
    text: stored.content,
    createdAt: stored.createdAt,
  };
}

function toStored(messages: Message[]): StoredMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: message.text,
    createdAt: message.createdAt,
  }));
}

async function persistConversationPair(
  userMessage: StoredMessage,
  assistantMessage: StoredMessage
) {
  try {
    await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [userMessage, assistantMessage],
      }),
    });
  } catch {
    // 会話表示は続行。保存失敗は次回以降の DB 同期でカバー
  }
}

export default function ChatScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [ready, setReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadedFromDb, setLoadedFromDb] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("saved") === "1") {
      setSavedNotice(true);
      window.history.replaceState(null, "", "/chat");
    }
  }, [searchParams]);

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    async function init() {
      const loggedIn = Boolean(session?.user?.lineUserId);
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        try {
          const response = await fetch("/api/me");
          if (response.ok) {
            const data = (await response.json()) as {
              profile: ParentProfile | null;
              messages: StoredMessage[];
            };

            if (data.profile) {
              setProfile(data.profile);
              setMessages(data.messages.map(toMessage));
              setLoadedFromDb(true);
              setReady(true);
              return;
            }
          }
        } catch {
          // ゲスト用 localStorage にフォールバック
        }
      }

      setLoadedFromDb(false);

      const saved = loadParentProfile();
      if (!saved) {
        router.replace("/profile");
        return;
      }

      setProfile(saved);
      setMessages(loadConversation().map(toMessage));
      setReady(true);
    }

    init();
  }, [router, session, sessionStatus]);

  useEffect(() => {
    if (!ready || isLoggedIn) return;
    saveConversation(toStored(messages));
  }, [messages, ready, isLoggedIn]);

  async function handleDeleteUserMessage(message: Message) {
    const nextMessages = messages.filter((item) => item.id !== message.id);
    setMessages(nextMessages);
    setError(null);

    if (isLoggedIn) {
      try {
        const response = await fetch("/api/conversations", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            createdAt: message.createdAt,
            content: message.text,
          }),
        });

        if (!response.ok) {
          throw new Error("削除に失敗しました。");
        }
      } catch (err) {
        setMessages(messages);
        setError(
          err instanceof Error ? err.message : "メッセージの削除に失敗しました。"
        );
      }
      return;
    }

    saveConversation(toStored(nextMessages));
  }

  async function handleResetConversation() {
    if (
      !window.confirm(
        "会話をすべてリセットします。プロフィール入力からやり直します。よろしいですか？"
      )
    ) {
      return;
    }

    setResetting(true);
    setError(null);

    try {
      if (isLoggedIn) {
        const response = await fetch("/api/conversations?reset=true", {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("リセットに失敗しました。");
        }
      }

      clearGuestData();
      router.push("/profile");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "会話のリセットに失敗しました。"
      );
      setResetting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || !profile || sending || resetting) return;

    const createdAt = new Date().toISOString();
    const userMessage: Message = {
      id: `user-${createdAt}`,
      role: "user",
      text,
      createdAt,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.text,
          })),
        }),
      });

      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "返答を取得できませんでした。");
      }

      if (!data.message) {
        throw new Error("返答を取得できませんでした。");
      }

      const replyCreatedAt = new Date().toISOString();
      const assistantMessage: Message = {
        id: `assistant-${replyCreatedAt}`,
        role: "assistant",
        text: data.message,
        createdAt: replyCreatedAt,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (isLoggedIn) {
        await persistConversationPair(
          { role: "user", content: text, createdAt },
          {
            role: "assistant",
            content: data.message,
            createdAt: replyCreatedAt,
          }
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "返答を取得できませんでした。"
      );
    } finally {
      setSending(false);
    }
  }

  const showWelcomeBack = isLoggedIn && loadedFromDb && !savedNotice;
  const actionDisabled = sending || resetting;

  if (!ready || !profile) {
    return (
      <p className="text-[0.9375rem] leading-[2] gojikka-muted">
        読み込み中…
      </p>
    );
  }

  return (
    <div className="gojikka-chat">
      {savedNotice && (
        <p className="mb-8 text-[0.875rem] leading-[1.8] gojikka-muted">
          会話を保存しました。
        </p>
      )}

      {showWelcomeBack && (
        <p className="mb-8 text-[0.9375rem] leading-[2] gojikka-muted">
          おかえりなさい。
          <br />
          前回の続きから、話を再開できます。
        </p>
      )}

      <div className="gojikka-chat-messages">
        {messages.map((message) =>
          message.role === "user" ? (
            <ChatUserMessage
              key={message.id}
              text={message.text}
              createdAt={message.createdAt}
              disabled={actionDisabled}
              onDelete={() => handleDeleteUserMessage(message)}
            />
          ) : (
            <div
              key={message.id}
              className="gojikka-message gojikka-message--assistant"
            >
              <p className="whitespace-pre-wrap text-[0.9375rem] leading-[2] gojikka-muted">
                {message.text}
              </p>
              {message.createdAt && (
                <p className="gojikka-message-time">
                  {formatMessageTime(message.createdAt)}
                </p>
              )}
            </div>
          )
        )}

        {sending && (
          <p className="mr-8 text-[0.9375rem] leading-[2] gojikka-muted">
            考えています…
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="gojikka-chat-compose">
        <div className="gojikka-chat-compose-inner">
          <label htmlFor="message" className="sr-only">
            メッセージ
          </label>
          <textarea
            id="message"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={3}
            placeholder="いま、話してみたいことを書いてください"
            className="gojikka-textarea mb-4"
            disabled={actionDisabled}
          />
          {error && (
            <p className="mb-4 text-[0.875rem] leading-[1.8] gojikka-muted">
              {error}
            </p>
          )}
          <button
            type="button"
            className="gojikka-btn-secondary mb-4"
            onClick={handleResetConversation}
            disabled={actionDisabled}
          >
            {resetting ? "リセット中…" : "会話をリセット"}
          </button>
          <SaveConversationButton disabled={actionDisabled} />
          <button type="submit" className="gojikka-btn" disabled={actionDisabled}>
            {sending ? "送信中…" : "送信"}
          </button>
        </div>
      </form>
    </div>
  );
}
