'use client';

import { useState, useMemo, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ArrowRight, Zap, Shield, Lock, TrendingDown, ChevronDown, Sparkles, BarChart3 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { auditFormSchema, emailGateSchema, type AuditFormData, type EmailGateFormData } from '@/lib/schemas';
import { TOOL_OPTIONS, USE_CASE_OPTIONS } from '@/lib/tool-options';
import { runAudit } from '@/lib/audit-engine';
import type { AuditResult } from '@/lib/types';

/* ============================================
   ANIMATED COUNTER COMPONENT
============================================ */
function AnimatedCounter({ value, prefix = '$', duration = 2 }: { value: number; prefix?: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useState(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  });

  return (
    <span>
      {prefix}{displayValue.toLocaleString()}
    </span>
  );
}

/* ============================================
   MAIN PAGE COMPONENT
============================================ */
export default function AuditPage() {
  // State management
  const [savedFormData, setSavedFormData, clearSavedFormData] = useLocalStorage<AuditFormData | null>('stackaudit-form', null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  // Audit form
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<AuditFormData>({
    resolver: zodResolver(auditFormSchema),
    defaultValues: savedFormData || {
      teamSize: undefined,
      useCase: 'coding',
      tools: [{ tool: '', plan: '', monthlySpend: 0, seats: 1 }],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'tools' });

  // Watch form for persistence
  const watchedValues = watch();
  useMemo(() => {
    if (watchedValues.tools?.length > 0) {
      setSavedFormData(watchedValues);
    }
  }, [JSON.stringify(watchedValues)]);

  // Email gate form
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<EmailGateFormData>({
    resolver: zodResolver(emailGateSchema),
    defaultValues: { email: '', companyName: '', role: '', honeypot: '' },
  });

  /* --- HANDLERS --- */

  const onAuditSubmit = useCallback((data: AuditFormData) => {
    const result = runAudit({
      tools: data.tools.map((t) => ({
        tool: t.tool,
        plan: t.plan,
        monthlySpend: Number(t.monthlySpend),
        seats: Number(t.seats),
      })),
      teamSize: Number(data.teamSize),
      useCase: data.useCase,
    });
    setAuditResult(result);
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  }, []);

  const onEmailSubmit = useCallback(async (data: EmailGateFormData) => {
    if (!auditResult) return;
    setIsSubmittingEmail(true);
    setEmailError(null);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          companyName: data.companyName,
          role: data.role,
          honeypot: data.honeypot,
          auditInput: watchedValues,
          auditResult,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save audit');
      }

      setIsUnlocked(true);
      setReportUrl(result.reportUrl || null);
      setAiSummary(result.aiSummary || null);
      setEmailSuccess(true);
      clearSavedFormData();
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmittingEmail(false);
    }
  }, [auditResult, watchedValues, clearSavedFormData]);

  // Get available plans based on selected tool
  const getPlansForTool = (toolValue: string) => {
    const toolOption = TOOL_OPTIONS.find((t) => t.value === toolValue);
    return toolOption?.plans || [];
  };

  /* ============================================
     RENDER
  ============================================ */
  return (
    <div className="flex flex-col items-center min-h-screen">
      {/* ===== HEADER ===== */}
      <header className="w-full border-b border-white/5 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <BarChart3 size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Stack<span className="text-indigo-400">Audit</span>
            </span>
          </div>
          <span className="text-xs text-slate-500 font-medium">by Credex</span>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl mx-auto pt-16 pb-10 px-6 text-center"
      >
        <div className="badge badge-info mb-4 mx-auto">
          <Sparkles size={12} className="mr-1.5" /> Free AI Stack Audit
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
          Are you <span className="text-indigo-400">overpaying</span> for
          <br />your AI tools?
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-2 leading-relaxed">
          Add your team&apos;s AI subscriptions below. We&apos;ll find wasted seats,
          cheaper alternatives, and API optimizations — backed by real pricing data,
          not guesswork.
        </p>
      </motion.section>

      {/* ===== AUDIT FORM ===== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-3xl mx-auto px-6 pb-12"
      >
        <form onSubmit={handleSubmit(onAuditSubmit)} className="space-y-6">
          {/* Team Info Row */}
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield size={18} className="text-indigo-400" /> Team Info
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="teamSize">Team Size</label>
                <input
                  id="teamSize"
                  type="number"
                  className="input-field"
                  placeholder="e.g. 12"
                  {...register('teamSize', { valueAsNumber: true })}
                />
                {errors.teamSize && <p className="form-error">{errors.teamSize.message}</p>}
              </div>
              <div>
                <label className="form-label" htmlFor="useCase">Primary Use Case</label>
                <select id="useCase" className="select-field" {...register('useCase')}>
                  {USE_CASE_OPTIONS.map((uc) => (
                    <option key={uc.value} value={uc.value}>
                      {uc.icon} {uc.label}
                    </option>
                  ))}
                </select>
                {errors.useCase && <p className="form-error">{errors.useCase.message}</p>}
              </div>
            </div>
          </div>

          {/* Tool Entries */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Zap size={18} className="text-indigo-400" /> Your AI Tools
              </h2>
              <button
                type="button"
                onClick={() => append({ tool: '', plan: '', monthlySpend: 0, seats: 1 })}
                className="btn-secondary flex items-center gap-1.5 text-sm"
              >
                <Plus size={14} /> Add Tool
              </button>
            </div>

            <AnimatePresence mode="popLayout">
              {fields.map((field, index) => {
                const selectedTool = watchedValues.tools?.[index]?.tool || '';
                const plans = getPlansForTool(selectedTool);

                return (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-300">
                        Tool #{index + 1}
                      </span>
                      {fields.length > 1 && (
                        <button type="button" onClick={() => remove(index)} className="btn-danger flex items-center gap-1">
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="form-label">Tool</label>
                        <select className="select-field" {...register(`tools.${index}.tool`)}>
                          <option value="">Select tool…</option>
                          {TOOL_OPTIONS.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.icon} {t.label}
                            </option>
                          ))}
                        </select>
                        {errors.tools?.[index]?.tool && (
                          <p className="form-error">{errors.tools[index].tool?.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="form-label">Plan</label>
                        <select className="select-field" {...register(`tools.${index}.plan`)} disabled={!selectedTool}>
                          <option value="">Select plan…</option>
                          {plans.map((p) => (
                            <option key={p.value} value={p.value}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                        {errors.tools?.[index]?.plan && (
                          <p className="form-error">{errors.tools[index].plan?.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="form-label">Monthly Spend ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="input-field"
                          placeholder="e.g. 200"
                          {...register(`tools.${index}.monthlySpend`, { valueAsNumber: true })}
                        />
                        {errors.tools?.[index]?.monthlySpend && (
                          <p className="form-error">{errors.tools[index].monthlySpend?.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="form-label">Number of Seats</label>
                        <input
                          type="number"
                          className="input-field"
                          placeholder="e.g. 10"
                          {...register(`tools.${index}.seats`, { valueAsNumber: true })}
                        />
                        {errors.tools?.[index]?.seats && (
                          <p className="form-error">{errors.tools[index].seats?.message}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {errors.tools?.root && (
              <p className="form-error text-center">{errors.tools.root.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Audit My Stack <ArrowRight size={20} />
          </motion.button>
        </form>
      </motion.section>

      {/* ===== RESULTS SECTION ===== */}
      <AnimatePresence>
        {auditResult && (
          <motion.section
            id="results-section"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, type: 'spring' }}
            className="w-full max-w-3xl mx-auto px-6 pb-16"
          >
            {/* Savings Hero */}
            <div className="glass-card p-8 sm:p-12 text-center mb-8 animate-pulse-glow">
              <p className="text-sm font-semibold text-indigo-400 uppercase tracking-widest mb-3">
                Your Potential Savings
              </p>
              <div className="savings-glow">
                <p className="text-5xl sm:text-7xl font-black savings-number mb-2">
                  <AnimatedCounter value={auditResult.totalMonthlySavings} />
                  <span className="text-2xl sm:text-3xl font-semibold text-slate-400">/mo</span>
                </p>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-300 mt-2">
                <AnimatedCounter value={auditResult.totalAnnualSavings} duration={2.5} />
                <span className="text-lg font-medium text-slate-500"> per year</span>
              </p>

              <div className="flex items-center justify-center gap-3 mt-6">
                {auditResult.savingsTier === 'high' && (
                  <span className="badge badge-danger">🔥 High Savings Opportunity</span>
                )}
                {auditResult.savingsTier === 'moderate' && (
                  <span className="badge badge-warning">📊 Moderate Savings Found</span>
                )}
                {auditResult.savingsTier === 'low' && (
                  <span className="badge badge-success">✅ Minor Tweaks Possible</span>
                )}
                {auditResult.savingsTier === 'optimal' && (
                  <span className="badge badge-success">🏆 Stack is Optimized!</span>
                )}
              </div>

              {auditResult.credexRelevant && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
                >
                  <p className="text-sm text-indigo-300">
                    💎 With savings this large, <strong>Credex</strong> can negotiate
                    enterprise credits and volume discounts for your team.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Detailed Results (Gated) */}
            <div className="relative">
              {/* Blurred content */}
              <div className={isUnlocked ? '' : 'blur-gate'}>
                {/* AI Summary */}
                {aiSummary && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-6 mb-6"
                  >
                    <h3 className="text-md font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                      <Sparkles size={16} /> AI-Powered Analysis
                    </h3>
                    <p className="text-slate-300 leading-relaxed text-sm">{aiSummary}</p>
                  </motion.div>
                )}

                {/* Per-tool breakdown */}
                <div className="space-y-4">
                  {auditResult.toolResults.map((tr, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isUnlocked ? 1 : 0.6, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-card glass-card-hover p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-white">{tr.tool}</h4>
                          <p className="text-xs text-slate-500">
                            Current: {tr.currentPlan} — ${tr.currentSpend}/mo
                          </p>
                        </div>
                        <span className={`badge ${
                          tr.recommendedAction === 'keep' ? 'badge-success' :
                          tr.recommendedAction === 'downgrade' ? 'badge-warning' :
                          tr.recommendedAction === 'switch' ? 'badge-info' :
                          tr.recommendedAction === 'optimize' ? 'badge-warning' :
                          'badge-danger'
                        }`}>
                          {tr.recommendedAction === 'keep' ? '✓ Optimal' :
                           tr.recommendedAction === 'downgrade' ? '↓ Downgrade' :
                           tr.recommendedAction === 'switch' ? '↔ Switch' :
                           tr.recommendedAction === 'optimize' ? '⚡ Optimize' :
                           '⊕ Consolidate'}
                        </span>
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
                    </motion.div>
                  ))}
                </div>

                {/* Report Link */}
                {reportUrl && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass-card p-6 mt-6 text-center"
                  >
                    <p className="text-sm text-slate-400 mb-2">Share your audit report:</p>
                    <a
                      href={reportUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 font-medium hover:text-indigo-300 underline underline-offset-4 break-all"
                    >
                      {reportUrl}
                    </a>
                  </motion.div>
                )}
              </div>

              {/* Email Gate Overlay */}
              {!isUnlocked && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center z-10"
                >
                  <div className="glass-card p-8 max-w-md mx-auto text-center shadow-2xl shadow-indigo-500/10">
                    <div className="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                      <Lock size={24} className="text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Unlock Your Full Report</h3>
                    <p className="text-sm text-slate-400 mb-6">
                      Enter your email to unlock detailed per-tool recommendations,
                      AI-powered analysis, and a shareable report link.
                    </p>

                    {emailError && (
                      <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-3 mb-4">
                        {emailError}
                      </div>
                    )}

                    <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-3">
                      <div>
                        <input
                          type="email"
                          className="input-field text-center"
                          placeholder="you@company.com"
                          {...registerEmail('email')}
                        />
                        {emailErrors.email && (
                          <p className="form-error">{emailErrors.email.message}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          className="input-field text-center"
                          placeholder="Company (optional)"
                          {...registerEmail('companyName')}
                        />
                        <input
                          type="text"
                          className="input-field text-center"
                          placeholder="Role (optional)"
                          {...registerEmail('role')}
                        />
                      </div>
                      {/* Honeypot - hidden from users, visible to bots */}
                      <input
                        type="text"
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        {...registerEmail('honeypot')}
                      />
                      <motion.button
                        type="submit"
                        disabled={isSubmittingEmail}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isSubmittingEmail ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating Report…
                          </>
                        ) : (
                          <>
                            <Sparkles size={16} /> Unlock Report
                          </>
                        )}
                      </motion.button>
                    </form>
                    <p className="text-xs text-slate-600 mt-4">
                      No spam. We&apos;ll only send your report + savings tips.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Email Success Message */}
            {emailSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center"
              >
                <p className="text-emerald-400 font-medium">
                  ✅ Report sent to your email! Check your inbox.
                </p>
              </motion.div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* ===== FOOTER ===== */}
      <footer className="w-full border-t border-white/5 py-6 px-6 mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <p>© 2026 StackAudit by Credex. Pricing data verified as of May 2026.</p>
          <p className="flex items-center gap-1">
            <TrendingDown size={12} /> Powered by deterministic finance logic, not AI guesswork.
          </p>
        </div>
      </footer>
    </div>
  );
}
