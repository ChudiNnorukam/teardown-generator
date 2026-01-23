import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Zap } from 'lucide-react';

interface ComparisonRow {
  feature: string;
  teardown: boolean | string;
  builtwith: boolean | string;
  wappalyzer: boolean | string;
}

const comparisons: ComparisonRow[] = [
  {
    feature: 'Tech Stack Detection',
    teardown: true,
    builtwith: true,
    wappalyzer: true,
  },
  {
    feature: 'Pricing Page Analysis',
    teardown: true,
    builtwith: false,
    wappalyzer: false,
  },
  {
    feature: 'SEO Audit (Score + Issues)',
    teardown: true,
    builtwith: false,
    wappalyzer: false,
  },
  {
    feature: 'Clone Time Estimate',
    teardown: true,
    builtwith: false,
    wappalyzer: false,
  },
  {
    feature: 'Free Tier',
    teardown: '3-10/day',
    builtwith: '5 lookups',
    wappalyzer: '50/month',
  },
  {
    feature: 'No Account Required',
    teardown: true,
    builtwith: false,
    wappalyzer: false,
  },
  {
    feature: 'Instant Results',
    teardown: true,
    builtwith: true,
    wappalyzer: true,
  },
  {
    feature: 'Actionable Insights',
    teardown: true,
    builtwith: false,
    wappalyzer: false,
  },
];

function ValueCell({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-accent mx-auto" />
    ) : (
      <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />
    );
  }
  return <span className="text-sm">{value}</span>;
}

export function ComparisonSection() {
  return (
    <section className="container py-16 md:py-24">
      <div className="text-center mb-12 space-y-4">
        <Badge variant="outline">Why Teardown?</Badge>
        <h2 className="text-3xl md:text-4xl font-bold">
          More than just tech detection
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Other tools tell you what tech a site uses. We tell you how to <strong>compete</strong> with them.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Feature Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Feature</th>
                    <th className="text-center py-3 px-4 font-medium">
                      <span className="text-primary">Teardown</span>
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                      BuiltWith
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                      Wappalyzer
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((row, index) => (
                    <tr
                      key={row.feature}
                      className={index < comparisons.length - 1 ? 'border-b' : ''}
                    >
                      <td className="py-3 px-4 text-sm">{row.feature}</td>
                      <td className="py-3 px-4 text-center">
                        <ValueCell value={row.teardown} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <ValueCell value={row.builtwith} />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <ValueCell value={row.wappalyzer} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Know Their Pricing</h3>
              <p className="text-sm text-muted-foreground">
                We extract pricing tiers, feature lists, and price points. Understand how competitors position themselves.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Plan Your Build</h3>
              <p className="text-sm text-muted-foreground">
                Get hour estimates broken down by feature. Know what it takes to build a competitor before you start.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Find SEO Gaps</h3>
              <p className="text-sm text-muted-foreground">
                See their meta tags, heading structure, and optimization score. Find opportunities they missed.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
