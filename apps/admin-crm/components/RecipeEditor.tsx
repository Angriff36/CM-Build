'use client';

import React, { useState, useEffect } from 'react';
import { useRecipe } from '@caterkingapp/shared/hooks/useRecipe';
import { useToast } from '@caterkingapp/shared/hooks/useToast';
import {
  RecipeSchema,
  IngredientSchema,
  Recipe,
  Ingredient,
} from '@caterkingapp/shared/dto/recipes';

interface RecipeEditorProps {
  recipeId: string;
}

export function RecipeEditor({ recipeId }: RecipeEditorProps) {
  const { data: recipe, isLoading, updateRecipe } = useRecipe(recipeId);
  const { addToast } = useToast();
  const [formData, setFormData] = useState<Partial<Recipe>>({
    name: '',
    ingredients: [],
    steps: [],
    media_urls: [],
  });
  const [newIngredient, setNewIngredient] = useState<Partial<Ingredient>>({
    name: '',
    quantity: 0,
    unit: '',
  });
  const [newStep, setNewStep] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (recipe) {
      setFormData(recipe);
    }
  }, [recipe]);

  const handleSave = async () => {
    try {
      const validatedData = RecipeSchema.parse(formData);
      await updateRecipe(validatedData);
      addToast('Recipe updated successfully', 'success');
    } catch (error) {
      addToast('Failed to update recipe', 'error');
    }
  };

  const addIngredient = () => {
    try {
      const validatedIngredient = IngredientSchema.parse(newIngredient);
      setFormData((prev) => ({
        ...prev,
        ingredients: [...(prev.ingredients || []), validatedIngredient],
      }));
      setNewIngredient({ name: '', quantity: 0, unit: '' });
    } catch (error) {
      addToast('Invalid ingredient data', 'error');
    }
  };

  const removeIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients?.filter((_, i) => i !== index) || [],
    }));
  };

  const addStep = () => {
    if (newStep.trim()) {
      setFormData((prev) => ({
        ...prev,
        steps: [...(prev.steps || []), newStep.trim()],
      }));
      setNewStep('');
    }
  };

  const removeStep = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadProgress(10);

    try {
      // Import Supabase client
      const { createClient } = await import('@caterkingapp/supabase/client');
      const supabase = createClient();

      setUploadProgress(20);

      // Get current user for company_id
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!userData?.company_id) throw new Error('Company not found');

      setUploadProgress(30);

      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${userData.company_id}/${fileName}`;

      setUploadProgress(50);

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (uploadError) throw uploadError;

      setUploadProgress(80);

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('media').getPublicUrl(filePath);

      // Create media asset record
      const { data: mediaAsset, error: assetError } = await supabase
        .from('media_assets')
        .insert({
          company_id: userData.company_id,
          url: publicUrl,
          type: file.type,
          storage_path: filePath,
          status: 'ready', // For images, no processing needed
        })
        .select()
        .single();

      if (assetError) throw assetError;

      setUploadProgress(100);

      setFormData((prev) => ({
        ...prev,
        media_urls: [...(prev.media_urls || []), publicUrl],
      }));

      addToast('Media uploaded successfully', 'success');
    } catch (error) {
      console.error('Upload error:', error);
      addToast('Failed to upload media', 'error');
    } finally {
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  if (isLoading) return <div className="p-4">Loading recipe...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Edit Recipe</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Recipe Name</label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Ingredients</h3>
          <div className="space-y-2">
            {formData.ingredients?.map((ingredient, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="flex-1">{ingredient.name}</span>
                <span>
                  {ingredient.quantity} {ingredient.unit}
                </span>
                <button
                  onClick={() => removeIngredient(index)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <input
              type="text"
              placeholder="Ingredient name"
              value={newIngredient.name || ''}
              onChange={(e) => setNewIngredient((prev) => ({ ...prev, name: e.target.value }))}
              className="flex-1 p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newIngredient.quantity || ''}
              onChange={(e) =>
                setNewIngredient((prev) => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))
              }
              className="w-24 p-2 border rounded"
            />
            <input
              type="text"
              placeholder="Unit"
              value={newIngredient.unit || ''}
              onChange={(e) => setNewIngredient((prev) => ({ ...prev, unit: e.target.value }))}
              className="w-20 p-2 border rounded"
            />
            <button onClick={addIngredient} className="px-4 py-2 bg-green-600 text-white rounded">
              Add
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Steps</h3>
          <div className="space-y-2">
            {formData.steps?.map((step, index) => (
              <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                <span className="font-medium mr-2">{index + 1}.</span>
                <span className="flex-1">{step}</span>
                <button
                  onClick={() => removeStep(index)}
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <textarea
              placeholder="Add a step"
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              className="flex-1 p-2 border rounded"
              rows={2}
            />
            <button
              onClick={addStep}
              className="px-4 py-2 bg-green-600 text-white rounded self-start"
            >
              Add Step
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Media</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {formData.media_urls?.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      media_urls: prev.media_urls?.filter((_, i) => i !== index) || [],
                    }))
                  }
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
              id="media-upload"
            />
            <label
              htmlFor="media-upload"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700"
            >
              Upload Media
            </label>
            {uploadProgress > 0 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">Uploading... {uploadProgress}%</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Recipe
          </button>
        </div>
      </div>
    </div>
  );
}
