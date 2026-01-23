/**
 * k6 Load Test for Teardown Generator
 *
 * Install k6: brew install k6
 * Run: k6 run scripts/load-test.js
 *
 * Tests:
 * - Homepage load (landing page)
 * - API rate limit handling
 * - Concurrent analysis requests
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const homepageLatency = new Trend('homepage_latency');
const apiLatency = new Trend('api_latency');

// Test configuration
const BASE_URL = __ENV.BASE_URL || 'https://teardown-generator.vercel.app';

export const options = {
  // Test scenarios
  scenarios: {
    // Scenario 1: Smoke test (basic functionality)
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      gracefulStop: '10s',
      tags: { scenario: 'smoke' },
      exec: 'smokeTest',
    },

    // Scenario 2: Load test (normal traffic)
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },  // Ramp up to 10 users
        { duration: '1m', target: 10 },   // Stay at 10 users
        { duration: '30s', target: 0 },   // Ramp down
      ],
      gracefulStop: '30s',
      tags: { scenario: 'load' },
      exec: 'loadTest',
      startTime: '40s', // Start after smoke test
    },

    // Scenario 3: Stress test (high traffic)
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 },  // Ramp to 50 users
        { duration: '1m', target: 50 },   // Stay at 50
        { duration: '30s', target: 100 }, // Spike to 100
        { duration: '1m', target: 100 },  // Stay at 100
        { duration: '30s', target: 0 },   // Ramp down
      ],
      gracefulStop: '30s',
      tags: { scenario: 'stress' },
      exec: 'stressTest',
      startTime: '3m', // Start after load test
    },
  },

  // Thresholds (pass/fail criteria)
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% of requests under 3s
    http_req_failed: ['rate<0.1'],     // Less than 10% failure rate
    errors: ['rate<0.1'],               // Custom error rate under 10%
    homepage_latency: ['p(95)<2000'],   // Homepage 95th percentile under 2s
  },
};

// Smoke test: Basic functionality check
export function smokeTest() {
  group('Homepage Load', () => {
    const res = http.get(`${BASE_URL}/`);

    const success = check(res, {
      'homepage status is 200': (r) => r.status === 200,
      'homepage has content': (r) => r.body.includes('Teardown'),
      'homepage loads under 3s': (r) => r.timings.duration < 3000,
    });

    errorRate.add(!success);
    homepageLatency.add(res.timings.duration);
  });

  sleep(1);
}

// Load test: Normal traffic simulation
export function loadTest() {
  group('Normal User Flow', () => {
    // Step 1: Load homepage
    const homepage = http.get(`${BASE_URL}/`);
    check(homepage, {
      'homepage loads': (r) => r.status === 200,
    });
    homepageLatency.add(homepage.timings.duration);

    sleep(2); // User reads the page

    // Step 2: Submit analysis request
    const payload = JSON.stringify({
      url: `https://example-${__VU}-${__ITER}.com`,
    });

    const headers = {
      'Content-Type': 'application/json',
    };

    const apiRes = http.post(`${BASE_URL}/api/teardown`, payload, { headers });

    const apiSuccess = check(apiRes, {
      'api responds': (r) => r.status === 201 || r.status === 429 || r.status === 200,
      'api returns JSON': (r) => {
        try {
          JSON.parse(r.body);
          return true;
        } catch {
          return false;
        }
      },
    });

    errorRate.add(!apiSuccess);
    apiLatency.add(apiRes.timings.duration);

    // Log rate limit responses
    if (apiRes.status === 429) {
      console.log(`Rate limited: VU ${__VU}, Iteration ${__ITER}`);
    }
  });

  sleep(Math.random() * 3 + 1); // Random 1-4s think time
}

// Stress test: High traffic simulation
export function stressTest() {
  group('Stress Test', () => {
    // Rapid homepage requests
    const homepage = http.get(`${BASE_URL}/`);

    const success = check(homepage, {
      'homepage responds under stress': (r) => r.status === 200 || r.status === 503,
      'response time acceptable': (r) => r.timings.duration < 5000,
    });

    errorRate.add(!success);
    homepageLatency.add(homepage.timings.duration);

    // Some users will try to submit
    if (Math.random() < 0.3) { // 30% of users submit
      const payload = JSON.stringify({
        url: `https://stress-test-${__VU}-${__ITER}.com`,
      });

      const apiRes = http.post(`${BASE_URL}/api/teardown`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      check(apiRes, {
        'api handles stress': (r) => r.status < 500,
      });

      apiLatency.add(apiRes.timings.duration);
    }
  });

  sleep(Math.random() * 2); // 0-2s between requests
}

// Summary handler
export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    scenarios: {
      smoke: {
        requests: data.metrics.http_reqs?.values?.count || 0,
        avgDuration: data.metrics.http_req_duration?.values?.avg || 0,
      },
      load: {
        requests: data.metrics.http_reqs?.values?.count || 0,
        p95Duration: data.metrics.http_req_duration?.values['p(95)'] || 0,
      },
      stress: {
        requests: data.metrics.http_reqs?.values?.count || 0,
        errorRate: data.metrics.errors?.values?.rate || 0,
      },
    },
    thresholds: {
      passed: Object.values(data.thresholds || {}).every(t => t.ok),
      details: data.thresholds,
    },
  };

  return {
    'stdout': JSON.stringify(summary, null, 2) + '\n',
    '.feedback/load-test-results.json': JSON.stringify(summary, null, 2),
  };
}
