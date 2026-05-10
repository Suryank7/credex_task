import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BarChart3, TrendingDown, Sparkles, ExternalLink, ArrowLeft } from 'lucide-react';
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
    console.warn('[StackAudit] Supabase not configured. Cannot fetch report.');
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

/* ============================================
   DYNAMIC OPEN GRAPH METADATA
============================================ */
type MetadataProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { id } = await params;
  const audit = await getAuditById(id);

  if (!audit) {
    return {
      title: 'Report Not Found | StackAudit',
      description: 'This audit report could not be found.',
    };
  }

  const monthlySavings = audit.total_monthly_savings;
  const annualSavings = audit.total_annual_savings;
  const toolCount = audit.results?.toolResults?.length || 0;

  return {
    title: `$${annualSavings.toLocaleString()}/yr in AI Savings Found | StackAudit`,
    description: `This ${audit.team_size}-person team found $${monthlySavings.toLocaleString()}/mo in savings across ${toolCount} AI tools. Audit your stack for free.`,
    openGraph: {
      title: `We just found $${annualSavings.toLocaleString()} in AI tool savings! 🚀`,
      description: `StackAudit analyzed ${toolCount} tools and found $${monthlySavings.toLocaleString()}/mo in overspend. Audit your stack for free at stackaudit.dev`,
      type: 'website',
      siteName: 'StackAudit by Credex',
    },
    twitter: {
      card: 'summary_large_image',
      title: `$${annualSavings.toLocaleString()}/yr in AI tool savings found 🔍`,
      description: `StackAudit found major savings across ${toolCount} AI tools. Free audit — no signup required.`,
    },
  };
}

/* ============================================
   ACTION BADGE COMPONENT
============================================ */
function ActionBadge({ action }: { action: ToolAuditResult['recommendedAction'] }) {
  const styles: Record<string, string> = {
    keep: 'badge-success',
    downgrade: 'badge-warning',
    switch: 'badge-info',
    optimize: 'badge-warning',
    consolidate: 'badge-danger',
  };
  const labels: Record<string, string> = {
    keep: '✓ Optimal',
    downgrade: '↓ Downgrade',
    switch: '↔ Switch',
    optimize: '⚡ Optimize',
    consolidate: '⊕ Consolidate',
  };
  return <span className={`badge ${styles[action] || 'badge-info'}`}>{labels[action] || action}</span>;
}

/* ============================================
   REPORT PAGE COMPONENT
   Privacy: Strips email, company name — shows only tools & savings
============================================ */
export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const audit = await getAuditById(id);

  if (!audit) {
    notFound();
  }

  const { results, team_size, use_case, ai_summary, created_at } = audit;
  const createdDate = new Date(created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col items-center min-h-screen">
      {/* Header */}
      <header className="w-full border-b border-white/5 py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <BarChart3 size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Stack<span className="text-indigo-400">Audit</span>
            </span>
          </Link>
          <Link
            href="/"
            className="btn-secondary flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft size={14} /> Run Your Own Audit
          </Link>
        </div>
      </header>

      {/* Report Content */}
      <main className="w-full max-w-3xl mx-auto px-6 py-12">
        {/* Report Header */}
        <div className="text-center mb-10">
          <span className="badge badge-info mb-4">📊 Shared Report</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            AI Stack Audit Report
          </h1>
          <p className="text-sm text-slate-500">
            {team_size}-person team • {use_case} • Generated {createdDate}
          </p>
        </div>

        {/* Savings Hero */}
        <div className="glass-card p-8 sm:p-10 text-center mb-8">
          <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-3">
            Potential Savings Identified
          </p>
          <p className="text-5xl sm:text-6xl font-black savings-number mb-1">
            ${results.totalMonthlySavings.toLocaleString()}
            <span className="text-xl font-semibold text-slate-400">/mo</span>
          </p>
          <p className="text-xl font-bold text-slate-300">
            ${results.totalAnnualSavings.toLocaleString()}
            <span className="text-sm font-medium text-slate-500"> per year</span>
          </p>

          <div className="flex items-center justify-center gap-3 mt-5">
            {results.savingsTier === 'high' && <span className="badge badge-danger">🔥 High Savings</span>}
            {results.savingsTier === 'moderate' && <span className="badge badge-warning">📊 Moderate Savings</span>}
            {results.savingsTier === 'low' && <span className="badge badge-success">✅ Minor Tweaks</span>}
            {results.savingsTier === 'optimal' && <span className="badge badge-success">🏆 Optimized</span>}
          </div>
        </div>

        {/* AI Summary */}
        {ai_summary && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-md font-semibold text-indigo-400 mb-3 flex items-center gap-2">
              <Sparkles size={16} /> AI-Powered Analysis
            </h2>
            <p className="text-slate-300 leading-relaxed text-sm">{ai_summary}</p>
          </div>
        )}

        {/* Per-tool breakdown */}
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingDown size={18} className="text-indigo-400" /> Tool-by-Tool Breakdown
        </h2>
        <div className="space-y-4 mb-10">
          {results.toolResults.map((tr: ToolAuditResult, i: number) => (
            <div key={i} className="glass-card glass-card-hover p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{tr.tool}</h3>
                  <p className="text-xs text-slate-500">
                    Current: {tr.currentPlan} — ${tr.currentSpend}/mo
                  </p>
                </div>
                <ActionBadge action={tr.recommendedAction} />
              </div>

              <p className="text-sm text-slate-400 leading-relaxed mb-3">
                {tr.defensibleReason}
              </p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  → {tr.recommendedTool && tr.recommendedTool !== tr.tool
                    ? `${tr.recommendedTool} ` : ''}
                  {tr.recommendedPlan}
                </span>
                {tr.savingsMonthly > 0 && (
                  <span className="font-bold text-emerald-400">
                    Save ${tr.savingsMonthly.toLocaleString()}/mo
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="glass-card p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Want your own audit?</h2>
          <p className="text-sm text-slate-400 mb-5">
            Find hidden savings in your AI stack — it takes 60 seconds and it&apos;s free.
          </p>
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2"
          >
            Audit My Stack <ExternalLink size={16} />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-6 px-6 mt-auto">
        <div className="max-w-4xl mx-auto text-center text-xs text-slate-600">
          <p>© 2026 StackAudit by Credex. Pricing data verified as of May 2026.</p>
        </div>
      </footer>
    </div>
  );
}
