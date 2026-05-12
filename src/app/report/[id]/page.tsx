import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BarChart3, TrendingDown, Sparkles, ExternalLink, ArrowLeft, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { AuditResult, ToolAuditResult } from '@/lib/types';

/* ============================================
   DATA FETCHING
============================================ */
interface AuditRecord {
  id: string;
  created_at: string;
  team_size: number;
  use_case: string;
  tools: unknown;
  results: AuditResult;
  total_monthly_savings: number;
  total_annual_savings: number;
  ai_summary: string | null;
  is_public: boolean;
}

async function getAuditById(id: string): Promise<AuditRecord | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), '.data', `${id}.json`);
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data) as AuditRecord;
      }
    } catch (e) {
      console.error('[StackAudit] Local fallback read failed:', e);
    }
    return null;
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('audits')
      .select('*')
      .eq('id', id)
      .eq('is_public', true)
      .single();

    if (error || !data) return null;
    return data as AuditRecord;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const audit = await getAuditById(id);

  if (!audit) {
    return { title: 'Report Not Found | StackAudit' };
  }

  return {
    title: `$${audit.total_annual_savings.toLocaleString()}/yr in AI Savings Found | StackAudit`,
    description: `This ${audit.team_size}-person team found $${audit.total_monthly_savings.toLocaleString()}/mo in savings. Audit your stack for free.`,
    openGraph: {
      title: `We just found $${audit.total_annual_savings.toLocaleString()} in AI tool savings! 🚀`,
      description: `StackAudit analyzed the stack and found $${audit.total_monthly_savings.toLocaleString()}/mo in overspend.`,
      type: 'website',
      siteName: 'StackAudit',
    },
    twitter: {
      card: 'summary_large_image',
      title: `$${audit.total_annual_savings.toLocaleString()}/yr in AI Savings Found`,
      description: `This ${audit.team_size}-person team found $${audit.total_monthly_savings.toLocaleString()}/mo in savings.`,
    },
  };
}

function ActionBadge({ action }: { action: ToolAuditResult['recommendedAction'] }) {
  const styles: Record<string, string> = {
    keep: 'badge-success', downgrade: 'badge-warning', switch: 'badge-info', optimize: 'badge-warning', consolidate: 'badge-danger',
  };
  return <span className={`badge ${styles[action] || 'badge-info'}`}>{action.toUpperCase()}</span>;
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await getAuditById(id);

  if (!audit) notFound();

  const { results, team_size, use_case, ai_summary, created_at } = audit;
  const createdDate = new Date(created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col items-center min-h-screen">
      <header className="w-full border-b border-gray-800/80 bg-[#0f172a] py-4 px-6 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity" aria-label="StackAudit Home">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <BarChart3 size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Stack<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Audit</span>
            </span>
          </Link>
          <Link href="/" className="btn-secondary flex items-center gap-1.5 text-sm" aria-label="Run a new audit">
            <ArrowLeft size={14} /> Run Audit
          </Link>
        </div>
      </header>

      <main className="w-full max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="badge badge-info mb-5">📊 Public Report</span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white">
            AI Stack Audit
          </h1>
          <p className="text-sm font-mono text-gray-500 bg-gray-800/30 inline-block px-3 py-1.5 rounded-lg border border-gray-800/50">
            {team_size}-person team • {use_case} • {createdDate}
          </p>
        </div>

        <div className="sv-card p-10 text-center mb-10 border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.1)]">
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-4">
            Potential Savings
          </p>
          <div className="mb-2">
            <p className="text-6xl sm:text-7xl font-bold text-gradient mb-2 inline-block">
              ${results.totalMonthlySavings.toLocaleString()}
            </p>
            <span className="text-2xl font-semibold text-gray-500 ml-2">/mo</span>
          </div>
          <p className="text-xl font-bold text-gray-300">
            ${results.totalAnnualSavings.toLocaleString()}
            <span className="text-sm font-medium text-gray-500"> per year</span>
          </p>
        </div>

        {/* Benchmark Gauge */}
        {results.benchmark && results.benchmark.status !== 'unavailable' && (
          <div className="sv-card p-6 sm:p-8 mb-10 bg-black/20 border border-white/5" role="region" aria-label="AI Spend Benchmark">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2 tracking-tight">
                  <BarChart3 size={20} className="text-indigo-400" />
                  AI Spend Benchmark
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Your AI spend per developer is <span className="text-white font-mono font-medium">${results.benchmark.spendPerDev}/mo</span>.
                  Industry average: <span className="text-white font-mono font-medium">${results.benchmark.industryAverage}/mo</span>.
                </p>
              </div>
              <span className={`text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-md border uppercase tracking-wider ${
                results.benchmark.status === 'below' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                results.benchmark.status === 'above' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                'text-amber-400 bg-amber-400/10 border-amber-400/20'
              }`}>
                {results.benchmark.status === 'below' ? 'Highly Efficient' :
                 results.benchmark.status === 'above' ? 'Overspending' : 'Average'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative mt-8">
              <div className="absolute -top-6 text-[10px] text-gray-500 font-mono tracking-widest" style={{ left: '50%', transform: 'translateX(-50%)' }}>
                INDUSTRY AVG
              </div>
              <div className="relative h-3 bg-[#0a0f18] border border-white/5 rounded-full overflow-hidden shadow-inner">
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white/20 z-20"
                  style={{ left: '50%' }}
                ></div>
                <div
                  className={`absolute top-0 bottom-0 left-0 z-10 rounded-full transition-all duration-1000 ${
                    results.benchmark.status === 'below' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' :
                    results.benchmark.status === 'above' ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]' :
                    'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                  }`}
                  style={{ width: `${Math.min((results.benchmark.spendPerDev / (results.benchmark.industryAverage * 2)) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {ai_summary && (
          <div className="sv-card p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-10 h-10 rounded-xl flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <h2 className="text-lg font-semibold text-white">AI CFO Analysis</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">{ai_summary}</p>
          </div>
        )}

        <div className="flex items-center gap-3 mb-6 mt-12">
          <div className="bg-pink-500/10 border border-pink-500/20 text-pink-400 w-10 h-10 rounded-xl flex items-center justify-center">
            <TrendingDown size={18} />
          </div>
          <h2 className="text-xl font-semibold text-white tracking-tight">Tool Breakdown</h2>
        </div>

        <div className="space-y-4 mb-16">
          {results.toolResults.map((tr: ToolAuditResult, i: number) => (
            <div key={i} className="sv-card sv-card-hover p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white text-lg">{tr.tool}</h3>
                  <p className="text-sm text-gray-500 font-mono mt-1">
                    Current: {tr.currentPlan} — ${tr.currentSpend}/mo
                  </p>
                </div>
                <ActionBadge action={tr.recommendedAction} />
              </div>

              <p className="text-sm text-gray-400 leading-relaxed mb-4 pb-4 border-b border-gray-800">
                {tr.defensibleReason}
              </p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300 font-medium flex items-center gap-2">
                  <ArrowRight size={14} className="text-purple-400" />
                  {tr.recommendedTool && tr.recommendedTool !== tr.tool ? `${tr.recommendedTool} ` : ''}{tr.recommendedPlan}
                </span>
                {tr.savingsMonthly > 0 && (
                  <span className="font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-lg border border-emerald-400/20">
                    Save ${tr.savingsMonthly.toLocaleString()}/mo
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="sv-card p-10 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 z-0 transition-opacity opacity-0 group-hover:opacity-100"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-3 text-white tracking-tight">Want your own audit?</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Find hidden savings in your AI stack — it takes 60 seconds, requires no credit card, and is completely free.
            </p>
            <Link href="/" className="btn-primary inline-flex items-center gap-2 px-8 py-3" aria-label="Start your free AI stack audit">
              Audit My Stack <ExternalLink size={16} />
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full border-t border-gray-800/80 bg-[#0f172a] py-10 flex items-center justify-center text-gray-500 text-sm font-medium mt-auto">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-gray-600" /> StackAudit <span className="text-gray-700">|</span> Crafted for Developers
        </div>
      </footer>
    </div>
  );
}
