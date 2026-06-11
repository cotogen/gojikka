import type { Metadata } from "next";
import { Noto_Serif_JP } from "next/font/google";
import AuthSessionProvider from "@/app/components/AuthSessionProvider";
import "./globals.css";

const notoSerifJP = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-noto-serif-jp",
  display: "swap",
});

const metadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gojikka.com"
);

const siteTitle = "GOJIKKA｜実家に帰りたいのに、帰れないあなたへ";
const siteDescription =
  "あなたが教えてくれた「親のこと」を覚えながら、そっと話を聞く相談相手。責めない。せかさない。正解を押し付けない。";

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: siteTitle,
    template: "%s｜GOJIKKA",
  },
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://gojikka.com",
    siteName: "GOJIKKA",
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSerifJP.variable} font-serif antialiased`}>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
