import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
const scenes = JSON.parse(readFileSync("artifacts/scenes.json", "utf8"));
const labels = [
  "Uma história. Cada fato, uma origem.",
  "Três textos fictícios. Um histórico compreensível.",
  "Structured Outputs → verificação literal em código",
  "Clique no acontecimento. Confira a frase original.",
  "Sem data? A informação fica em aberto.",
  "Duas datas. Duas fontes. Um conflito visível.",
  "Corrigir sem apagar a origem.",
  "Antes, depois e motivo: revisão rastreável.",
  "A IA organiza. A fonte comprova. Você mantém o controle.",
];
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  recordVideo: {
    dir: "artifacts/recording",
    size: { width: 1440, height: 1000 },
  },
});
const page = await context.newPage();
await page.goto(
  process.env.BASE_URL || "https://prontuario-com-prova.vercel.app",
);
await page.evaluate(() => document.fonts.ready);
await page.addStyleTag({
  content:
    ".source-text{color:#5e6c57;font-size:12px}.source-link{font-size:10px} .event-date{font-size:9px}",
});
let timelineStart = Date.now();
const starts = [];
async function banner(index) {
  await page.evaluate(
    ({ text, index }) => {
      let el = document.getElementById("video-chapter");
      if (!el) {
        el = document.createElement("div");
        el.id = "video-chapter";
        el.style.cssText =
          'position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:100;background:#244c3f;color:#f2f5e7;padding:14px 24px;border-radius:9px;box-shadow:0 7px 28px #16382b30;font:500 17px "DM Sans",sans-serif;white-space:nowrap;pointer-events:none;display:flex;align-items:center;gap:16px';
        document.body.appendChild(el);
      }
      el.textContent = String(index + 1).padStart(2, "0") + " / " + text;
    },
    { text: labels[index], index },
  );
}
async function scrollWorkspace() {
  await page.locator(".workspace").scrollIntoViewIfNeeded();
  await page.evaluate(() =>
    window.scrollTo({
      top:
        document.querySelector(".workspace").getBoundingClientRect().top +
        window.scrollY -
        70,
      behavior: "smooth",
    }),
  );
  await page.waitForTimeout(500);
}
const actions = [
  async () => {},
  async () => {
    await page.evaluate(() =>
      window.scrollTo({ top: 450, behavior: "smooth" }),
    );
  },
  async () => {
    const response = page.waitForResponse(
      (r) =>
        r.url().includes("/api/extract") && r.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "Organizar com IA", exact: true })
      .first()
      .click();
    const r = await response;
    if (!r.ok()) throw new Error("Live API failed: " + r.status());
    await page.locator(".event-card").first().waitFor();
    await scrollWorkspace();
    console.log("LIVE AI", await page.locator(".mode-line").innerText());
  },
  async () => {
    await page.locator(".event-title").first().click();
    await page.waitForTimeout(700);
    await scrollWorkspace();
  },
  async () => {
    await page.getByRole("button", { name: "Sem data", exact: true }).click();
    await page
      .locator(".event-title")
      .filter({ hasText: /fisioterapia/i })
      .first()
      .click();
    await page.waitForTimeout(500);
    await page.evaluate(() =>
      window.scrollBy({ top: -100, behavior: "smooth" }),
    );
  },
  async () => {
    await page.getByRole("button", { name: /^Conflitantes/ }).click();
    const c = page.locator(".conflict-card");
    await c.locator(".source-link").first().click();
    await page.waitForTimeout(5000);
    await c
      .locator(".source-link")
      .filter({ hasText: "Mensagem do médico" })
      .click();
    await page.waitForTimeout(700);
  },
  async () => {
    await page
      .getByRole("button", { name: /^Corrigir .* em Mensagem do médico/ })
      .first()
      .click();
    await page.waitForTimeout(1200);
    await page.getByLabel("Data do acontecimento").fill("2026-05-22");
    await page
      .getByLabel("Motivo da correção")
      .pressSequentially("Data conferida com a família no caso fictício.", {
        delay: 55,
      });
    await page.waitForTimeout(1800);
    await page.getByRole("button", { name: "Salvar correção" }).click();
    await page.getByRole("button", { name: "Corrigidos", exact: true }).click();
    await scrollWorkspace();
  },
  async () => {
    await page.getByRole("button", { name: /Alterações/ }).click();
    await page.locator(".history-panel").scrollIntoViewIfNeeded();
    await page.waitForTimeout(6500);
    await page.getByRole("button", { name: "Exportar" }).click();
    await page
      .locator(".history-panel")
      .screenshot({ path: "artifacts/audit.png" });
  },
  async () => {
    await page.getByRole("button", { name: "Fechar histórico" }).click();
    await page.getByRole("button", { name: "Todos", exact: true }).click();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  },
];
for (let i = 0; i < scenes.length; i++) {
  const start = Date.now();
  starts.push((start - timelineStart) / 1000);
  await banner(i);
  await actions[i]();
  await page.screenshot({ path: `artifacts/scene-${i}.png` });
  const remaining = scenes[i].duration * 1000 - (Date.now() - start);
  if (remaining > 0) await page.waitForTimeout(remaining);
  console.log(
    "scene",
    i,
    "complete",
    Math.round((Date.now() - timelineStart) / 1000),
  );
}
const video = page.video();
await context.close();
await video.saveAs("artifacts/demo.webm");
await browser.close();
writeFileSync(
  "artifacts/recording-timing.json",
  JSON.stringify(
    { starts, duration: (Date.now() - timelineStart) / 1000 },
    null,
    2,
  ),
);
console.log("Recording saved.");
