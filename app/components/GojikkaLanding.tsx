import GojikkaFooter from "@/app/components/GojikkaFooter";
import GojikkaHeader from "@/app/components/GojikkaHeader";
import GojikkaLandingActions from "@/app/components/GojikkaLandingActions";

export default function GojikkaLanding() {
  return (
    <div className="gojikka-page">
      <GojikkaHeader />

      <main className="gojikka-container pb-32 pt-20 sm:pt-28">
        <h1 className="text-balance text-[1.75rem] leading-[1.7] tracking-wide sm:text-[2.125rem]">
          実家に帰りたいのに、
          <br />
          帰れないあなたへ
        </h1>

        <div className="mt-16 space-y-10 text-[1.0625rem] leading-[2] gojikka-muted">
          <p>
            帰るのが嬉しかった実家が、
            <br />
            いつからか、少し重くなった。
          </p>

          <p>
            嫌いなわけじゃない。心配だって、している。
            <br />
            それなのに、電話のあとはどっと疲れて、
            <br />
            帰省の予定は、いつも先送りになる。
          </p>

          <p>
            帰らなくても、いいんです。
            <br />
            ここは、帰省をすすめる場所ではありません。
            <br />
            あなたの気持ちを、先に軽くする場所です。
          </p>

          <p>
            GOJIKKAは、あなたが教えてくれた「親のこと」を
            <br className="sm:hidden" />
            覚えながら、そっと話を聞く相談相手です。
          </p>

          <p>責めない。せかさない。正解を押し付けない。</p>

          <p>
            親のことを話しているうちに、
            <br className="sm:hidden" />
            自分の気持ちが少し整理されることがあります。
          </p>
        </div>

        <div className="mt-20">
          <GojikkaLandingActions />
        </div>
      </main>

      <GojikkaFooter />
    </div>
  );
}
