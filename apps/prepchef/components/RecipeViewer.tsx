'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRecipe } from '@caterkingapp/shared/hooks/useRecipe';
import { MediaGallery } from './MediaGallery';

interface RecipeViewerProps {
  recipeId: string;
  onClose: () => void;
  taskQuantity: number;
}

export function RecipeViewer({ recipeId, onClose, taskQuantity }: RecipeViewerProps) {
  const [activeTab, setActiveTab] = useState('steps');
  const [scale, setScale] = useState(taskQuantity || 1);
  const [isVisible, setIsVisible] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  const { data: recipe, isLoading, error } = useRecipe(recipeId);

  useEffect(() => {
    // Trigger slide-in animation
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // Focus trap
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Tab') {
        const focusableElements = drawerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusableElements) {
          const first = focusableElements[0] as HTMLElement;
          const last = focusableElements[focusableElements.length - 1] as HTMLElement;
          if (e.shiftKey) {
            if (document.activeElement === first) {
              last.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === last) {
              first.focus();
              e.preventDefault();
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    firstFocusableRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const scaledIngredients = recipe?.ingredients.map((ing) => ({
    ...ing,
    quantity: ing.quantity * scale,
  }));

  if (isLoading) return <div>Loading recipe...</div>;
  if (error) return <div>Error loading recipe</div>;
  if (!recipe) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black bg-opacity-50" onClick={onClose} />
      <div
        ref={drawerRef}
        className={`w-full max-w-md bg-white shadow-lg transform transition-transform duration-300 ease-out ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-labelledby="recipe-title"
        aria-modal="true"
      >
        <header className="flex justify-between items-center p-4 border-b">
          <h2 id="recipe-title" className="text-xl font-semibold">
            {recipe.name}
          </h2>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close recipe viewer"
          >
            ✕
          </button>
        </header>

        <nav className="flex border-b" role="tablist" aria-label="Recipe sections">
          {['steps', 'ingredients', 'media', 'notes'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 text-center capitalize ${
                activeTab === tab ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'
              }`}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`${tab}-panel`}
              id={`${tab}-tab`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <main className="p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          {activeTab === 'steps' && (
            <div role="tabpanel" id="steps-panel" aria-labelledby="steps-tab">
              {recipe.steps.map((step, index) => (
                <div key={index} className="mb-4">
                  <h3 className="font-semibold">Step {index + 1}</h3>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{step}</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div role="tabpanel" id="ingredients-panel" aria-labelledby="ingredients-tab">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Scale: {scale.toFixed(1)}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <ul>
                {scaledIngredients?.map((ing, index) => (
                  <li key={index} className="mb-2">
                    {ing.quantity} {ing.unit} {ing.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'media' && (
            <div role="tabpanel" id="media-panel" aria-labelledby="media-tab">
              <MediaGallery mediaUrls={recipe.media_urls} />
            </div>
          )}

          {activeTab === 'notes' && (
            <div role="tabpanel" id="notes-panel" aria-labelledby="notes-tab">
              <p>No notes available.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
