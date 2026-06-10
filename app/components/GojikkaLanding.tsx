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
            親のことを話しているうちに、
            <br className="sm:hidden" />
            自分の気持ちが少し整理されることがあります。
          </p>

          <p>
            遠くに離れて暮らす。電話は重い。
            <br />
            帰省は、いろんな理由で叶わない。
          </p>

          <p>
            GOJIKKAは、あなたが教えてくれた「親のこと」を覚えながら、そっと話を聞く相談相手です。
          </p>

          <p>正解を押し付けない。理解したうえで、一緒に考える。</p>
        </div>

        <div className="mt-20">
          <GojikkaLandingActions />
        </div>
      </main>

      <GojikkaFooter />
    </div>
  );
}
