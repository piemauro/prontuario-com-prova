# Roteiro de vídeo — até 3 minutos

Pitch principal: **A IA organiza. A fonte comprova. Você mantém o controle.**

O vídeo entregue é uma gravação real do aplicativo, com legendas de capítulo. Este roteiro serve para a apresentação ao vivo ou regravação com voz. Use apenas Helena Costa, pessoa fictícia.

| Tempo     | Ação na tela                                                  | Fala sugerida                                                                                                                                                                                                          |
| --------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:20 | Mostrar título, aviso e três campos preenchidos               | “O histórico de saúde de uma pessoa fica espalhado entre uma alta, uma mensagem e anotações da família. O Prontuário com Prova transforma esses textos numa história que pode ser conferida.”                          |
| 0:20–0:45 | Clicar Organizar com IA; mostrar linha do tempo               | “A API da OpenAI usa Structured Outputs para extrair acontecimentos, datas e trechos literais. Depois, o código procura cada trecho por correspondência exata. Um trecho inexistente fica como origem não confirmada.” |
| 0:45–1:10 | Selecionar entrada no hospital e sua fonte                    | “Cada evento leva à frase original, que recebe este destaque. O selo confirma que a frase existe no documento; não atesta que o relato é verdadeiro.”                                                                  |
| 1:10–1:35 | Filtro Sem data → fisioterapia                                | “A família escreveu que Helena iniciou sessões de fisioterapia, mas não anotou quando. O sistema não usa a data da mensagem nem inventa uma data: a informação fica nesta faixa.”                                      |
| 1:35–2:00 | Filtro Conflitantes; clicar nas duas fontes                   | “O resumo registra retorno em 22 de maio. A mensagem registra 23. O código detecta as duas datas em fontes distintas para a mesma ocorrência e marca o conflito. Nenhuma versão é descartada.”                         |
| 2:00–2:30 | Corrigir afirmação do médico para 22/05/2026; informar motivo | “Neste caso fictício, a família confirmou o dia 22. Corrigimos a afirmação desta fonte e registramos o motivo. O evento passa a exibir corrigido por humano.”                                                          |
| 2:30–2:50 | Alterações e Exportar; mostrar fonte ainda com 23/05          | “O histórico guarda antes, depois e horário. A frase original continua intacta. O JSON exportado permite levar textos, evidências e correções para uma revisão.”                                                       |
| 2:50–3:00 | Encerrar no produto                                           | “Organização documental, sem diagnóstico ou recomendação. Mais do que resumir um histórico: tornar cada registro verificável.”                                                                                         |

## Contingência honesta

Se a API estiver indisponível, clicar **Explorar demonstração** e dizer: “Este é o modo demonstrativo com extração pré-definida; as verificações, conflitos, destaques e correções são executados pelo aplicativo.” O modo fica explicitamente rotulado. Não apresentar fixture como chamada real à IA.

## Preparação

- Abrir a URL pública e verificar a API antes de gravar.
- Zoom de 90–100%, viewport 1440 × 1000 ou maior.
- Não inserir nomes ou documentos reais.
- Uma correção afeta uma afirmação por vez. O conflito só desaparece quando as datas nas fontes distintas deixam de discordar.
- Exportar antes de recarregar: a sessão não persiste.
