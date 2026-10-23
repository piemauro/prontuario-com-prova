import { test, expect } from "@playwright/test";
test("complete evidence, conflict, undated, correction and audit flow", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByLabel("Resumo de alta", { exact: true }),
  ).toContainText("12/05/2026");
  await page
    .getByRole("button", { name: "Explorar demonstração", exact: true })
    .click();
  await expect(page.locator(".event-card")).toHaveCount(7);
  await page.getByRole("button", { name: "Conflitantes" }).click();
  const conflict = page.locator(".conflict-card");
  await expect(conflict).toHaveCount(1);
  await expect(conflict).toContainText("22 de mai. de 2026");
  await expect(conflict).toContainText("23 de mai. de 2026");
  await conflict.getByRole("button", { name: /^Mensagem do médico/ }).click();
  await expect(page.locator("mark")).toContainText("23/05/2026");
  await expect(page.getByRole("status")).toContainText("Trecho localizado");
  await page.getByRole("button", { name: "Sem data", exact: true }).click();
  await expect(page.locator(".event-card")).toHaveCount(3);
  await page
    .getByRole("button", { name: /^Início das sessões de fisioterapia/ })
    .click();
  await expect(page.locator("mark")).toContainText("Não anotamos a data");
  await page.getByRole("button", { name: "Conflitantes" }).click();
  await page
    .getByRole("button", {
      name: "Corrigir Retorno ambulatorial realizado em Mensagem do médico",
    })
    .click();
  await page.getByLabel("Data do acontecimento").fill("2026-05-22");
  await page
    .getByLabel("Motivo da correção")
    .fill("Conferido para o caso fictício.");
  await page.getByRole("button", { name: "Salvar correção" }).click();
  await expect(page.locator(".conflict-card")).toHaveCount(0);
  await page.getByRole("button", { name: "Corrigidos", exact: true }).click();
  await expect(page.locator(".event-card")).toHaveCount(1);
  await expect(page.locator(".event-card")).toContainText(
    "Corrigido por humano",
  );
  await page.getByRole("button", { name: /Alterações/ }).click();
  await expect(page.locator(".history-item")).toContainText(
    "Conferido para o caso fictício.",
  );
  await expect(page.locator(".history-item del")).toContainText("23 de mai.");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("prontuario-com-prova.json");
  await expect(page.locator(".source-text").nth(1)).toContainText("23/05/2026");
});
test("mobile layout fits viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Explorar demonstração", exact: true })
    .click();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "artifacts/mobile.png", fullPage: true });
});
test("API validates malformed, oversized and missing source requests", async ({
  request,
}) => {
  expect(
    (await request.post("/api/extract", { data: { sources: [] } })).status(),
  ).toBe(400);
  expect(
    (
      await request.post("/api/extract", {
        data: "{broken",
        headers: { "Content-Type": "application/json" },
      })
    ).status(),
  ).toBe(400);
  expect(
    (await request.post("/api/extract", { data: "x".repeat(31000) })).status(),
  ).toBe(413);
});
