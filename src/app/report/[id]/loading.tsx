export default function ReportLoading() {
  return (
    <div className="flex flex-col items-center min-h-screen">
      <header className="w-full border-b border-gray-800/80 bg-[#0f172a] py-4 px-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-800 animate-pulse"></div>
            <div className="w-24 h-6 rounded bg-gray-800 animate-pulse"></div>
          </div>
          <div className="w-24 h-8 rounded-lg bg-gray-800 animate-pulse"></div>
        </div>
      </header>

      <main className="w-full max-w-3xl mx-auto px-6 py-16" aria-busy="true" aria-label="Loading audit report">
        {/* Title Skeleton */}
        <div className="text-center mb-12">
          <div className="w-32 h-6 rounded bg-gray-800 animate-pulse mx-auto mb-5"></div>
          <div className="w-64 h-10 rounded bg-gray-800 animate-pulse mx-auto mb-4"></div>
          <div className="w-48 h-5 rounded bg-gray-800 animate-pulse mx-auto"></div>
        </div>

        {/* Savings Hero Skeleton */}
        <div className="sv-card p-10 text-center mb-10 border-gray-800">
          <div className="w-40 h-4 rounded bg-gray-800 animate-pulse mx-auto mb-6"></div>
          <div className="w-48 h-16 rounded bg-gray-800 animate-pulse mx-auto mb-4"></div>
          <div className="w-36 h-6 rounded bg-gray-800 animate-pulse mx-auto"></div>
        </div>

        {/* Benchmark Skeleton */}
        <div className="sv-card p-8 mb-10 border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-5 rounded bg-gray-800 animate-pulse"></div>
            <div className="w-40 h-5 rounded bg-gray-800 animate-pulse"></div>
          </div>
          <div className="w-full h-3 rounded-full bg-gray-800 animate-pulse mt-8"></div>
        </div>

        {/* AI Summary Skeleton */}
        <div className="sv-card p-8 mb-8 border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gray-800 animate-pulse"></div>
            <div className="w-36 h-5 rounded bg-gray-800 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <div className="w-full h-4 rounded bg-gray-800 animate-pulse"></div>
            <div className="w-full h-4 rounded bg-gray-800 animate-pulse"></div>
            <div className="w-3/4 h-4 rounded bg-gray-800 animate-pulse"></div>
          </div>
        </div>

        {/* Tool Cards Skeleton */}
        {[1, 2].map((i) => (
          <div key={i} className="sv-card p-6 mb-4 border-gray-800">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="w-32 h-5 rounded bg-gray-800 animate-pulse mb-2"></div>
                <div className="w-48 h-3 rounded bg-gray-800 animate-pulse"></div>
              </div>
              <div className="w-20 h-6 rounded bg-gray-800 animate-pulse"></div>
            </div>
            <div className="w-full h-4 rounded bg-gray-800 animate-pulse mb-4"></div>
            <div className="w-2/3 h-4 rounded bg-gray-800 animate-pulse"></div>
          </div>
        ))}
      </main>
    </div>
  );
}
