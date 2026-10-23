import { test } from "node:test";
import assert from "node:assert/strict";
import {
  correctClaim,
  groupEvents,
  hasDate,
  validDate,
  verifyEvents,
} from "../lib/timeline";
import { exampleSources, exampleEvents } from "../lib/example";
import { InputSchema } from "../lib/schema";
const claims = () => verifyEvents(exampleEvents, exampleSources);
test("case has seven occurrences, one conflict and three undated events", () => {
  const groups = groupEvents(claims());
  assert.equal(groups.length, 7);
  assert.equal(groups.filter((g) => g.conflict).length, 1);
  assert.equal(groups.filter((g) => !g.date).length, 3);
  assert.ok(claims().every((c) => c.verified));
});
test("evidence offsets reproduce exact substring", () => {
  for (const c of claims()) {
    const src = exampleSources.find((s) => s.id === c.sourceId)!;
    assert.equal(src.text.slice(c.start, c.end), c.quote);
  }
});
test("fabricated and empty quotes never confirm origin", () => {
  for (const quote of ["Inventado", "", "   "]) {
    const [c] = verifyEvents([{ ...exampleEvents[0], quote }], exampleSources);
    assert.equal(c.verified, false);
    assert.equal(c.start, -1);
  }
});
test("invalid or unsupported dates become null", () => {
  for (const date of ["2026-02-30", "2026-07-12", "ontem"]) {
    const [c] = verifyEvents([{ ...exampleEvents[0], date }], exampleSources);
    assert.equal(c.date, null);
    assert.equal(c.originalDate, date);
  }
});
test("numeric and Portuguese date forms match, unrelated dates do not", () => {
  assert.ok(hasDate("12 de maio de 2026", "2026-05-12"));
  assert.ok(hasDate("12.5.2026", "2026-05-12"));
  assert.ok(!hasDate("112/05/2026", "2026-05-12"));
  assert.ok(!hasDate("12/05/20260", "2026-05-12"));
  assert.ok(!validDate("2025-02-29"));
  assert.ok(validDate("2024-02-29"));
});
test("date evidence must also be literal in source", () => {
  const [c] = verifyEvents(
    [{ ...exampleEvents[0], dateQuote: "12 de maio de 2026" }],
    exampleSources,
  );
  assert.equal(c.date, null);
});
test("two dates in same source are not a cross-source conflict", () => {
  const c = claims()[0];
  assert.equal(
    groupEvents([c, { ...c, id: "other", date: "2026-05-13" }])[0].conflict,
    false,
  );
});
test("repeated visits with different event keys do not conflict", () => {
  const c = claims()[0];
  assert.equal(
    groupEvents([
      c,
      {
        ...c,
        id: "second",
        sourceId: "medico",
        eventKey: "second-visit",
        date: "2026-06-12",
      },
    ]).filter((g) => g.conflict).length,
    0,
  );
});
test("human edit preserves original proof, appends history and resolves matching dates", () => {
  let c = claims().find(
    (c) => c.sourceId === "medico" && c.eventKey === "retorno-ambulatorial",
  )!;
  const original = c;
  c = correctClaim(
    c,
    "2026-05-22",
    "Retorno registrado",
    "Conferido com a família",
    "2026-10-23T12:00:00Z",
  );
  assert.equal(c.quote, original.quote);
  assert.equal(c.originalDate, "2026-05-23");
  assert.equal(c.changes[0].before.date, "2026-05-23");
  assert.equal(c.changes[0].after.date, "2026-05-22");
  const groups = groupEvents(claims().map((x) => (x.id === c.id ? c : x)));
  assert.equal(groups.find((g) => g.key === c.eventKey)!.conflict, false);
  assert.equal(groups.find((g) => g.key === c.eventKey)!.corrected, true);
  c = correctClaim(c, null, c.description, "Data desconhecida");
  assert.equal(c.changes.length, 2);
  assert.equal(c.changes[1].before.date, "2026-05-22");
});
test("edits reject invalid dates, empty descriptions and missing reasons", () => {
  const c = claims()[0];
  assert.throws(() => correctClaim(c, "2026-02-30", "Evento", "Motivo"));
  assert.throws(() => correctClaim(c, null, "", "Motivo"));
  assert.throws(() => correctClaim(c, null, "Evento", " "));
});
test("input requires exactly three distinct nonempty short texts", () => {
  assert.ok(InputSchema.safeParse({ sources: exampleSources }).success);
  assert.ok(
    !InputSchema.safeParse({
      sources: [exampleSources[0], exampleSources[0], exampleSources[0]],
    }).success,
  );
  assert.ok(
    !InputSchema.safeParse({ sources: exampleSources.slice(0, 2) }).success,
  );
  assert.ok(
    !InputSchema.safeParse({
      sources: exampleSources.map((s) => ({ ...s, text: "" })),
    }).success,
  );
});

test("leading whitespace is preserved for provenance offsets", () => {
  const sources = exampleSources.map((s) => ({ ...s, text: "  \n" + s.text }));
  const parsed = InputSchema.parse({ sources });
  const c = verifyEvents(exampleEvents, parsed.sources)[0];
  assert.equal(sources[0].text.slice(c.start, c.end), c.quote);
  assert.equal(parsed.sources[0].text, sources[0].text);
});

test("unrelated date elsewhere in source is never evidence for this event", () => {
  const [c] = verifyEvents(
    [{ ...exampleEvents[0], date: "2026-05-15", dateQuote: "15/05/2026" }],
    exampleSources,
  );
  assert.equal(c.date, null);
  assert.equal(c.dateVerified, false);
});
