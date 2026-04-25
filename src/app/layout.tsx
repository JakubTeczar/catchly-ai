import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ToastProvider } from "@/components/ui/ToastProvider";
import Script from "next/script";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Twój Agent AI który zwiększa konwersje",
  description:
    "Agent AI który pracuje 24/7 i automatycznie zwiększa konwersję na Twojej stronie internetowej. Testuj, ucz się, zarabiaj.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-950" suppressHydrationWarning>
        
        {/* Meta Pixel */}
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1503458168239013');
            fbq('track', 'PageView');
          `}
        </Script>

        {/* noscript fallback */}
        <div
          dangerouslySetInnerHTML={{
            __html: `
              <noscript>
                <img height="1" width="1" style="display:none"
                src="https://www.facebook.com/tr?id=1503458168239013&ev=PageView&noscript=1"/>
              </noscript>
            `,
          }}
        />

        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
