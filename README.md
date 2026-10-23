# Prontuário com Prova

**Uma história. Cada fato, uma origem.** Protótipo do Desafio 3 — Histórico de saúde organizado, OpenAI Hackathon São Paulo.

**Aplicação:** https://prontuario-com-prova.vercel.app

**Repositório:** https://github.com/piemauro/prontuario-com-prova

**Vídeo narrado:** [download MP4 (até 3 minutos)](https://github.com/piemauro/prontuario-com-prova/releases/download/v0.1.0/Prontuario-com-Prova-demo.mp4)

Três textos fictícios viram uma linha do tempo rastreável. O usuário pode abrir a frase de origem, conferir datas conflitantes e corrigir afirmações sem apagar o documento original.

> Organização documental. Sem diagnóstico, interpretação clínica, interpretação de exames ou recomendação. Use somente dados fictícios neste protótipo.

## Executar

Node.js 22+ (Vercel usa Node 24), npm.

```bash
npm ci
cp .env.example .env.local
# Configure OPENAI_API_KEY em .env.local para extração real.
npm run dev -- --port 3187
```

Abra `http://localhost:3187`. A chave fica exclusivamente no servidor. `OPENAI_MODEL` é opcional e usa `gpt-4.1-mini` por padrão; precisa ser compatível com Structured Outputs na Responses API. `EXTRACTION_ACCESS_CODE`, se definido no servidor, exige esse código no campo da interface.

**Sem chave:** “Explorar demonstração” usa uma extração pré-definida do caso Helena Costa, explicitamente identificada na tela. Os textos editados só são extraídos pela IA; o modo demo restaura o caso original e nunca finge processar texto novo.

## Fluxo da demonstração

1. Revise os três campos: resumo de alta, mensagem do médico e anotação da família.
2. Clique **Organizar com IA** ou **Explorar demonstração**.
3. Clique no evento ou em sua fonte: o documento rola até o trecho literal destacado.
4. Em **Sem data**, abra o início das sessões de fisioterapia.
5. Em **Conflitantes**, confira retorno em **22/05/2026** versus **23/05/2026**.
6. Corrija a afirmação da mensagem do médico para 22/05/2026 e registre o motivo. O conflito se resolve se as datas coincidirem; o selo humano permanece.
7. Em **Alterações**, veja antes/depois, motivo e horário. **Exportar** baixa o JSON com fontes e auditoria da sessão.

O caso tem sete acontecimentos agrupados e dez afirmações; três acontecimentos sem data e um conflito. A extração real pode variar na granularidade.

## Arquitetura e garantias

- `app/api/extract/route.ts`: valida três fontes de até 6.000 caracteres; chama `OpenAI.responses.parse` com `zodTextFormat`; trata falhas, recusas e saídas incompletas; `store:false`; não registra documentos em logs.
- `lib/schema.ts`: schemas de entrada e saída. Preserva o texto exatamente, inclusive espaços iniciais.
- `lib/timeline.ts`: `indexOf` localiza o trecho literal e calcula offsets. Trecho ausente/vazio recebe **origem não confirmada**. Datas sem prova literal dentro do trecho, ou calendários inválidos, tornam-se `null`; a sugestão original é preservada.
- Agrupamento: IA atribui `eventKey` à mesma ocorrência. Código marca **conflitante** quando duas afirmações com a mesma chave têm datas conhecidas diferentes em fontes distintas. Não escolhe a fonte correta. Ordenação do cartão usa a primeira data cronológica para posicionamento, exibindo ambas no conflito.
- Data nula: faixa **Sem data**. Se apenas uma das fontes do evento tem data nula, o cartão informa a lacuna e aparece no filtro Sem data.
- Correção por afirmação: muda data/descrição, guarda original e acrescenta `before`, `after`, motivo e timestamp. Não muda o texto-fonte nem recalcula offsets a partir da descrição editada.
- `app/page.tsx`: interface React, filtros, fontes, modal de correção, histórico e exportação.
- Sessão apenas em memória da aba. Recarregar, restaurar o exemplo ou extrair novamente reinicia o histórico. Exportação é manual. Não existe banco de dados, conta ou rastreador analítico.

**Fronteira da evidência:** presença do trecho não comprova que o relato é verdadeiro ou que a descrição é semanticamente perfeita. Agrupamento e neutralidade textual dependem do modelo; o aplicativo não é prontuário clínico certificado. Consulte [a autocrítica](docs/AUTOCRITICA.md).

## Verificar

```bash
npm test
npm run build
npm run typecheck
npx playwright install chromium
npm run start -- --port 3187
# Em outro terminal:
BASE_URL=http://127.0.0.1:3187 npm run test:e2e
```

Testes unitários cobrem substring vazia/fabricada, offsets com espaços iniciais, data sem prova, data de outro evento, calendário, fontes duplicadas, conflitos entre fontes, ocorrências distintas e histórico imutável. E2E cobre destaque, conflito, sem data, correção, auditoria, exportação, mobile e erros de entrada.

## Deploy Vercel

```bash
vercel link --project prontuario-com-prova
vercel env add OPENAI_API_KEY production
# Opcional: vercel env add EXTRACTION_ACCESS_CODE production
vercel --prod
```

Defina variáveis antes de fazer deploy. Não envie `.env.local` ou `.vercel` ao GitHub. O endpoint público pode consumir créditos; configure o código opcional para restringir a demonstração e, antes de uso público amplo, implemente rate limit distribuído. Não há uploads nem imagens de exames.

## Entregáveis

- [Evidências de validação](docs/VALIDACAO.md)
- [Roteiro cronometrado de até 3 minutos](docs/ROTEIRO-VIDEO.md)
- [Autocrítica, riscos e diferenciação](docs/AUTOCRITICA.md)
- [Documentação oficial de Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

O vídeo e as evidências de execução são entregues separadamente do código-fonte.
