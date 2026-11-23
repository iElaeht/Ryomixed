type LogLevel = "info" | "success" | "warn" | "error";

interface LogEntryOptions {
  scope: string;
  level?: LogLevel;
  message: string;
  meta?: Record<string, string | number | boolean | null | undefined>;
}

export function writeLog({
  scope,
  level = "info",
  message,
  meta,
}: LogEntryOptions): void {
  const tag = `[${scope}]`;
  const statusLabel = level.toUpperCase().padEnd(7, " ");

  const metaParts = meta
    ? Object.entries(meta)
        .filter(([, value]) => value !== undefined && value !== null && value !== "")
        .map(([key, value]) => `  • ${key}: ${String(value)}`)
    : [];

  const formattedBlock = [
    "",
    `${tag}  [${statusLabel}]  ${message}`,
    ...metaParts,
    "",
  ].join("\n");

  if (level === "error") {
    console.error(formattedBlock);
  } else if (level === "warn") {
    console.warn(formattedBlock);
  } else {
    console.log(formattedBlock);
  }
}