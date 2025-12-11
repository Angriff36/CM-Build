import { useQuery } from '@tanstack/react-query';
import { createClient } from '@caterkingapp/supabase/client';
import { Recipe, RecipeSchema } from '../dto/recipes';

// Export both interfaces to support both usage patterns
interface UseRecipeOptions {
  recipeId?: string;
  enabled?: boolean;
}

export function useRecipe(
  recipeIdOrOptions?: string | UseRecipeOptions,
  options: UseRecipeOptions = {},
) {
  // Handle both usage patterns: useRecipe(recipeId) and useRecipe({ recipeId })
  let recipeId: string | null;
  let enabled = true;

  if (typeof recipeIdOrOptions === 'string') {
    recipeId = recipeIdOrOptions;
    enabled = options.enabled ?? true;
  } else if (recipeIdOrOptions && typeof recipeIdOrOptions === 'object') {
    recipeId = recipeIdOrOptions.recipeId || null;
    enabled = recipeIdOrOptions.enabled ?? true;
  } else {
    recipeId = null;
    enabled = false;
  }

  return useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: async (): Promise<Recipe | null> => {
      if (!recipeId) return null;

      const supabase = createClient();
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return null;
        }
        throw error;
      }

      // Validate and transform the data
      const validatedData = RecipeSchema.parse(data);
      return validatedData;
    },
    enabled: enabled && !!recipeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
