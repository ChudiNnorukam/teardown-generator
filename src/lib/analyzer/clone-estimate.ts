// Clone estimate analyzer
import type {
  CloneEstimate,
  CloneBreakdown,
  TechStackItem,
  PricingAnalysis,
  SEOAudit,
} from '@/types/database';

type Complexity = 'simple' | 'moderate' | 'complex' | 'very-complex';

/**
 * Analyze complexity based on detected tech stack
 */
export async function analyzeCloneEstimate(
  techStack: TechStackItem[],
  pricing: PricingAnalysis,
  seo: SEOAudit
): Promise<CloneEstimate> {
  const breakdown: CloneBreakdown[] = [];
  let totalHours = 0;

  // Base implementation (marketing site)
  const baseHours = 10;
  breakdown.push({
    component: 'Base Website',
    hours: baseHours,
    reason: 'Landing page, basic navigation, responsive design',
  });
  totalHours += baseHours;

  // Check for auth
  const hasAuth = techStack.some((t) => t.category === 'Auth');
  if (hasAuth) {
    const authHours = 20;
    breakdown.push({
      component: 'Authentication',
      hours: authHours,
      reason: `Detected: ${techStack.find((t) => t.category === 'Auth')?.name}`,
    });
    totalHours += authHours;
  }

  // Check for payments
  const hasPayments = techStack.some((t) => t.category === 'Payments');
  if (hasPayments) {
    const paymentHours = 15;
    breakdown.push({
      component: 'Payment Integration',
      hours: paymentHours,
      reason: `Detected: ${techStack.find((t) => t.category === 'Payments')?.name}`,
    });
    totalHours += paymentHours;
  }

  // Check for backend/database
  const hasBackend = techStack.some((t) => t.category === 'Backend');
  if (hasBackend) {
    const backendHours = 25;
    breakdown.push({
      component: 'Backend & Database',
      hours: backendHours,
      reason: `Detected: ${techStack.find((t) => t.category === 'Backend')?.name}`,
    });
    totalHours += backendHours;
  }

  // Check for analytics
  const hasAnalytics = techStack.some((t) => t.category === 'Analytics');
  if (hasAnalytics) {
    const analyticsHours = 3;
    breakdown.push({
      component: 'Analytics Setup',
      hours: analyticsHours,
      reason: `Detected: ${techStack.find((t) => t.category === 'Analytics')?.name}`,
    });
    totalHours += analyticsHours;
  }

  // Pricing page complexity
  if (pricing.found && pricing.tiers && pricing.tiers.length > 0) {
    const pricingHours = 8;
    breakdown.push({
      component: 'Pricing Page',
      hours: pricingHours,
      reason: `${pricing.tiers.length} pricing tier${pricing.tiers.length > 1 ? 's' : ''} detected`,
    });
    totalHours += pricingHours;
  }

  // SEO implementation
  if (seo.score < 70) {
    const seoHours = 5;
    breakdown.push({
      component: 'SEO Improvements',
      hours: seoHours,
      reason: `Current SEO score: ${seo.score}/100`,
    });
    totalHours += seoHours;
  }

  // Framework-specific complexity
  const framework = techStack.find((t) => t.category === 'Framework');
  if (framework) {
    const frameworkHours = 5;
    breakdown.push({
      component: 'Framework Setup',
      hours: frameworkHours,
      reason: `${framework.name} configuration and optimization`,
    });
    totalHours += frameworkHours;
  }

  // Determine complexity level
  let complexity: Complexity;
  if (totalHours <= 20) {
    complexity = 'simple';
  } else if (totalHours <= 50) {
    complexity = 'moderate';
  } else if (totalHours <= 100) {
    complexity = 'complex';
  } else {
    complexity = 'very-complex';
  }

  // Determine required skills
  const requiredSkills: string[] = ['HTML/CSS', 'JavaScript'];

  if (framework) {
    const frameworkName = framework.name;
    if (frameworkName.includes('Next') || frameworkName.includes('React')) {
      requiredSkills.push('React', 'Next.js');
    } else if (frameworkName.includes('Vue') || frameworkName.includes('Nuxt')) {
      requiredSkills.push('Vue', 'Nuxt');
    } else if (frameworkName.includes('Svelte')) {
      requiredSkills.push('Svelte', 'SvelteKit');
    }
  }

  if (hasAuth) {
    requiredSkills.push('Authentication Systems');
  }

  if (hasPayments) {
    requiredSkills.push('Payment Integration');
  }

  if (hasBackend) {
    requiredSkills.push('Backend Development', 'Database Design');
  }

  requiredSkills.push('TypeScript'); // Always beneficial

  // Suggest similar open source projects
  const similarOpenSource: string[] = [];

  // Match based on category
  if (hasAuth && hasPayments && hasBackend) {
    similarOpenSource.push(
      'saas-starter-kit (Next.js SaaS boilerplate)',
      'supersaas (Full-stack SaaS template)'
    );
  } else if (hasAuth && hasBackend) {
    similarOpenSource.push('next-saas-starter', 'supabase-saas-kit');
  } else if (framework?.name === 'Next.js') {
    similarOpenSource.push('next-enterprise', 'taxonomy (shadcn starter)');
  } else {
    similarOpenSource.push('awesome-saas-boilerplates (GitHub collection)');
  }

  return {
    totalHours,
    complexity,
    breakdown,
    requiredSkills: [...new Set(requiredSkills)],
    similarOpenSource,
  };
}
