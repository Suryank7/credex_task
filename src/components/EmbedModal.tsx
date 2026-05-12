'use client';

import { useState } from 'react';
import { Code2, Copy, Check, X } from 'lucide-react';

export default function EmbedModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const embedSnippet = `<!-- StackAudit Widget -->
<div id="stackaudit-widget"></div>
<script src="https://stackaudit.dev/embed.js" async></script>`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn-secondary flex items-center gap-1.5 text-sm"
        aria-label="Get embed code"
      >
        <Code2 size={14} /> Embed
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setIsOpen(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            aria-label="Close embed modal"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 w-10 h-10 rounded-xl flex items-center justify-center">
              <Code2 size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight">Embed StackAudit</h2>
              <p className="text-xs text-gray-500">Add a mini audit widget to any website</p>
            </div>
          </div>

          <p className="text-sm text-gray-400 mb-4 leading-relaxed">
            Copy this snippet into your HTML. The widget renders a lightweight spend calculator that opens the full audit in a new tab.
          </p>

          <div className="relative">
            <pre className="bg-black/50 border border-white/5 rounded-xl p-4 text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap">
              {embedSnippet}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 p-1.5 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
              aria-label="Copy embed code"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>

          {copied && (
            <p className="text-xs text-emerald-400 mt-2 font-medium">Copied to clipboard!</p>
          )}
        </div>
      </div>
    </>
  );
}
