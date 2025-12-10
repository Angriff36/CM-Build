export default function HomePage() {
  return (
    <main className="p-8 font-sans">
      <section className="max-w-2xl space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">PrepChef</p>
        <h1 className="text-3xl font-semibold text-zinc-900">
          Workspace bootstrapped.
        </h1>
        <p className="text-base text-zinc-700">
          This placeholder route proves the Turbo monorepo wiring works. Start the dev server via
          <code className="mx-2 rounded bg-zinc-900 px-2 py-1 text-xs text-white">pnpm dev --filter @caterkingapp/prepchef</code>
          and connect Supabase + Flagsmith once credentials are available.
        </p>
      </section>
    </main>
  );
}