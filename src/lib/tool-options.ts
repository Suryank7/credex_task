/**
 * Tool and plan options for the audit form dropdowns.
 * Maps to the pricing data in pricing-data.ts.
 */
export const TOOL_OPTIONS = [
  {
    value: 'cursor',
    label: 'Cursor',
    icon: '⌨️',
    plans: [
      { value: 'hobby', label: 'Hobby ($0/mo)' },
      { value: 'pro', label: 'Pro ($20/mo)' },
      { value: 'pro+', label: 'Pro+ ($60/mo)' },
      { value: 'ultra', label: 'Ultra ($200/mo)' },
      { value: 'teams', label: 'Teams ($40/user/mo)' },
      { value: 'enterprise', label: 'Enterprise (Custom)' },
    ],
  },
  {
    value: 'github_copilot',
    label: 'GitHub Copilot',
    icon: '🐙',
    plans: [
      { value: 'free', label: 'Free ($0/mo)' },
      { value: 'pro', label: 'Pro ($10/user/mo)' },
      { value: 'pro+', label: 'Pro+ ($39/user/mo)' },
      { value: 'business', label: 'Business ($19/user/mo)' },
      { value: 'enterprise', label: 'Enterprise ($39/user/mo)' },
    ],
  },
  {
    value: 'claude',
    label: 'Claude',
    icon: '🧠',
    plans: [
      { value: 'free', label: 'Free ($0/mo)' },
      { value: 'pro', label: 'Pro ($20/mo)' },
      { value: 'max 5x', label: 'Max 5x ($100/mo)' },
      { value: 'max 20x', label: 'Max 20x ($200/mo)' },
      { value: 'team standard', label: 'Team Standard ($25/seat/mo)' },
      { value: 'team premium', label: 'Team Premium ($125/seat/mo)' },
      { value: 'enterprise', label: 'Enterprise (Custom)' },
    ],
  },
  {
    value: 'chatgpt',
    label: 'ChatGPT',
    icon: '💬',
    plans: [
      { value: 'plus', label: 'Plus ($20/mo)' },
      { value: 'pro 100', label: 'Pro $100 ($100/mo)' },
      { value: 'pro 200', label: 'Pro $200 ($200/mo)' },
      { value: 'business', label: 'Business ($25/user/mo)' },
      { value: 'enterprise', label: 'Enterprise (Custom)' },
    ],
  },
  {
    value: 'anthropic_api',
    label: 'Anthropic API',
    icon: '🔌',
    plans: [
      { value: 'api direct', label: 'API Direct (Usage-based)' },
    ],
  },
  {
    value: 'openai_api',
    label: 'OpenAI API',
    icon: '⚡',
    plans: [
      { value: 'api direct', label: 'API Direct (Usage-based)' },
    ],
  },
  {
    value: 'gemini',
    label: 'Google Gemini',
    icon: '✨',
    plans: [
      { value: 'pro', label: 'AI Pro ($19.99/mo)' },
      { value: 'ultra', label: 'AI Ultra ($249.99/mo)' },
      { value: 'api', label: 'API (Usage-based)' },
    ],
  },
  {
    value: 'windsurf',
    label: 'Windsurf',
    icon: '🏄',
    plans: [
      { value: 'free', label: 'Free ($0/mo)' },
      { value: 'pro', label: 'Pro ($15/user/mo)' },
      { value: 'teams', label: 'Teams ($30/user/mo)' },
      { value: 'enterprise', label: 'Enterprise ($60+/user/mo)' },
    ],
  },
] as const;

export const USE_CASE_OPTIONS = [
  { value: 'coding' as const, label: 'Software Development', icon: '💻' },
  { value: 'writing' as const, label: 'Content & Writing', icon: '✍️' },
  { value: 'data' as const, label: 'Data & Analytics', icon: '📊' },
  { value: 'research' as const, label: 'Research', icon: '🔬' },
  { value: 'mixed' as const, label: 'Mixed / General', icon: '🔄' },
] as const;
