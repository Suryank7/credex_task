import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import type { AuditResult, AuditInput } from '@/lib/types';

/* ============================================
   ANTHROPIC SYSTEM PROMPT
   (Saved to PROMPTS.md for documentation)
============================================ */
const ANTHROPIC_SYSTEM_PROMPT = `You are StackAudit's Chief Financial Analyst AI. You write concise, actionable audit summaries for engineering managers and CTOs.

RULES:
- Write exactly 80-120 words. No more.
- Be direct and use specific numbers from the data provided.
- Start with the single biggest savings opportunity.
- Use finance terminology: "over-provisioned", "right-size", "consolidate", "unit economics".
- End with a clear call to action mentioning Credex if savings exceed $500/mo.
- Never use generic filler phrases like "in today's landscape" or "it's important to note".
- Sound like a sharp CFO advisor, not a chatbot.`;

const ANTHROPIC_USER_PROMPT_TEMPLATE = (auditResult: AuditResult, teamSize: number) => {
  const toolSummaries = auditResult.toolResults
    .map(
      (t) =>
        `- ${t.tool} (${t.currentPlan}): $${t.currentSpend}/mo → Action: ${t.recommendedAction}. Reason: ${t.defensibleReason}. Potential savings: $${t.savingsMonthly}/mo.`
    )
    .join('\n');

  return `Write a punchy financial audit summary for a ${teamSize}-person team with the following AI tool analysis:

${toolSummaries}

Total Monthly Savings: $${auditResult.totalMonthlySavings}
Total Annual Savings: $${auditResult.totalAnnualSavings}
Savings Tier: ${auditResult.savingsTier}
Credex Relevant (>$500/mo): ${auditResult.credexRelevant}`;
};

/* ============================================
   FALLBACK SUMMARY TEMPLATES
   Used when Anthropic API fails or times out
============================================ */
function generateFallbackSummary(auditResult: AuditResult, teamSize: number): string {
  const topSaver = auditResult.toolResults
    .filter((t) => t.savingsMonthly > 0)
    .sort((a, b) => b.savingsMonthly - a.savingsMonthly)[0];

  if (auditResult.savingsTier === 'optimal') {
    return `Your ${teamSize}-person team's AI stack is well-optimized. We found no significant overspend or wasted seats across your tools. You're spending efficiently — keep monitoring usage quarterly to stay ahead of pricing changes.`;
  }

  if (auditResult.savingsTier === 'high') {
    return `Critical finding: Your ${teamSize}-person team is over-provisioned by $${auditResult.totalMonthlySavings.toLocaleString()}/mo ($${auditResult.totalAnnualSavings.toLocaleString()}/yr). ${
      topSaver
        ? `The biggest opportunity is ${topSaver.tool}: ${topSaver.defensibleReason} This alone saves $${topSaver.savingsMonthly.toLocaleString()}/mo.`
        : ''
    } At this savings level, Credex can negotiate enterprise volume discounts to amplify your savings further. Book a free consultation to unlock additional credits.`;
  }

  if (auditResult.savingsTier === 'moderate') {
    return `Your ${teamSize}-person team has $${auditResult.totalMonthlySavings.toLocaleString()}/mo in recoverable spend across your AI stack. ${
      topSaver
        ? `Start with ${topSaver.tool}: ${topSaver.defensibleReason}`
        : 'Review the per-tool breakdown below for specific actions.'
    } These are quick wins that compound to $${auditResult.totalAnnualSavings.toLocaleString()} annually. Consider a quarterly audit cadence to catch new waste early.`;
  }

  return `Your ${teamSize}-person team has minor optimization opportunities totaling $${auditResult.totalMonthlySavings.toLocaleString()}/mo. ${
    topSaver
      ? `${topSaver.tool} is your best bet: ${topSaver.defensibleReason}`
      : 'Your stack is nearly optimal.'
  } While the savings are modest, implementing them adds up to $${auditResult.totalAnnualSavings.toLocaleString()} over the year.`;
}

/* ============================================
   GENERATE AI SUMMARY (with graceful fallback)
============================================ */
async function generateAISummary(
  auditResult: AuditResult,
  teamSize: number
): Promise<{ summary: string; isAIGenerated: boolean }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // If no API key configured, use fallback immediately
  if (!apiKey) {
    console.warn('[StackAudit] No ANTHROPIC_API_KEY configured. Using fallback summary.');
    return {
      summary: generateFallbackSummary(auditResult, teamSize),
      isAIGenerated: false,
    };
  }

  try {
    // Dynamic import to avoid bundling the SDK when not needed
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: ANTHROPIC_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: ANTHROPIC_USER_PROMPT_TEMPLATE(auditResult, teamSize),
        },
      ],
    });

    // Extract text from the response
    const textBlock = response.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text content in Anthropic response');
    }

    return {
      summary: textBlock.text.trim(),
      isAIGenerated: true,
    };
  } catch (error) {
    // Graceful fallback on ANY failure: API error, timeout, rate limit, etc.
    console.error('[StackAudit] Anthropic API failed, using fallback summary:', error);
    return {
      summary: generateFallbackSummary(auditResult, teamSize),
      isAIGenerated: false,
    };
  }
}

/* ============================================
   SAVE TO SUPABASE
============================================ */
async function saveToDatabase(
  auditId: string,
  auditInput: AuditInput,
  auditResult: AuditResult,
  aiSummary: string,
  email: string,
  companyName?: string,
  role?: string
): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('[StackAudit] Supabase not configured. Using local JSON file fallback.');
    try {
      const dbDir = path.join(process.cwd(), '.data');
      if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
      
      const record = {
        id: auditId,
        team_size: auditInput.teamSize,
        use_case: auditInput.useCase,
        tools: auditInput.tools,
        results: auditResult,
        total_monthly_savings: auditResult.totalMonthlySavings,
        total_annual_savings: auditResult.totalAnnualSavings,
        ai_summary: aiSummary,
        is_public: true,
        created_at: new Date().toISOString()
      };
      
      const filePath = path.join(dbDir, `${auditId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(record, null, 2));
      return true;
    } catch (e) {
      console.error('[StackAudit] Local fallback failed:', e);
      return false;
    }
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Save audit
    const { error: auditError } = await supabase.from('audits').insert({
      id: auditId,
      team_size: auditInput.teamSize,
      use_case: auditInput.useCase,
      tools: auditInput.tools,
      results: auditResult,
      total_monthly_savings: auditResult.totalMonthlySavings,
      total_annual_savings: auditResult.totalAnnualSavings,
      ai_summary: aiSummary,
      is_public: true,
    });

    if (auditError) {
      console.error('[StackAudit] Failed to save audit:', auditError);
      return false;
    }

    // Save lead
    const { error: leadError } = await supabase.from('leads').insert({
      audit_id: auditId,
      email,
      company_name: companyName || null,
      role: role || null,
      team_size: auditInput.teamSize,
      is_high_savings: auditResult.credexRelevant,
    });

    if (leadError) {
      console.error('[StackAudit] Failed to save lead:', leadError);
    }

    return true;
  } catch (error) {
    console.error('[StackAudit] Database error:', error);
    return false;
  }
}

/* ============================================
   SEND EMAIL VIA RESEND
============================================ */
async function sendAuditEmail(
  email: string,
  reportUrl: string,
  totalSavings: number,
  credexRelevant: boolean
): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'audit@stackaudit.dev';

  const credexCTA = credexRelevant
    ? `\n\n💎 With $${totalSavings.toLocaleString()}/mo in potential savings, you qualify for a FREE Credex consultation to negotiate enterprise credits and volume discounts.\n\n👉 Reply to this email to schedule your call.`
    : '';

  const emailText = `Hi there,\n\nYour StackAudit report is ready! We found $${totalSavings.toLocaleString()}/mo ($${(totalSavings * 12).toLocaleString()}/yr) in potential savings across your AI tool stack.\n\n📊 View your full report: ${reportUrl}\n${credexCTA}\n\n— The StackAudit Team (by Credex)`;

  if (!resendApiKey) {
    console.warn('[StackAudit] Resend not configured. Falling back to Nodemailer test account.');
    try {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await transporter.sendMail({
        from: `"StackAudit Team" <${fromEmail}>`,
        to: email,
        subject: `Your StackAudit Report — $${totalSavings.toLocaleString()}/mo in AI Savings Found`,
        text: emailText,
      });

      console.log('=============================================');
      console.log('[StackAudit] Test Email sent: %s', info.messageId);
      console.log('[StackAudit] Preview Test Email URL: %s', nodemailer.getTestMessageUrl(info));
      console.log('=============================================');
    } catch (error) {
      console.error('[StackAudit] Failed to send test email:', error);
    }
    return;
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);

    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Your StackAudit Report — $${totalSavings.toLocaleString()}/mo in AI Savings Found`,
      text: emailText,
    });
  } catch (error) {
    // Non-blocking: email failure shouldn't break the user flow
    console.error('[StackAudit] Failed to send email:', error);
  }
}

/* ============================================
   API ROUTE HANDLER
============================================ */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, companyName, role, honeypot, auditInput, auditResult } = body;

    // Spam protection: honeypot check
    if (honeypot && honeypot.length > 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Basic validation
    if (!email || !auditResult) {
      return NextResponse.json(
        { error: 'Email and audit results are required' },
        { status: 400 }
      );
    }

    // Generate unique ID for this report
    const auditId = uuidv4();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    const reportUrl = `${baseUrl}/report/${auditId}`;

    // 1. Generate AI Summary (with fallback)
    const { summary: aiSummary, isAIGenerated } = await generateAISummary(
      auditResult as AuditResult,
      auditInput?.teamSize || 1
    );

    // 2. Save to database (non-blocking for UX)
    await saveToDatabase(
      auditId,
      auditInput,
      auditResult,
      aiSummary,
      email,
      companyName,
      role
    );

    // 3. Send email asynchronously (fire-and-forget)
    sendAuditEmail(
      email,
      reportUrl,
      auditResult.totalMonthlySavings,
      auditResult.credexRelevant
    ).catch((err) => console.error('[StackAudit] Email send error:', err));

    return NextResponse.json({
      success: true,
      auditId,
      reportUrl,
      aiSummary,
      isAIGenerated,
    });
  } catch (error) {
    console.error('[StackAudit] API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
