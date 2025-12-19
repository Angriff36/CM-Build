'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@codemachine/supabase';
import { useToast } from '@codemachine/shared/hooks/useToast';
import { useUser } from '@codemachine/shared/hooks/useUser';
import Link from 'next/link';

// Force dynamic rendering to avoid static generation issues with hooks
export const dynamic = 'force-dynamic';

interface Recipe {
  id: string;
  name: string;
  ingredients: Array<{ name: string; quantity: number; unit?: string }>;
  steps: string[];
  media_urls?: string[];
  created_at: string;
  updated_at: string;
  version?: string | null;
}

export default function RecipesPage() {
  const { addToast } = useToast();
  const { data: user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');

  const canManageRecipes = user && ['owner', 'manager'].includes(user.role);

  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: async (): Promise<Recipe[]> => {
      const supabase = createClient();

      // Get user's company_id
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
        .eq('company_id', userData.company_id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((recipe: any) => ({
        ...recipe,
        media_urls: recipe.media_urls || [],
      }));
    },
  });

  const filteredRecipes = recipes?.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading recipes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
          {canManageRecipes && (
            <Link
              href="/recipes/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Recipe
            </Link>
          )}
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes?.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              {recipe.media_urls && recipe.media_urls.length > 0 && (
                <div className="h-48 bg-gray-200">
                  <img
                    src={recipe.media_urls[0]}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{recipe.name}</h3>
                <div className="text-sm text-gray-600 mb-4">
                  <div>{recipe.ingredients.length} ingredients</div>
                  <div>{recipe.steps.length} steps</div>
                  {recipe.media_urls && recipe.media_urls.length > 0 && (
                    <div>{recipe.media_urls.length} media items</div>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Updated {new Date(recipe.updated_at).toLocaleDateString()}
                  </span>
                  {canManageRecipes && (
                    <Link
                      href={`/recipes/${recipe.id}`}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {(!filteredRecipes || filteredRecipes.length === 0) && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              {searchTerm ? 'No recipes found matching your search' : 'No recipes found'}
            </div>
            {canManageRecipes && (
              <Link
                href="/recipes/new"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create your first recipe
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
