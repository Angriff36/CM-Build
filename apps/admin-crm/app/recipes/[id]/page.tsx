'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@codemachine/shared/hooks/useUser';
import { RecipeEditor } from '../../../components/RecipeEditor';

export default function RecipePage() {
  const params = useParams();
  const recipeId = params.id as string;
  const { data: user, isLoading } = useUser();

  if (isLoading) return <div className="p-4">Loading...</div>;

  if (!user || user.role !== 'owner') {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Access denied. Only owners can edit recipes.
        </div>
      </div>
    );
  }

  return <RecipeEditor recipeId={recipeId} />;
}
