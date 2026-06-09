import type { Metadata } from "next";
import ChatScreen from "@/app/components/ChatScreen";
import GojikkaHeader from "@/app/components/GojikkaHeader";

export const metadata: Metadata = {
  title: "相談｜GOJIKKA",
  description: "親のことを理解した状態で、そっと話を聞きます。",
};

export default function ChatPage() {
  return (
    <div className="gojikka-page gojikka-page--chat">
      <GojikkaHeader compact />

      <main className="gojikka-container gojikka-chat-main">
        <ChatScreen />
      </main>
    </div>
  );
}
