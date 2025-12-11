'use client';

import React, { useState } from 'react';

interface MediaGalleryProps {
  mediaUrls: string[];
  className?: string;
}

export function MediaGallery({ mediaUrls, className }: MediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<number | null>(null);

  if (!mediaUrls || mediaUrls.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <p>No media available for this recipe.</p>
      </div>
    );
  }

  const getMediaType = (url: string): 'image' | 'video' => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'image';
    }
    return 'video';
  };

  const handleMediaClick = (index: number) => {
    setSelectedMedia(index);
  };

  const handleCloseModal = () => {
    setSelectedMedia(null);
  };

  const renderMediaThumbnail = (url: string, index: number) => {
    const type = getMediaType(url);

    return (
      <div
        key={index}
        className="relative cursor-pointer group"
        onClick={() => handleMediaClick(index)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleMediaClick(index);
          }
        }}
        aria-label={`View ${type} ${index + 1}`}
      >
        <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
          {type === 'image' ? (
            <img
              src={url}
              alt={`Recipe image ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gray-400 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-xs text-gray-600">Video</p>
              </div>
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg" />
      </div>
    );
  };

  const renderMediaModal = () => {
    if (selectedMedia === null) return null;

    const url = mediaUrls[selectedMedia];
    const type = getMediaType(url);

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
        onClick={handleCloseModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-modal-title"
      >
        <div
          className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h3 id="media-modal-title" className="text-lg font-semibold">
              {type === 'image' ? 'Recipe Image' : 'Recipe Video'} {selectedMedia + 1}
            </h3>
            <button
              onClick={handleCloseModal}
              className="text-gray-500 hover:text-gray-700 px-3 py-1 border rounded"
              aria-label="Close media viewer"
            >
              Close
            </button>
          </div>

          <div className="p-4">
            {type === 'image' ? (
              <img
                src={url}
                alt={`Recipe image ${selectedMedia + 1}`}
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <video controls className="w-full max-h-96 rounded-lg" preload="metadata">
                <source src={url} />
                Your browser does not support the video tag.
                <div className="p-4 text-center">
                  <p className="mb-2">Video playback is not supported in your browser.</p>
                  <a
                    href={url}
                    className="text-blue-500 underline hover:text-blue-600"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download video instead
                  </a>
                </div>
              </video>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {mediaUrls.map((url, index) => renderMediaThumbnail(url, index))}
      </div>

      {renderMediaModal()}
    </>
  );
}
