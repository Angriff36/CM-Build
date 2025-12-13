export default function HomePage() {
  return (
    <main className="p-8 font-sans">
      <section className="max-w-2xl space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">PrepChef</p>
        <h1 className="text-3xl font-semibold text-zinc-900">
          Welcome to PrepChef
        </h1>
        <p className="text-base text-zinc-700">
          Kitchen prep management system powered by Supabase + Next.js
        </p>
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
          <h2 className="font-semibold text-blue-900 mb-2">Status</h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Frontend server running</li>
            <li>✓ Connected to Supabase at localhost:54321</li>
            <li>Navigation: /tasks - Task management</li>
          </ul>
        </div>
      </section>
    </main>
  );
}