import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { createClient } from '@caterkingapp/supabase';
import { Recipe, RecipeSchema } from '../dto/recipes';
import { useRealtimeSync } from './useRealtimeSync';

// Export both interfaces to support both usage patterns
interface UseRecipeOptions {
  recipeId?: string;
  enabled?: boolean;
}

export function useRecipe(
  recipeIdOrOptions?: string | UseRecipeOptions,
  options: UseRecipeOptions = {},
) {
  const queryClient = useQueryClient();
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyId = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();
      if (userData) setCompanyId(userData.company_id);
    };
    fetchCompanyId();
  }, []);

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

  const recipeQuery = useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: async (): Promise<Recipe | null> => {
      if (!recipeId) return null;

      const supabase = createClient();

      // Get user's company_id for filtering
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!userData) throw new Error('User company not found');

      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .eq('company_id', userData.company_id)
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

  const updateRecipeMutation = useMutation({
    mutationFn: async (recipeData: Recipe) => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('recipes')
        .update({
          name: recipeData.name,
          ingredients: recipeData.ingredients,
          steps: recipeData.steps,
          media_urls: recipeData.media_urls,
          updated_at: new Date().toISOString(),
        })
        .eq('id', recipeData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipe'] });
    },
  });

  const realtimeState = useRealtimeSync({
    channelConfig: {
      name: companyId ? `company:${companyId}:recipes` : 'recipes',
      postgresChanges: companyId
        ? [
            {
              event: '*',
              schema: 'public',
              table: 'recipes',
            },
          ]
        : [],
    },
    queryKeysToInvalidate: [['recipe']],
  });

  return {
    ...recipeQuery,
    updateRecipe: updateRecipeMutation.mutateAsync,
    isUpdating: updateRecipeMutation.isPending,
    realtimeState,
  };
}
