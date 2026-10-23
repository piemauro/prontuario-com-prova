# Autocrítica

Notas autoatribuídas, sem simular avaliação dos jurados. Pesos iguais, 25% cada.

| Critério          | Nota (1–5) | Evidência e limite                                                                                                                                                                                                        |
| ----------------- | ---------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Funcional         |          4 | Três textos editáveis, extração real com Structured Outputs, fontes literais, conflito, faixa sem data, correção com histórico e exportação. Sem persistência, autenticação de usuários ou avaliação ampla de documentos. |
| Criatividade      |          4 | O diferencial é a navegação evento → frase, a distinção entre presença textual e verdade e a preservação explícita da discordância. A ideia de timeline em si é comum.                                                    |
| Apresentação      |          4 | Interface editorial em português, caso fictício preparado, layout mobile, roteiro com começo, conflito e resolução. A narrativa pessoal do apresentador ainda pode melhorar o pitch.                                      |
| Cumpre o objetivo |          5 | Fluxo mínimo integral, com informação sem data, conflito e correção demonstráveis. Apenas texto, sem uploads de exames ou funções clínicas. A neutralidade do modelo continua exigindo avaliação humana.                  |

Média simples: **4,25/5**. Não é resultado de avaliação externa.

## Três maiores riscos

1. **Identidade do evento depende da IA.** A regra de conflito é determinística, mas o agrupamento usa `eventKey` extraída pelo modelo. Consultas recorrentes podem ser unidas indevidamente ou uma divergência pode ser dividida em duas chaves. Mitigação atual: prompt explícito sobre mesma ocorrência; fontes sempre expostas e correções por afirmação. Próximo passo: interface de separar/unir eventos e conjunto de casos recorrentes avaliado manualmente.
2. **Prova literal não equivale a verdade ou suporte semântico completo.** O código confirma substring, calendário e prova de data dentro do trecho; não prova veracidade, nem que toda descrição está sustentada, nem elimina toda interpretação clínica. Mitigação atual: aviso explícito, prompt restritivo, escopo só de acontecimentos, fontes e revisão humana. Próximo passo: avaliação adversarial e revisão das descrições antes de qualquer uso real.
3. **Protótipo público e efêmero.** Textos vão à OpenAI ao extrair; sessão some ao recarregar e o histórico não é inviolável. Há limite de tamanho, tempo e saída; o código de acesso opcional protege os créditos, mas não há rate limit distribuído. Mitigação: somente dados fictícios, exportação, sem banco de dados, `store:false`, chave no servidor. Produção exigiria autenticação, governança, retenção e auditoria persistente.

## Como se diferenciar de outros times

- Abrir o pitch com o conflito, não com uma promessa genérica de “IA na saúde”. Duas datas incompatíveis são o problema visível em cinco segundos.
- Fazer o jurado clicar na prova: não apenas uma tag de fonte, mas a frase exata destacada e os seus offsets.
- Mostrar uma informação que o produto deliberadamente deixa sem data. A incompletude é visível e revisável.
- Corrigir ao vivo e mostrar que o original continua igual. A correção humana é uma camada separada com histórico.
- Dizer com precisão o que é determinístico e o que depende do modelo: schema estrutura, substring ancora, regra sinaliza, pessoa revisa.
