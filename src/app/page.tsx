import { UrlInputForm } from "@/components/landing/UrlInputForm";

function CatchlyLogo() {
  return (
    <svg width="99" height="28" viewBox="0 0 99 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10.0954 21.4839C4.12992 21.4839 0 16.9519 0 11.1865C0 5.39249 4.12992 0.889186 10.0954 0.889186C14.3687 0.889186 17.5808 3.15518 19.1009 6.53982L16.4336 7.974C15.4011 5.5359 13.1354 3.8149 10.0954 3.8149C5.82204 3.8149 3.06876 7.11349 3.06876 11.1865C3.06876 15.2596 5.85072 18.5582 10.0954 18.5582C13.2215 18.5582 15.5445 16.7224 16.5483 14.1409L19.1869 15.5464C17.7529 19.0745 14.4834 21.4839 10.0954 21.4839Z" fill="white"/>
      <path d="M25.7266 21.5126C22.7726 21.5126 20.6216 19.6195 20.6216 16.9232C20.6216 14.3417 22.4284 12.4773 25.7553 12.2478L30.1147 11.961V11.7889C30.1147 10.3834 28.8241 8.77713 26.4723 8.77713C24.2066 8.77713 23.1454 10.24 22.7726 11.33L20.5069 10.1826C21.1665 8.34688 23.002 6.19562 26.501 6.19562C30.6882 6.19562 32.954 9.09265 32.954 11.9036V21.2257H30.1147V19.5334C29.3403 20.7094 27.6195 21.5126 25.7266 21.5126ZM23.4896 16.8659C23.4896 18.1853 24.4794 18.9884 26.0134 18.9884C28.6233 18.9884 30.172 17.2101 30.172 15.2883V14.3704L25.9561 14.6572C24.5507 14.7433 23.4896 15.4604 23.4896 16.8659Z" fill="white"/>
      <path d="M37.3617 21.2257V8.97792H34.7232V6.45377H37.4478V2.63888H40.2297V6.45377H44.0442V8.97792H40.2297V18.5295H44.1015V21.2257H37.3617Z" fill="white"/>
      <path d="M53.0322 21.4839C48.9023 21.4839 45.432 18.4435 45.432 13.8254C45.432 9.23607 48.8162 6.19562 53.0322 6.19562C56.8753 6.19562 58.9976 8.46161 59.8007 10.4981L57.3055 11.7889C56.7893 10.326 55.384 8.86318 53.0322 8.86318C50.2502 8.86318 48.3287 10.9571 48.3287 13.8254C48.3287 16.6364 50.2502 18.845 53.0322 18.845C55.2979 18.845 56.7893 17.4395 57.3055 15.9767L59.8007 17.2674C58.9976 19.2466 56.7606 21.4839 53.0322 21.4839Z" fill="white"/>
      <path d="M62.268 21.2257V0H65.136V8.28951C65.9678 7.02744 67.4304 6.19562 69.438 6.19562C72.7076 6.19562 74.9446 8.63372 74.9446 11.8176V21.2257H72.0766V12.506C72.0766 10.2113 70.5566 8.89187 68.6063 8.89187C66.6274 8.89187 65.136 10.326 65.136 12.506V21.2257H62.268Z" fill="white"/>
      <path d="M78.0869 21.2257V0H80.9548V21.2257H78.0869Z" fill="white"/>
      <path d="M85.8878 27.7943L88.7558 21.111L82.5036 6.45377H85.7157L90.3619 17.7837L94.8073 6.45377H98.1055L89.1 27.7943H85.8878Z" fill="white"/>
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="relative bg-[#080808]">

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/backgorund.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ objectFit: "cover" }}
      />

      {/* Hero — full viewport */}
      <div className="relative z-10 flex flex-col" style={{ minHeight: "100vh" }}>

        {/* Logo */}
        <div className="px-7 pt-6">
          <CatchlyLogo />
        </div>

        {/* Centred content */}
        <div className="flex flex-col items-center justify-center flex-1 px-4 pt-8 pb-16 text-center">

          {/* Pre-sale badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6"
            style={{
              background: "rgba(187,234,0,0.1)",
              border: "1px solid rgba(187,234,0,0.25)",
              color: "#BBEA00",
              fontFamily: "Satoshi, sans-serif",
            }}
          >
            ✦ Przedsprzedaż — premiera 1 lipca 2026
          </div>

          <h1
            className="text-white text-3xl md:text-[46px] mb-3 tracking-tight leading-tight"
            style={{ fontFamily: "Brockmann, sans-serif" }}
          >
            AI agent, który zwiększa<br className="hidden md:block" /> konwersję Twojej strony
          </h1>
          <p
            className="text-sm md:text-base mb-8 max-w-sm"
            style={{ color: "rgba(255,255,255,0.6)", fontFamily: "Satoshi, sans-serif" }}
          >
            Wpisz URL swojej strony i odbierz darmowy audyt AI
          </p>

          <div className="w-full max-w-[400px]">
            <UrlInputForm />
          </div>

        </div>
      </div>

    </main>
  );
}
