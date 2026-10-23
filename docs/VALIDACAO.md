# Validação da entrega

Data: 23/10/2026. Dados exclusivamente fictícios.

- Compilação de produção: `npm run build` — passou (Next.js 16.4.3).
- TypeScript: `npm run typecheck` — passou.
- Lógica documental: `npm test` — 13 testes passaram.
- Navegador local em build de produção: três testes Playwright passaram.
- URL pública: `https://prontuario-com-prova.vercel.app` — HTTP 200 sem autenticação.
- Os mesmos três testes Playwright passaram na URL pública (fluxo de prova/conflito/correção/exportação, mobile 390 px e erros de API).
- Chamada real em produção: `gpt-4.1-mini-2025-04-14`, 10 afirmações, 10 trechos confirmados por substring literal, três afirmações sem data e um conflito agrupado.
- `npm audit --omit=dev`: nenhuma vulnerabilidade conhecida reportada.
- Revisão de código: espaços iniciais preservados, prova da data limitada ao trecho do evento, descrições corrigidas de cada fonte exibidas. Regressões dos dois primeiros casos cobertas por testes.

Os testes não demonstram acurácia geral da extração nem garantia clínica. O agrupamento por ocorrência e a descrição neutra dependem da IA. A evidência desta entrega está limitada ao caso fictício e aos casos de teste incluídos.
