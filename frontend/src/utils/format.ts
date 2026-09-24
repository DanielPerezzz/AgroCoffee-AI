export function toNumber(value: string | number | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatNumber(
  value: string | number | null | undefined,
  digits = 1
): string {
  return toNumber(value).toFixed(digits).replace(/\.0$/, "");
}

export function formatDateTime(value: string): {
  date: string;
  time: string;
} {
  const date = new Date(value);

  return {
    date: new Intl.DateTimeFormat("es-SV", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("es-SV", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  };
}

export function formatElapsedUpdate(date: Date | null): string {
  if (!date) {
    return "Sin actualización";
  }

  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) {
    return "Actualizado hace menos de un minuto";
  }

  return `Actualizado hace ${Math.floor(seconds / 60)} min`;
}

export function normalizeBatchCode(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
}
