'use client';

export function OfflineBanner() {
  return (
    <div
      className="bg-yellow-100 border-l-4 border-yellow-300 text-yellow-800 p-4 mb-6"
      role="alert"
    >
      <p>You are currently offline. Changes will be saved when connection is restored.</p>
    </div>
  );
}
