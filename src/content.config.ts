import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const articoli = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articoli" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    aggiornato: z.coerce.date().optional(),
    autori: z.array(z.string()).default(["Redazione"]),
    rubriche: z.array(z.string()).default([]),
    copertina: z.string().optional(),
    alt_copertina: z.string().optional().default(""),
    descrizione: z.string().optional().default(""),
    in_evidenza: z.boolean().optional().default(false),
  }),
});

const rubriche = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/rubriche" }),
  schema: z.object({
    nome: z.string(),
    descrizione: z.string().optional().default(""),
    ordine: z.number().optional().default(99),
  }),
});

const pagine = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pagine" }),
  schema: z.object({
    title: z.string(),
    descrizione: z.string().optional().default(""),
  }),
});

export const collections = { articoli, rubriche, pagine };
