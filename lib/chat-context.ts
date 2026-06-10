export function truncateToRecentMessages(
  messages: { role: string; content: string }[],
  maxMessages: number
): { role: string; content: string }[] {
  if (messages.length <= maxMessages) return messages;

  const truncated = messages.slice(-maxMessages);

  // 先頭がuserになるよう調整
  if (truncated[0]?.role === "assistant") {
    return truncated.slice(1);
  }

  return truncated;
}
