import { z } from "zod";
export const SourceSchema = z.object({
  id: z.enum(["alta", "medico", "familia"]),
  title: z.string().min(1).max(100),
  text: z
    .string()
    .min(1)
    .max(6000)
    .refine((text) => text.trim().length > 0),
});
export type Source = z.infer<typeof SourceSchema>;
export const InputSchema = z.object({
  sources: z
    .array(SourceSchema)
    .length(3)
    .refine(
      (s) => new Set(s.map((x) => x.id)).size === 3,
      "As três fontes devem ser distintas.",
    ),
  accessCode: z.string().max(200).optional(),
});
export const ExtractionSchema = z.object({
  events: z.array(
    z.object({
      sourceId: z.enum(["alta", "medico", "familia"]),
      eventKey: z
        .string()
        .describe(
          "Identificador compartilhado APENAS para a mesma ocorrência nas diferentes fontes, ex: retorno-ambulatorial-unico. Ocorrências repetidas têm chaves diferentes.",
        ),
      date: z
        .string()
        .nullable()
        .describe(
          "YYYY-MM-DD apenas se dia, mês e ano explícitos no texto da fonte. Caso contrário null. Nunca inferir ano ou usar a data da mensagem para um evento.",
        ),
      description: z
        .string()
        .describe(
          "Descrição factual curta em português, sem diagnóstico, interpretação clínica, prognóstico ou recomendação.",
        ),
      quote: z
        .string()
        .describe(
          "Trecho literal não vazio copiado exatamente da fonte, sem corrigir pontuação ou espaços. Deve sustentar a descrição.",
        ),
      dateQuote: z
        .string()
        .nullable()
        .describe(
          "Trecho literal contido em quote com a data que sustenta o evento. Null se não houver data completa explícita.",
        ),
    }),
  ),
});
export type RawEvent = z.infer<typeof ExtractionSchema>["events"][number];
