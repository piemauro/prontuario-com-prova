import type { RawEvent, Source } from "./schema";
export type Change = {
  at: string;
  before: { date: string | null; description: string };
  after: { date: string | null; description: string };
  reason: string;
};
export type Claim = RawEvent & {
  id: string;
  originalDate: string | null;
  originalDescription: string;
  start: number;
  end: number;
  verified: boolean;
  dateVerified: boolean;
  changes: Change[];
};
export type TimelineEvent = {
  key: string;
  claims: Claim[];
  conflict: boolean;
  date: string | null;
  description: string;
  corrected: boolean;
};
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + "T12:00:00Z");
  return (
    !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}
export function hasDate(text: string, value: string): boolean {
  const [year, month, day] = value.split("-");
  const names = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
  ];
  return (
    text.includes(value) ||
    new RegExp(
      `(?<!\\d)0?${Number(day)}[/.\\-]0?${Number(month)}[/.\\-]${year}(?!\\d)`,
    ).test(text) ||
    new RegExp(
      `(?<!\\d)0?${Number(day)}\\s+de\\s+${names[Number(month) - 1]}\\s+de\\s+${year}(?!\\d)`,
      "i",
    ).test(text)
  );
}
export function verifyEvents(raw: RawEvent[], sources: Source[]): Claim[] {
  return raw.map((event, i) => {
    const source = sources.find((s) => s.id === event.sourceId);
    const start =
      event.quote.trim() && source ? source.text.indexOf(event.quote) : -1;
    const verified = typeof start === "number" && start >= 0;
    const dateVerified =
      verified &&
      event.date !== null &&
      validDate(event.date) &&
      !!event.dateQuote?.trim() &&
      event.quote.includes(event.dateQuote) &&
      hasDate(event.dateQuote, event.date);
    return {
      ...event,
      date: dateVerified ? event.date : null,
      id: `claim-${i}`,
      originalDate: event.date,
      originalDescription: event.description,
      start: verified ? start : -1,
      end: verified ? start + event.quote.length : -1,
      verified,
      dateVerified,
      changes: [],
    };
  });
}
export function groupEvents(claims: Claim[]): TimelineEvent[] {
  const map = new Map<string, Claim[]>();
  for (const claim of claims)
    map.set(claim.eventKey, [...(map.get(claim.eventKey) ?? []), claim]);
  return [...map.entries()]
    .map(([key, entries]) => {
      const dated = entries.filter((c) => c.date !== null);
      const conflict = dated.some((a, i) =>
        dated.some(
          (b, j) => i !== j && a.sourceId !== b.sourceId && a.date !== b.date,
        ),
      );
      return {
        key,
        claims: entries,
        conflict,
        date: dated.map((c) => c.date!).sort()[0] ?? null,
        description: entries[0].description,
        corrected: entries.some((c) => c.changes.length > 0),
      };
    })
    .sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999"));
}
export function correctClaim(
  claim: Claim,
  date: string | null,
  description: string,
  reason: string,
  at = new Date().toISOString(),
): Claim {
  if (date !== null && !validDate(date)) throw new Error("Data inválida.");
  if (
    !description.trim() ||
    description.length > 300 ||
    !reason.trim() ||
    reason.length > 500
  )
    throw new Error("Preencha descrição e motivo dentro do limite.");
  if (date === claim.date && description.trim() === claim.description)
    return claim;
  return {
    ...claim,
    date,
    description: description.trim(),
    changes: [
      ...claim.changes,
      {
        at,
        before: { date: claim.date, description: claim.description },
        after: { date, description: description.trim() },
        reason: reason.trim(),
      },
    ],
  };
}
export function displayDate(date: string | null): string {
  if (!date) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date + "T12:00:00Z"));
}
