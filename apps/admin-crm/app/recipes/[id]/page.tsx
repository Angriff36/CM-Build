'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { RecipeEditor } from '../../components/RecipeEditor';

export default function RecipePage() {
  const params = useParams();
  const recipeId = params.id as string;

  return <RecipeEditor recipeId={recipeId} />;
}
