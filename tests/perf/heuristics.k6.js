import http from 'k6/http';
import { check, sleep, Rate } from 'k6';

// Custom metrics
let errorRate = new Rate('errors');

// Test configuration for 200 tasks, 5 events simulation
export let options = {
  stages: [
    { duration: '30s', target: 5 }, // Warm up
    { duration: '2m', target: 20 }, // Ramp up to 20 concurrent users
    { duration: '5m', target: 50 }, // Peak load - 50 concurrent users
    { duration: '2m', target: 20 }, // Scale down
    { duration: '1m', target: 0 }, // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95th percentile < 200ms (SLA requirement)
    http_req_duration: ['p(99)<500'], // 99th percentile < 500ms
    http_req_failed: ['rate<0.05'], // Error rate < 5%
    errors: ['rate<0.05'], // Custom error rate < 5%
  },
};

// Base URL for Supabase functions
const BASE_URL = __ENV.BASE_URL || 'http://localhost:54321/functions/v1';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'test-token';

// Test data - simulate different company scenarios
const COMPANIES = [
  { id: 'test-company-1', name: 'Company Alpha', task_count: 200 },
  { id: 'test-company-2', name: 'Company Beta', task_count: 150 },
  { id: 'test-company-3', name: 'Company Gamma', task_count: 180 },
];

const EVENTS = ['event1', 'event2', 'event3', 'event4', 'event5'];

export default function () {
  // Randomly select a company for realistic load distribution
  const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
  };

  // Main heuristics endpoint test
  const heuristicsPayload = JSON.stringify({ company_id: company.id });
  const heuristicsResponse = http.post(`${BASE_URL}/task_heuristics`, heuristicsPayload, params);

  const heuristicsSuccess = check(heuristicsResponse, {
    'heuristics status is 200': (r) => r.status === 200,
    'heuristics response time < 200ms': (r) => r.timings.duration < 200,
    'heuristics has suggestions_count': (r) => r.json().suggestions_count !== undefined,
    'heuristics suggestions reasonable': (r) => {
      const count = r.json().suggestions_count;
      return count >= 0 && count <= company.task_count * company.task_count; // Max possible pairs
    },
  });

  errorRate.add(!heuristicsSuccess);

  // Simulate board loading - concurrent task fetching
  const boardPayload = JSON.stringify({
    company_id: company.id,
    event_id: EVENTS[Math.floor(Math.random() * EVENTS.length)],
    limit: 50,
  });

  const boardResponse = http.post(`${BASE_URL}/tasks/board`, boardPayload, params);

  const boardSuccess = check(boardResponse, {
    'board status is 200': (r) => r.status === 200,
    'board response time < 200ms': (r) => r.timings.duration < 200,
    'board has tasks array': (r) => Array.isArray(r.json().tasks),
    'board task count reasonable': (r) => r.json().tasks.length <= 50,
  });

  errorRate.add(!boardSuccess);

  // Simulate API bursts - rapid successive calls (stress testing)
  if (Math.random() < 0.3) {
    // 30% chance of burst
    for (let i = 0; i < 3; i++) {
      const burstResponse = http.get(`${BASE_URL}/tasks?company_id=${company.id}&limit=25`, params);
      check(burstResponse, {
        'burst status is 200': (r) => r.status === 200,
        'burst response time < 300ms': (r) => r.timings.duration < 300, // Slightly higher threshold for bursts
      });
    }
  }

  // Simulate user think time between actions
  sleep(Math.random() * 2 + 0.5); // 0.5-2.5 seconds
}

// Setup function to seed test data (run once before tests)
export function setup() {
  console.log('Setting up performance test data...');

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
  };

  // Seed realistic test data for each company
  COMPANIES.forEach((company) => {
    const tasks = [];
    const taskNames = [
      'Chopped onions',
      'Diced tomatoes',
      'Grated cheese',
      'Sliced mushrooms',
      'Minced garlic',
      'Julienne carrots',
      'Cubed chicken',
      'Shredded lettuce',
      'Crushed nuts',
      'Pureed soup',
      'Whipped cream',
      'Mixed salad',
      'Steamed vegetables',
      'Roasted potatoes',
      'Grilled steak',
      'Baked bread',
    ];

    for (let i = 0; i < company.task_count; i++) {
      const eventId = EVENTS[i % EVENTS.length];
      const baseName = taskNames[i % taskNames.length];

      tasks.push({
        name: `${baseName} ${i}`, // Add variation to names
        quantity: Math.floor(Math.random() * 500) + 50, // More realistic quantities
        unit: ['g', 'kg', 'cup', 'tbsp', 'oz', 'ml', 'l'][Math.floor(Math.random() * 7)],
        company_id: company.id,
        event_id: eventId,
        status: ['available', 'claimed', 'in_progress'][Math.floor(Math.random() * 3)],
        station: ['prep', 'cook', 'plating', 'cleanup'][Math.floor(Math.random() * 4)],
        priority: ['high', 'normal', 'low'][Math.floor(Math.random() * 3)],
      });
    }

    console.log(`Seeding ${company.task_count} tasks for ${company.name}...`);

    // Try to seed via API endpoint, fallback to manual seeding
    const seedResponse = http.post(
      `${BASE_URL}/seed_tasks`,
      JSON.stringify({
        company_id: company.id,
        tasks,
      }),
      params,
    );

    if (seedResponse.status !== 200) {
      console.warn(`Failed to seed ${company.name} via API. Please seed manually.`);
    }
  });

  console.log('Setup complete. Starting performance test...');
  return { companies: COMPANIES };
}

// Teardown function to clean up test data
export function teardown() {
  console.log('Cleaning up test data...');

  const params = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
  };

  // Clean up seeded data
  COMPANIES.forEach((company) => {
    const cleanupResponse = http.del(
      `${BASE_URL}/cleanup_tasks?company_id=${company.id}`,
      null,
      params,
    );
    if (cleanupResponse.status === 200) {
      console.log(`Cleaned up tasks for ${company.name}`);
    } else {
      console.warn(`Failed to cleanup ${company.name}`);
    }
  });
}
