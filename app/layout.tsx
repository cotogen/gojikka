import type { Metadata } from "next";
import { Noto_Serif_JP } from "next/font/google";
import "./globals.css";

const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-noto-serif-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GOJIKKA｜実家に帰りたいのに、帰れないあなたへ",
  description:
    "親のことを理解した状態で相談できるAI。遠く離れて暮らすあなたのための、静かな相談相手。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSerifJP.variable} font-serif antialiased`}>
        {children}
      </body>
    </html>
  );
}
