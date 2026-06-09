"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadParentProfile,
  ParentProfile,
} from "@/lib/parent-profile";

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

export default function ChatScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [ready, setReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadParentProfile();
    if (!saved) {
      router.replace("/profile");
      return;
    }

    setProfile(saved);
    setMessages([]);
    setReady(true);
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || !profile || sending) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
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

      const reply = data.message;

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: reply,
        },
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "返答を取得できませんでした。"
      );
    } finally {
      setSending(false);
    }
  }

  if (!ready || !profile) {
    return (
      <p className="text-[0.9375rem] leading-[2] gojikka-muted">
        読み込み中…
      </p>
    );
  }

  return (
    <div className="gojikka-chat">
      <div className="gojikka-chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "ml-8 text-right"
                : "mr-8 text-left"
            }
          >
            <p className="whitespace-pre-wrap text-[0.9375rem] leading-[2] gojikka-muted">
              {message.text}
            </p>
          </div>
        ))}

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
            disabled={sending}
          />
          {error && (
            <p className="mb-4 text-[0.875rem] leading-[1.8] gojikka-muted">
              {error}
            </p>
          )}
          <button type="submit" className="gojikka-btn" disabled={sending}>
            {sending ? "送信中…" : "送信"}
          </button>
        </div>
      </form>
    </div>
  );
}
