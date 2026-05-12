'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';

export default function PdfDownloadButton() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const reportEl = document.getElementById('report-content');
      if (!reportEl) return;

      const canvas = await html2canvas(reportEl, {
        backgroundColor: '#050810',
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 900,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('stackaudit-report.pdf');
    } catch (err) {
      console.error('[StackAudit] PDF generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="btn-secondary flex items-center gap-1.5 text-sm"
      aria-label="Download PDF Report"
    >
      {isGenerating ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Generating…
        </>
      ) : (
        <>
          <Download size={14} /> Download PDF
        </>
      )}
    </button>
  );
}
