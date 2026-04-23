import { writeFile, mkdir } from "fs/promises";
import path from "path";

const SCRAPE_API_KEY = process.env.SCRAPE_DO_API_KEY;

export async function takeScreenshot(
  analysisId: string, 
  url: string, 
  screenWidth: number = 1920, 
  screenHeight?: number
): Promise<string> {
  if (!SCRAPE_API_KEY) throw new Error("Brak SCRAPE_DO_API_KEY");

  // Konfiguracja wymiarów
  const width = screenWidth < 800 ? "816" : "1920";
  const height = screenWidth < 800 ? "400" : "1080";

  // Skrypt JS wykonywany w przeglądarce scrape.do
  const playWithBrowser = JSON.stringify([
    {
      Action: "Execute",
      Execute: `
        (function() {
          const style = document.createElement('style');
          style.textContent = '* { transition: none !important; animation: none !important; }';
          document.head.appendChild(style);

          function cleanUp() {
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
                    const buttons = el.querySelectorAll('button, a, [role="button"]');
                    let clicked = false;
                    buttons.forEach(btn => {
                      const txt = btn.innerText.toLowerCase();
                      if (/akceptuj|accept|zgoda|allow|agree|OK|wszystkie/i.test(txt) && !/ustawienia|settings|manage/i.test(txt)) {
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

            document.querySelectorAll('*').forEach(el => {
              const s = window.getComputedStyle(el);
              if ((s.position === 'fixed' || s.position === 'absolute') && (parseInt(s.zIndex) || 0) > 100) {
                if (/cookie|polityk|zgoda|consent|akceptuj/i.test(el.innerText)) el.remove();
              }
            });

            const unlock = 'overflow: auto !important; position: static !important; height: auto !important; visibility: visible !important;';
            document.documentElement.setAttribute('style', unlock);
            document.body.setAttribute('style', unlock);
          }

          cleanUp();
          const interval = setInterval(cleanUp, 300);
          const obs = new MutationObserver(cleanUp);
          obs.observe(document.documentElement, { childList: true, subtree: true });
          setTimeout(() => { clearInterval(interval); obs.disconnect(); }, 5000);
        })();
      `,
    },
  ]);

  const params = new URLSearchParams({
    token: SCRAPE_API_KEY,
    url,
    super: "true",
    render: "true",
    waitUntil: "domcontentloaded",
    customWait: "3000",
    width: width,
    height: height,
    returnJSON: "true",
    screenShot: "true",
    geoCode: "PL",
    playWithBrowser,
  });

  const apiUrl = `http://api.scrape.do/?${params.toString()}`;
  
  // Controller do zarządzania anulowaniem żądań
  const controller = new AbortController();

  // Funkcja wykonująca pojedynczą próbę
  const makeRequest = async (id: number): Promise<string> => {
    try {
      console.log(`[screenshot] Start żądania #${id}`);
      
      const res = await fetch(apiUrl, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Błąd HTTP #${id}: ${res.status} - ${errorText.slice(0, 100)}`);
      }

      const json = await res.json();
      const b64 = json.screenShots?.[0]?.image || json.screenShot || json.screenshot || json.data;

      if (!b64) {
        throw new Error(`Próba #${id}: Brak danych obrazu w odpowiedzi.`);
      }

      // Sukces! Anulujemy pozostałe trwające zapytania
      controller.abort();
      console.log(`[screenshot] Zapytanie #${id} zakończone sukcesem jako pierwsze.`);
      return b64;

    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log(`[screenshot] Zapytanie #${id} zostało przerwane.`);
      } else {
        console.error(`[screenshot] Zapytanie #${id} zgłosiło błąd:`, err.message);
      }
      throw err; // Wyrzucamy błąd, aby Promise.any wiedział, że ta próba padła
    }
  };

  try {
    // Uruchamiamy 2 zapytania równolegle. 
    // Promise.any zwróci wynik z pierwszego, które zakończy się RESOLVE.
    const winningB64 = await Promise.any([
      makeRequest(1),
      makeRequest(2)
    ]);

    // Przygotowanie folderu i zapis pliku
    const screenshotsDir = path.join(process.cwd(), "public", "screenshots");
    await mkdir(screenshotsDir, { recursive: true });

    const filename = `${analysisId}.jpg`;
    const filepath = path.join(screenshotsDir, filename);
    await writeFile(filepath, Buffer.from(winningB64, "base64"));

    console.log("[screenshot] Plik zapisany pomyślnie:", filename);
    return `/api/screenshots/${filename}`;

  } catch (error: any) {
    // Jeśli wszystkie obietnice w Promise.any zakończą się błędem (reject)
    console.error("[screenshot] BŁĄD KRYTYCZNY: Żadna z prób nie powiodła się.");
    throw new Error("Nie udało się wygenerować screenshotu (wszystkie próby Scrape.do zawiodły).");
  }
}