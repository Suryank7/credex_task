'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ArrowRight, Zap, Shield, Lock, TrendingDown, Sparkles, BarChart3 } from 'lucide-react';
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

  useEffect(() => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

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
  const [savedFormData, setSavedFormData, clearSavedFormData] = useLocalStorage<AuditFormData | null>('stackaudit-form', null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  const hasHydrated = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { register, control, handleSubmit, watch, getValues, formState: { errors }, reset } = useForm<AuditFormData>({
    resolver: zodResolver(auditFormSchema),
    defaultValues: {
      teamSize: undefined,
      useCase: 'coding',
      tools: [{ tool: '', plan: '', monthlySpend: 0, seats: 1 }],
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (isMounted && savedFormData && !hasHydrated.current) {
      reset(savedFormData);
      hasHydrated.current = true;
    }
  }, [isMounted, savedFormData, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: 'tools' });
  const watchedTools = watch('tools');

  useEffect(() => {
    const subscription = watch((value) => {
      if (isMounted && value.tools?.length && value.tools.length > 0) {
        setSavedFormData(value as AuditFormData);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, isMounted, setSavedFormData]);

  const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors } } = useForm<EmailGateFormData>({
    resolver: zodResolver(emailGateSchema),
    defaultValues: { email: '', companyName: '', role: '', honeypot: '' },
  });

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
          ...data,
          auditInput: getValues(),
          auditResult,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save audit');

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
  }, [auditResult, getValues, clearSavedFormData]);

  const getPlansForTool = (toolValue: string) => TOOL_OPTIONS.find((t) => t.value === toolValue)?.plans || [];

  return (
    <div className="flex flex-col items-center min-h-screen">
      {/* HEADER */}
      <header className="w-full border-b border-gray-800/80 bg-[#0f172a] py-4 px-6 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <BarChart3 size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Stack<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Audit</span>
            </span>
          </div>
          <span className="text-xs text-gray-500 font-medium hidden sm:block">| Crafted for Teams</span>
        </div>
      </header>

      {/* HERO SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl mx-auto pt-20 pb-12 px-6 text-center"
      >
        <div className="badge badge-info mb-6 mx-auto">
          <Sparkles size={12} className="mr-1.5" /> Free AI Stack Audit
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight text-white">
          Stop <span className="text-gradient">overpaying</span> for<br />your AI tools.
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-2 leading-relaxed">
          The developer&apos;s second brain for finance. Add your team&apos;s subscriptions below to instantly find wasted seats, cheaper alternatives, and API optimizations.
        </p>
      </motion.section>

      {/* AUDIT FORM */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-3xl mx-auto px-6 pb-16"
      >
        <form onSubmit={handleSubmit(onAuditSubmit)} className="space-y-8 relative">
          {/* Glowing Background Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl z-0 transform scale-[1.02] rounded-[3rem] pointer-events-none"></div>

          {/* IDE Window Container */}
          <div className="relative z-10 bg-[#0a0f18] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Top Window Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/80 bg-[#0f172a]">
              {/* Traffic Lights */}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
              </div>
              
              {/* Fake Filename Pill */}
              <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#1e293b] border border-gray-700/50 px-3 py-1 rounded-md text-xs font-mono text-gray-400">
                <span>&gt;_ stackaudit.config.ts</span>
              </div>
              
              <div className="w-12"></div>
            </div>

            {/* Window Body */}
            <div className="p-8 sm:p-10 space-y-10">
              
              {/* Team Info Section */}
              <div className="group">
                <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                  <Shield size={22} />
                </div>
                <h2 className="text-xl font-semibold mb-6 tracking-tight text-white">Team Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="form-label" htmlFor="teamSize">Team Size</label>
                    <input
                      id="teamSize"
                      type="number"
                      className="input-field"
                      placeholder="e.g. 12"
                      aria-label="Team Size"
                      aria-invalid={!!errors.teamSize}
                      {...register('teamSize', { valueAsNumber: true })}
                    />
                    {errors.teamSize && <p className="form-error">{errors.teamSize.message}</p>}
                  </div>
                  <div>
                    <label className="form-label" htmlFor="useCase">Primary Use Case</label>
                    <select id="useCase" className="select-field" aria-label="Primary Use Case" aria-invalid={!!errors.useCase} {...register('useCase')}>
                      {USE_CASE_OPTIONS.map((uc) => (
                        <option key={uc.value} value={uc.value}>
                          {uc.label}
                        </option>
                      ))}
                    </select>
                    {errors.useCase && <p className="form-error">{errors.useCase.message}</p>}
                  </div>
                </div>
              </div>

              <hr className="border-gray-800/80" />

              {/* Tools Section */}
              <div className="group">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="bg-pink-500/10 border border-pink-500/20 text-pink-400 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                      <Zap size={22} />
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight text-white">AI Subscriptions</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => append({ tool: '', plan: '', monthlySpend: 0, seats: 1 })}
                    className="btn-secondary flex items-center gap-1.5 mt-2 bg-[#0f172a]"
                  >
                    <Plus size={14} /> Add Tool
                  </button>
                </div>

                <AnimatePresence mode="popLayout">
                  {fields.map((field, index) => {
                    const selectedTool = watchedTools?.[index]?.tool || '';
                    const plans = getPlansForTool(selectedTool);

                    return (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="rounded-2xl border border-gray-800 bg-[#0f172a] p-5 space-y-4 mb-4 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-medium text-gray-500 bg-gray-800/50 px-2 py-1 rounded">
                            TOOL_{index + 1}
                          </span>
                          {fields.length > 1 && (
                            <button type="button" onClick={() => remove(index)} className="btn-danger flex items-center gap-1">
                              <Trash2 size={12} /> Remove
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Software</label>
                            <select className="select-field" aria-label="Software Tool" aria-invalid={!!errors.tools?.[index]?.tool} {...register(`tools.${index}.tool`)}>
                              <option value="">Select tool…</option>
                              {TOOL_OPTIONS.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </select>
                            {errors.tools?.[index]?.tool && (
                              <p className="form-error">{errors.tools[index].tool?.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="form-label">Plan Tier</label>
                            <select className="select-field" aria-label="Plan Tier" aria-invalid={!!errors.tools?.[index]?.plan} {...register(`tools.${index}.plan`)} disabled={!selectedTool}>
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
                              placeholder="0.00"
                              aria-label="Monthly Spend"
                              aria-invalid={!!errors.tools?.[index]?.monthlySpend}
                              {...register(`tools.${index}.monthlySpend`, { valueAsNumber: true })}
                            />
                            {errors.tools?.[index]?.monthlySpend && (
                              <p className="form-error">{errors.tools[index].monthlySpend?.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="form-label">Active Seats</label>
                            <input
                              type="number"
                              className="input-field"
                              placeholder="1"
                              aria-label="Active Seats"
                              aria-invalid={!!errors.tools?.[index]?.seats}
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
                  <p className="form-error text-center mt-2">{errors.tools.root.message}</p>
                )}
              </div>
            </div>
          </div>

          <motion.button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Audit My Stack <ArrowRight size={18} />
          </motion.button>
        </form>
      </motion.section>

      {/* RESULTS SECTION */}
      <AnimatePresence>
        {auditResult && (
          <motion.section
            id="results-section"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, type: 'spring' }}
            className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-20"
          >
            <div className="sv-card p-10 text-center mb-8 border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.1)]">
              <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-4">
                Identified Savings
              </p>
              <div className="mb-2">
                <p className="text-6xl sm:text-7xl font-bold text-gradient mb-2 inline-block">
                  <AnimatedCounter value={auditResult.totalMonthlySavings} />
                </p>
                <span className="text-2xl font-semibold text-gray-500 ml-2">/mo</span>
              </div>
              <p className="text-2xl font-bold text-gray-300">
                <AnimatedCounter value={auditResult.totalAnnualSavings} duration={2.5} />
                <span className="text-lg font-medium text-gray-500"> per year</span>
              </p>

              <div className="flex items-center justify-center gap-3 mt-8">
                {auditResult.savingsTier === 'high' && <span className="badge badge-danger">🔥 High Impact</span>}
                {auditResult.savingsTier === 'moderate' && <span className="badge badge-warning">📊 Moderate Impact</span>}
                {auditResult.savingsTier === 'low' && <span className="badge badge-success">✅ Minor Tweaks</span>}
                {auditResult.savingsTier === 'optimal' && <span className="badge badge-success">🏆 Optimized</span>}
              </div>
            </div>

            {/* Benchmark Section */}
            <div className="relative mt-4 mb-12">
              <div className="sv-card p-6 sm:p-8 bg-black/20 border border-white/5 rounded-2xl shadow-inner">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 tracking-tight">
                      <BarChart3 size={20} className="text-indigo-400" />
                      AI Spend Benchmark
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Your AI spend per developer is <span className="text-white font-mono font-medium">${auditResult.benchmark.spendPerDev}/mo</span>. 
                      Companies your size average <span className="text-white font-mono font-medium">${auditResult.benchmark.industryAverage}/mo</span>.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className={`text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-md border uppercase tracking-wider ${
                      auditResult.benchmark.status === 'below' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 
                      auditResult.benchmark.status === 'above' ? 'text-red-400 bg-red-400/10 border-red-400/20' : 
                      'text-amber-400 bg-amber-400/10 border-amber-400/20'
                    }`}>
                      {auditResult.benchmark.status === 'below' ? 'Highly Efficient' : 
                       auditResult.benchmark.status === 'above' ? 'Overspending' : 'Average'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar UI */}
                <div className="relative mt-8">
                  <div className="absolute -top-6 text-[10px] text-gray-500 font-mono tracking-widest" style={{ left: '50%', transform: 'translateX(-50%)' }}>
                    INDUSTRY AVG
                  </div>
                  <div className="relative h-3 bg-[#0a0f18] border border-white/5 rounded-full overflow-hidden shadow-inner">
                    {/* Industry Average Marker */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-white/20 z-20"
                      style={{ left: '50%' }}
                    ></div>
                    
                    {/* Fill Bar */}
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((auditResult.benchmark.spendPerDev / (auditResult.benchmark.industryAverage * 2)) * 100, 100)}%` }}
                      transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                      className={`absolute top-0 bottom-0 left-0 z-10 ${
                        auditResult.benchmark.status === 'below' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 
                        auditResult.benchmark.status === 'above' ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]' : 
                        'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                      }`}
                    ></motion.div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gated Details (Dashboard Panel) */}
            <div className="relative mt-12 group">
              {/* Vibrant Ambient Glow behind the dashboard */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 rounded-[2rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>

              {/* Dashboard Container */}
              <div className="relative z-10 bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden min-h-[450px]">
                
                {/* Tech Dashboard Header */}
                <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </div>
                    <h2 className="text-sm sm:text-base font-mono font-bold tracking-widest text-white uppercase">
                      Audit_Ledger // {new Date().getFullYear()}
                    </h2>
                  </div>
                  <div className="text-[10px] sm:text-xs font-mono text-gray-400 bg-black/60 px-3 py-1.5 rounded-full border border-white/5">
                    STATUS: {auditResult.savingsTier.toUpperCase()}
                  </div>
                </div>

                {/* Dashboard Body */}
                <div className="relative p-6 sm:p-10">
                  <div className={isUnlocked ? 'space-y-8' : 'space-y-8 blur-gate'}>
                    
                    {/* CFO Analysis Block */}
                    {aiSummary && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 p-8 shadow-inner overflow-hidden">
                        {/* Background wireframe accent */}
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
                        
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="bg-indigo-500/20 text-indigo-300 w-10 h-10 rounded-xl flex items-center justify-center border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                              <Sparkles size={18} />
                            </div>
                            <h3 className="text-lg font-semibold text-white tracking-tight">AI CFO Analysis</h3>
                          </div>
                          <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{aiSummary}</p>
                        </div>
                      </motion.div>
                    )}

                    {/* Tool Ledger Rows */}
                    <div className="space-y-4">
                      {auditResult.toolResults.map((tr, i) => {
                        const getAccent = (action: string) => {
                          switch (action) {
                            case 'keep': return 'bg-emerald-500';
                            case 'downgrade': return 'bg-amber-500';
                            case 'switch': return 'bg-cyan-500';
                            case 'optimize': return 'bg-amber-500';
                            default: return 'bg-red-500';
                          }
                        };
                        const getBadge = (action: string) => {
                          switch (action) {
                            case 'keep': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
                            case 'downgrade': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
                            case 'switch': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
                            case 'optimize': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
                            default: return 'text-red-400 bg-red-400/10 border-red-400/20';
                          }
                        };

                        return (
                          <motion.div key={i} className="relative overflow-hidden rounded-xl bg-black/40 border border-white/5 p-6 hover:bg-black/60 transition-colors">
                            {/* Accent Line */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${getAccent(tr.recommendedAction)} shadow-[0_0_10px_currentColor]`}></div>
                            
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="font-semibold text-white text-lg tracking-tight">{tr.tool}</h4>
                                <p className="text-xs text-gray-500 font-mono mt-1 uppercase tracking-wider">
                                  Current: {tr.currentPlan} <span className="text-gray-700 mx-1">|</span> <span className="text-gray-400">${tr.currentSpend}/mo</span>
                                </p>
                              </div>
                              <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${getBadge(tr.recommendedAction)}`}>
                                {tr.recommendedAction}
                              </span>
                            </div>

                            <p className="text-sm text-gray-400 leading-relaxed mb-5 pb-5 border-b border-white/5">
                              {tr.defensibleReason}
                            </p>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                              <span className="text-gray-300 font-medium flex items-center gap-2">
                                <ArrowRight size={14} className="text-purple-400" />
                                <span className="font-mono bg-white/5 px-2 py-0.5 rounded text-xs">{tr.recommendedTool && tr.recommendedTool !== tr.tool ? `${tr.recommendedTool} ` : ''}{tr.recommendedPlan}</span>
                              </span>
                              {tr.savingsMonthly > 0 ? (
                                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                                  <TrendingDown size={14} />
                                  Save ${tr.savingsMonthly.toLocaleString()}/mo
                                </span>
                              ) : (
                                <span className="font-medium text-gray-600 font-mono text-xs">
                                  Optimal Setup
                                </span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Report URL Display */}
                    {reportUrl && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-white/10 bg-black/40 p-6 flex flex-col items-center mt-8">
                        <p className="text-xs text-gray-400 mb-3 font-mono uppercase tracking-widest">Shareable Audit Link</p>
                        <div className="w-full flex justify-center">
                          <a href={reportUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 font-mono text-sm sm:text-base hover:text-purple-300 break-all bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-3 text-center w-full shadow-inner hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-shadow">
                            {reportUrl}
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Email Gate Modal Overlay */}
                  {!isUnlocked && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute inset-0 flex items-center justify-center z-10 bg-[#050810]/70 backdrop-blur-md"
                    >
                      <div className="bg-black/80 border border-white/10 p-8 sm:p-10 max-w-md mx-auto text-center rounded-2xl shadow-2xl">
                        <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <Lock size={24} />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">Unlock Full Report</h3>
                        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                          Enter your email to unlock detailed per-tool recommendations, the AI-powered analysis, and a shareable link.
                        </p>

                        {emailError && (
                          <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-4 mb-6">
                            {emailError}
                          </div>
                        )}

                        <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-4">
                          <div>
                            <input type="email" className="input-field text-center py-3 bg-[#0a0f18]" placeholder="you@company.com" aria-label="Email Address" aria-invalid={!!emailErrors.email} {...registerEmail('email')} />
                            {emailErrors.email && <p className="form-error">{emailErrors.email.message}</p>}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <input type="text" className="input-field text-center bg-[#0a0f18]" placeholder="Company" aria-label="Company Name" {...registerEmail('companyName')} />
                            <input type="text" className="input-field text-center bg-[#0a0f18]" placeholder="Role" aria-label="Role" {...registerEmail('role')} />
                          </div>
                          <input type="text" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" {...registerEmail('honeypot')} />
                          
                          <motion.button type="submit" disabled={isSubmittingEmail} className="btn-primary w-full flex items-center justify-center gap-2 mt-4" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            {isSubmittingEmail ? (
                              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Unlocking…</>
                            ) : (
                              <><Sparkles size={16} /> Reveal Audit</>
                            )}
                          </motion.button>
                        </form>
                        <p className="text-xs text-gray-500 mt-6 font-mono">
                          Strictly private. No spam.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {emailSuccess && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-emerald-400 font-medium flex items-center justify-center gap-2">
                  <span className="bg-emerald-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✓</span>
                  Report unlocked and sent to your email!
                </p>
              </motion.div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="w-full py-12 flex items-center justify-center text-gray-500 text-sm font-medium mt-auto relative z-10 bg-gradient-to-t from-[#050810] to-transparent">
        <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
          <span className="font-mono text-purple-400">&lt;/&gt;</span>
          <span className="text-gray-400">StackAudit</span> 
          <span className="text-gray-700">|</span> 
          <span>Crafted for Developers</span>
        </div>
      </footer>
    </div>
  );
}
