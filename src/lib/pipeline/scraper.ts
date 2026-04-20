const SCRAPE_API_KEY = process.env.SCRAPE_DO_API_KEY;

class Semaphore {
  private queue: Array<() => void> = [];
  running = 0;

  constructor(private max: number) {}

  get waiting() { return this.queue.length; }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.running >= this.max) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.running++;
    try {
      return await fn();
    } finally {
      this.running--;
      this.queue.shift()?.();
    }
  }
}



const scrapeSemaphore = new Semaphore(9);

export async function scrapeUrl(url: string, useSuper: boolean = false, render: boolean = false): Promise<string> {
  if (!SCRAPE_API_KEY) {
    throw new Error("Missing SCRAPE_API_KEY. All requests must go through scrape.do.");
  }

  const params = new URLSearchParams({
    token: SCRAPE_API_KEY,
    url,
    render: render ? "true" : "false",
    super: useSuper ? "true" : "false",
  });

  if(render){
    params.append("waitUntil", "networkidle2");
    // params.append("customWait", "3000");
  }

  const apiUrl = `https://api.scrape.do/?${params.toString()}`;

  console.log(`[scrape.do] → ${url} | super=${useSuper} | w kolejce: ${scrapeSemaphore.waiting}, aktywne: ${scrapeSemaphore.running}`);

  try {
    const res = await scrapeSemaphore.run(() =>
      fetch(apiUrl, { signal: AbortSignal.timeout(30000) })
    );

    console.log(`[scrape.do] ← ${url} | status: ${res.status} ${res.statusText}`);

    // Jeśli strona nas zablokowała (403) i nie używaliśmy jeszcze trybu super
    if (res.status === 403 && !useSuper) {
      console.warn(`[Scraper] Blokada 403 na ${url}. Ponawiam z super: true...`);
      return await scrapeUrl(url, true, render);
    }

    if (!res.ok) {
      throw new Error(`scrape.do error: ${res.status} for ${url}`);
    }

    return await res.text();

  } catch (error: any) {
    // Obsługa timeoutu lub błędów sieciowych
    if (error.name === 'TimeoutError' && !useSuper) {
      console.warn(`[Scraper] Timeout na ${url}. Ponawiam z super: true...`);
      return await scrapeUrl(url, true, render);
    }
    throw error;
  }
}

export function extractText(html: string): string {
  // Remove scripts, styles, comments
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // Limit to 6000 chars for AI
  return text.slice(0, 6000);
}

export function extractLinks(html: string, baseUrl: string): string[] {
  const base = new URL(baseUrl);
  const linkRegex = /href=["']([^"'#?]+)["']/gi;
  const links = new Set<string>();

  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1].trim();
    if (!href || href === "/" || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    try {
      const url = new URL(href, base.origin);
      if (url.hostname !== base.hostname) continue;
      // Skip obvious non-content URLs
      if (
        url.pathname.match(
          /\.(pdf|jpg|jpeg|png|gif|svg|webp|ico|css|js|woff|woff2|ttf|mp4|zip)$/i
        )
      )
        continue;
      if (url.pathname === "/") continue;
      const clean = url.origin + url.pathname;
      links.add(clean);
    } catch {
      // ignore invalid URLs
    }
  }

  return Array.from(links).slice(0, 150);
}

// scraper.ts

export function extractCSSLinks(html: string, baseUrl: string): string[] {
  const base = new URL(baseUrl);
  const links: string[] = [];

  // Wyciągamy każdy tag <link ...> niezależnie od kolejności atrybutów
  const tagRegex = /<link([^>]+)>/gi;
  let tag;
  while ((tag = tagRegex.exec(html)) !== null) {
    const attrs = tag[1];
    // Sprawdź czy rel="stylesheet" (w dowolnej kolejności)
    if (!/rel=["']stylesheet["']/i.test(attrs)) continue;
    // Wyciągnij href
    const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    try {
      const cssUrl = new URL(hrefMatch[1], base.origin).href;
      // Pomijamy data: URI i inne nie-http
      if (!cssUrl.startsWith("http")) continue;
      links.push(cssUrl);
    } catch { /* ignore */ }
  }
  return links.slice(0, 5);
}

export function extractInlineCSS(html: string): string {
  const styleBlocks: string[] = [];
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  const inlineAttrRegex = /style="([^"]{0,200})"/gi;
  
  let match;
  while ((match = styleRegex.exec(html)) !== null) {
    styleBlocks.push(match[1]);
  }
  while ((match = inlineAttrRegex.exec(html)) !== null) {
    styleBlocks.push(match[1]);
  }
  return styleBlocks.join("\n");
}