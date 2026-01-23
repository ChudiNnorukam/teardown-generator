import jsPDF from 'jspdf';
import type { TeardownWithResults } from '@/types/database';

interface PDFExportOptions {
  teardown: TeardownWithResults;
}

export async function exportTeardownToPDF({ teardown }: PDFExportOptions): Promise<void> {
  const results = teardown.results;
  if (!results) {
    throw new Error('No results to export');
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;

  // Helper function to add text with word wrap
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10): number => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * (fontSize * 0.4));
  };

  // Helper to check if we need a new page
  const checkNewPage = (requiredSpace: number): void => {
    if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
    }
  };

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Teardown Report', margin, yPos);
  yPos += 12;

  // URL
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(teardown.target_url, margin, yPos);
  yPos += 8;

  // Date
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPos);
  yPos += 15;

  // Reset text color
  doc.setTextColor(0);

  // Summary Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', margin, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');

  const techCount = results.tech_stack?.length || 0;
  const seoScore = results.seo_audit?.score || 0;
  const totalHours = results.clone_estimate?.totalHours || 0;
  const pricingTiers = results.pricing_analysis?.tiers?.length || 0;

  doc.text(`Technologies Detected: ${techCount}`, margin, yPos);
  yPos += 6;
  doc.text(`SEO Score: ${seoScore}/100`, margin, yPos);
  yPos += 6;
  doc.text(`Estimated Build Time: ${totalHours} hours (MVP)`, margin, yPos);
  yPos += 6;
  doc.text(`Pricing Tiers Found: ${pricingTiers}`, margin, yPos);
  yPos += 15;

  // Tech Stack Section
  if (results.tech_stack && results.tech_stack.length > 0) {
    checkNewPage(40);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Tech Stack', margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Group by category
    const grouped = results.tech_stack.reduce((acc, tech) => {
      if (!acc[tech.category]) acc[tech.category] = [];
      acc[tech.category].push(tech);
      return acc;
    }, {} as Record<string, typeof results.tech_stack>);

    for (const [category, techs] of Object.entries(grouped)) {
      checkNewPage(20);
      doc.setFont('helvetica', 'bold');
      doc.text(`${category}:`, margin, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      const techNames = techs.map(t => `${t.name} (${t.confidence})`).join(', ');
      yPos = addWrappedText(techNames, margin + 5, yPos, contentWidth - 5, 10);
      yPos += 5;
    }
    yPos += 10;
  }

  // SEO Audit Section
  if (results.seo_audit?.checks && results.seo_audit.checks.length > 0) {
    checkNewPage(40);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`SEO Audit (Score: ${seoScore}/100)`, margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    for (const check of results.seo_audit.checks) {
      checkNewPage(15);
      const status = check.passed ? '[PASS]' : '[FAIL]';
      doc.setFont('helvetica', 'bold');
      doc.text(`${status} ${check.name}`, margin, yPos);
      yPos += 5;

      if (check.value) {
        doc.setFont('helvetica', 'normal');
        yPos = addWrappedText(`Value: ${check.value}`, margin + 5, yPos, contentWidth - 5, 9);
      }
      if (!check.passed && check.recommendation) {
        doc.setFont('helvetica', 'italic');
        yPos = addWrappedText(`Recommendation: ${check.recommendation}`, margin + 5, yPos, contentWidth - 5, 9);
      }
      yPos += 3;
    }
    yPos += 10;
  }

  // Pricing Analysis Section
  if (results.pricing_analysis?.found && results.pricing_analysis.tiers && results.pricing_analysis.tiers.length > 0) {
    checkNewPage(40);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Pricing Analysis', margin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    for (const tier of results.pricing_analysis.tiers) {
      checkNewPage(25);
      doc.setFont('helvetica', 'bold');
      doc.text(`${tier.name}: ${tier.price}${tier.period ? `/${tier.period}` : ''}`, margin, yPos);
      yPos += 5;

      if (tier.features && tier.features.length > 0) {
        doc.setFont('helvetica', 'normal');
        for (const feature of tier.features.slice(0, 5)) {
          doc.text(`  • ${feature}`, margin, yPos);
          yPos += 4;
        }
        if (tier.features.length > 5) {
          doc.text(`  ... and ${tier.features.length - 5} more features`, margin, yPos);
          yPos += 4;
        }
      }
      yPos += 5;
    }
    yPos += 10;
  }

  // Clone Estimate Section
  if (results.clone_estimate) {
    checkNewPage(60);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Clone Estimate', margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Estimate: ${totalHours} hours (MVP)`, margin, yPos);
    yPos += 6;
    doc.text(`Complexity: ${results.clone_estimate.complexity}`, margin, yPos);
    yPos += 10;

    // Disclaimer
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100);
    yPos = addWrappedText(
      'Note: This is an MVP estimate for an experienced full-stack developer. For production-ready quality with testing and documentation, multiply by 3-5x.',
      margin,
      yPos,
      contentWidth,
      9
    );
    doc.setTextColor(0);
    yPos += 8;

    // Breakdown
    if (results.clone_estimate.breakdown && results.clone_estimate.breakdown.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Breakdown:', margin, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      for (const item of results.clone_estimate.breakdown) {
        checkNewPage(10);
        doc.text(`• ${item.component}: ${item.hours}h - ${item.reason}`, margin + 5, yPos);
        yPos += 5;
      }
      yPos += 8;
    }

    // Required Skills
    if (results.clone_estimate.requiredSkills && results.clone_estimate.requiredSkills.length > 0) {
      checkNewPage(15);
      doc.setFont('helvetica', 'bold');
      doc.text('Required Skills:', margin, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      const skills = results.clone_estimate.requiredSkills.join(', ');
      yPos = addWrappedText(skills, margin + 5, yPos, contentWidth - 5, 10);
    }
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Generated by Teardown (teardown-generator.vercel.app) - Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Generate filename from URL
  const domain = new URL(teardown.target_url).hostname.replace(/\./g, '-');
  const filename = `teardown-${domain}-${new Date().toISOString().split('T')[0]}.pdf`;

  // Save the PDF
  doc.save(filename);
}
