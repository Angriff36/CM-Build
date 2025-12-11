export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Admin CRM</h1>
        <p className="text-gray-300 mb-8">Event and task management interface</p>
        <div className="space-y-3">
          <a
            href="/tasks"
            className="block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Task Board
          </a>
          <a
            href="/tasks/combine"
            className="block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            Task Combinations
          </a>
        </div>
      </div>
    </div>
  );
}
