import fs from "fs";
import path from "path";

export type LogFn = (msg: string) => void;

// ── Aby włączyć logi: zmień na true ──────────────────────────────────────────
const LOGGING_ENABLED = false;
// ─────────────────────────────────────────────────────────────────────────────

export function createLogger(analysisId: string): { log: LogFn; logFile: string } {
  if (!LOGGING_ENABLED) {
    return { log: () => {}, logFile: "" };
  }

  const logsDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const logFile = path.join(logsDir, `${ts}_${analysisId}.log`);

  const log: LogFn = (msg: string) => {
    const line = `[${new Date().toISOString()}] ${msg}`;
    // Console: max 150 chars
    console.log(line.length > 150 ? line.slice(0, 147) + "..." : line);
    // File: pełna wiadomość
    fs.appendFileSync(logFile, line + "\n", "utf8");
  };

  log(`=== Logger initialized | analysisId: ${analysisId} | file: ${logFile} ===`);
  return { log, logFile };
}
