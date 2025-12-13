import { z } from 'zod';

export const IngredientSchema = z.object({
  name: z.string(),
  quantity: z.number(),
  unit: z.string().optional(),
});

export const RecipeSchema = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  name: z.string(),
  ingredients: z.array(IngredientSchema),
  steps: z.array(z.string()),
  media_urls: z.array(z.string()),
  version: z.number().optional(),
  tags: z.array(z.string()).optional(),
  allergen_flags: z.record(z.string(), z.boolean()).default({}),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Recipe = z.infer<typeof RecipeSchema>;
export type Ingredient = z.infer<typeof IngredientSchema>;
