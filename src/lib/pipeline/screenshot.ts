import { writeFile, mkdir } from "fs/promises";
import path from "path";

const SCRAPE_API_KEY = process.env.SCRAPE_DO_API_KEY;

export async function takeScreenshot(analysisId: string, url: string): Promise<string> {
  if (!SCRAPE_API_KEY) throw new Error("Brak SCRAPE_DO_API_KEY");

const playWithBrowser = JSON.stringify([
  {
    Action: "Execute",
    Execute: `
      (function() {
        // 1. Agresywne zamrożenie wszelkich animacji i przejść
        const style = document.createElement('style');
        style.textContent = \`
          * { 
            transition: none !important; 
            transition-duration: 0s !important; 
            animation: none !important; 
            animation-duration: 0s !important; 
          }
        \`;
        document.head.appendChild(style);

        function cleanUp() {
          // A. Sprawdzanie punktowe (Centrum + Rogi)
          const points = [
            [window.innerWidth / 2, window.innerHeight / 2],
            [100, 100],
            [window.innerWidth - 100, 100],
            [100, window.innerHeight - 100],
            [window.innerWidth - 100, window.innerHeight - 100]
          ];

          points.forEach(([x, y]) => {
            let el = document.elementFromPoint(x, y);
            while (el && el !== document.body && el !== document.documentElement) {
              const s = window.getComputedStyle(el);
              const zIndex = parseInt(s.zIndex) || 0;

              if ((s.position === 'fixed' || s.position === 'absolute') && zIndex > 0) {
                if (/cookie|polityk|zgoda|consent|akceptuj|RODO|understand|przyjmuję/i.test(el.innerText)) {
                  
                  // Próba kliknięcia w przycisk akceptacji
                  const buttons = el.querySelectorAll('button, a, [role="button"]');
                  let clicked = false;
                  
                  buttons.forEach(btn => {
                    const txt = btn.innerText.toLowerCase();
                    if (/akceptuj|accept|zgoda|allow|agree|OK|wszystkie/i.test(txt) && !/ustawienia|settings|manage/i.test(txt)) {
                      btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }, { once: true });
                      btn.click();
                      clicked = true;
                    }
                  });

                  if (clicked) {
                    setTimeout(() => { if(el && el.parentNode) el.remove(); }, 200);
                  } else {
                    el.remove();
                  }
                  break;
                }
              }
              el = el.parentElement;
            }
          });

          // B. Globalne czyszczenie (Backup dla elementów z wysokim z-index)
          document.querySelectorAll('*').forEach(el => {
            const s = window.getComputedStyle(el);
            const zIndex = parseInt(s.zIndex) || 0;
            if ((s.position === 'fixed' || s.position === 'absolute') && zIndex > 100) {
              if (/cookie|polityk|zgoda|consent|akceptuj/i.test(el.innerText)) {
                el.remove();
              }
            }
          });

          // C. Usuwanie overlayów (szarych teł)
          document.querySelectorAll('[class*="overlay"],[class*="backdrop"],[class*="modal-bg"]').forEach(el => {
            const s = window.getComputedStyle(el);
            if (parseInt(s.zIndex) > 50) el.remove();
          });

          // D. Siłowe odblokowanie strony (scroll i overflow)
          const unlock = 'overflow: auto !important; position: static !important; height: auto !important; visibility: visible !important;';
          document.documentElement.setAttribute('style', unlock);
          document.body.setAttribute('style', unlock);
          document.body.className = ''; 
        }

        // Inicjalizacja
        cleanUp();
        const interval = setInterval(cleanUp, 300);
        const obs = new MutationObserver(cleanUp);
        obs.observe(document.documentElement, { childList: true, subtree: true });

        // Samolikwidacja skryptu po 5 sekundach
        setTimeout(() => {
          clearInterval(interval);
          obs.disconnect();
        }, 5000);
      })();
    `,
  },
]);

  const params = new URLSearchParams({
    token: SCRAPE_API_KEY,
    url,
    super: "true",
    render: "true",
    waitUntil: "networkidle2",
    customWait: "3000",
    width: "1920",
    height: "1080",
    returnJSON: "true",
    screenShot: "true",
    geoCode: "PL",
    playWithBrowser,
  });

  const apiUrl = `http://api.scrape.do/?${params.toString()}`;
  console.log("[screenshot] Wysyłam żądanie:", apiUrl.replace(SCRAPE_API_KEY, "***"));

  const res = await fetch(apiUrl, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    signal: AbortSignal.timeout(60000),
  });

  console.log("[screenshot] Status odpowiedzi:", res.status, res.statusText);
  console.log("[screenshot] Content-Type:", res.headers.get("content-type"));

  if (!res.ok) {
    const errorText = await res.text();
    console.error("[screenshot] Błąd odpowiedzi:", errorText.slice(0, 500));
    throw new Error(`scrape.do screenshot error: ${res.status}`);
  }

  const json = await res.json();
  console.log("[screenshot] Klucze w odpowiedzi JSON:", Object.keys(json));
  console.log("[screenshot] screenShots:", json.screenShots);

  // scrape.do zwraca tablicę screenShots, każdy element to { type, image, error }
  const b64 =
    (json.screenShots?.[0]?.image) ||
    json.screenShot ||
    json.screenshot ||
    json.data;
  if (!b64) throw new Error(`Brak pola image w screenShots: ${JSON.stringify(json.screenShots?.[0])}`);

  const screenshotsDir = path.join(process.cwd(), "public", "screenshots");
  await mkdir(screenshotsDir, { recursive: true });

  const filename = `${analysisId}.jpg`;
  const filepath = path.join(screenshotsDir, filename);
  await writeFile(filepath, Buffer.from(b64, "base64"));
  console.log("[screenshot] Zapisano plik:", filepath);

  return `/api/screenshots/${filename}`;
}
