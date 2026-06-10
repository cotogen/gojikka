"use client";

import { useRef } from "react";
import { formatMessageTime } from "@/lib/format-datetime";

const LONG_PRESS_MS = 500;

type ChatUserMessageProps = {
  text: string;
  createdAt: string;
  disabled?: boolean;
  onDelete: () => void;
};

export default function ChatUserMessage({
  text,
  createdAt,
  disabled = false,
  onDelete,
}: ChatUserMessageProps) {
  const longPressTriggered = useRef(false);
  const timerRef = useRef<number | null>(null);

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function promptDelete() {
    if (disabled) return;

    if (window.confirm("このメッセージを削除しますか？")) {
      onDelete();
    }
  }

  return (
    <div
      className="gojikka-message gojikka-message--user gojikka-message--deletable"
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="タップまたは長押しで削除"
      onClick={() => {
        if (longPressTriggered.current) {
          longPressTriggered.current = false;
          return;
        }
        promptDelete();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          promptDelete();
        }
      }}
      onPointerDown={() => {
        if (disabled) return;

        longPressTriggered.current = false;
        clearTimer();
        timerRef.current = window.setTimeout(() => {
          longPressTriggered.current = true;
          promptDelete();
        }, LONG_PRESS_MS);
      }}
      onPointerUp={clearTimer}
      onPointerLeave={clearTimer}
      onPointerCancel={clearTimer}
    >
      <p className="whitespace-pre-wrap text-[0.9375rem] leading-[2] gojikka-muted">
        {text}
      </p>
      {createdAt && (
        <p className="gojikka-message-time">{formatMessageTime(createdAt)}</p>
      )}
    </div>
  );
}
