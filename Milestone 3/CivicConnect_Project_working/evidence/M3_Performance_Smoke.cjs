const { randomUUID, randomBytes } = require("node:crypto");
const { performance } = require("node:perf_hooks");
const fs = require("node:fs");
const path = require("node:path");

const base = "http://127.0.0.1:4000";
const concurrency = 10;
const rounds = 10;

async function main() {
  const account = {
    name: "M3 Performance Test",
    email: `m3perf-${randomUUID()}@example.test`,
    password: `M3Test!${randomBytes(12).toString("hex")}`,
  };

  const registration = await fetch(`${base}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(account),
    signal: AbortSignal.timeout(10000),
  });

  if (!registration.ok) {
    throw new Error(`Registration failed: HTTP ${registration.status}`);
  }

  const auth = await registration.json();

  if (!auth.token) {
    throw new Error("Registration did not return an authentication token.");
  }

  const samples = [];

  for (let round = 0; round < rounds; round++) {
    await Promise.all(
      Array.from({ length: concurrency }, async () => {
        const start = performance.now();

        try {
          const response = await fetch(`${base}/api/requests`, {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
            signal: AbortSignal.timeout(10000),
          });

          samples.push({
            ms: performance.now() - start,
            status: response.status,
          });
        } catch {
          samples.push({
            ms: null,
            status: "NETWORK_ERROR",
          });
        }
      })
    );
  }

  const successful = samples
    .filter((s) => s.status === 200)
    .map((s) => s.ms)
    .sort((a, b) => a - b);

  const percentile = (p) =>
    successful.length
      ? Number(
          successful[Math.ceil((p / 100) * successful.length) - 1]
            .toFixed(2)
        )
      : null;

  const result = {
    testId: "TC-PERF-001",
    timestamp: new Date().toISOString(),
    environment: "Local Express backend, in-memory test data",
    operation: "Authenticated GET /api/requests",
    concurrentRequests: concurrency,
    rounds,
    totalRequests: samples.length,
    successfulRequests: successful.length,
    failedRequests: samples.length - successful.length,
    p50Ms: percentile(50),
    p90Ms: percentile(90),
    p95Ms: percentile(95),
    assessment:
      "Short local smoke-load test; not equivalent to a sustained production load test",
  };

  const output = path.join(
    __dirname,
    "M3_Performance_Result.json"
  );

  fs.writeFileSync(
    output,
    JSON.stringify(result, null, 2) + "\n"
  );

  console.log(JSON.stringify(result, null, 2));
  console.log(`Evidence saved: ${output}`);

  if (result.failedRequests > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Performance test failed: ${error.message}`);
  process.exitCode = 1;
});
