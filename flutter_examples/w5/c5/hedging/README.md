# Request Hedging Pattern

Request hedging is a latency optimization technique where you fire multiple redundant requests and accept the first response, canceling the others. This reduces tail latencies by hedging against slow responses.

## What is Hedging?

Hedging is when you:
1. Fire the original request
2. Wait a short delay (e.g., 100ms)
3. If no response yet, fire a second request
4. Accept whichever responds first
5. Cancel the slower request

**Key insight:** If a request is taking longer than expected, there's a good chance a fresh request will complete faster.

## When to Use Hedging

### Good Use Cases ✓
- **High latency variance**: When response times are unpredictable (50ms to 500ms)
- **Read-heavy workloads**: Safe for idempotent GET requests
- **Tail latency sensitive**: When P95/P99 latency matters more than average
- **Multiple backends**: When you can route to different servers
- **Mobile apps**: Network conditions vary widely

### Bad Use Cases ✗
- **Low latency variance**: If responses are consistently fast (50-70ms)
- **Non-idempotent operations**: POST/PUT that create/modify resources
- **Rate-limited APIs**: Extra requests count against quotas
- **Small latency budgets**: Hedging adds minimal overhead
- **Cost-sensitive**: Doubles request volume on slow paths

## Files

### 1. `hedging_example.dart`
Basic hedging implementation and common patterns.

**Features:**
- Basic hedging with CancelToken (from slides)
- Hedging with metadata tracking
- Multiple concurrent hedges
- Configurable hedging strategies
- Error handling

**Dependencies:**
```yaml
dependencies:
  dio: ^5.4.0
```

**Run:**
```bash
dart run w5/c5/hedging/hedging_example.dart
```

**Example:**
```dart
Future<Response> hedgedGet(Dio dio, String url,
    {Duration delay = const Duration(milliseconds: 120)}) async {
  final t1 = CancelToken(), t2 = CancelToken();
  final c = Completer<Response>();
  var won = false;

  // Fire original
  dio.get(url, cancelToken: t1).then((r) {
    if (!won) { won = true; t2.cancel(); c.complete(r); }
  }).catchError((e) {
    if (!won && e is! DioException) c.completeError(e);
  });

  // Fire hedge after delay
  Future.delayed(delay, () {
    if (won) return;
    dio.get(url, cancelToken: t2).then((r) {
      if (!won) { won = true; t1.cancel(); c.complete(r); }
    }).catchError((e) {
      if (!won && e is! DioException) c.completeError(e);
    });
  });

  return c.future;
}
```

### 2. `advanced_hedging.dart`
Advanced hedging strategies and optimizations.

**Features:**
- **Adaptive hedging**: Adjusts delay based on P95 latency
- **Load-balanced hedging**: Distributes across backends
- **Budget-based hedging**: Limits extra request rate
- **Probabilistic hedging**: Hedges based on probability
- **Cascading hedges**: Multiple hedge levels

**Run:**
```bash
dart run w5/c5/hedging/advanced_hedging.dart
```

### 3. `hedging_analysis.dart`
Performance analysis and measurement tools.

**Features:**
- Latency improvement analysis
- Cost-benefit analysis
- Optimal delay calculation
- Strategy comparison
- Network condition testing

**Run:**
```bash
dart run w5/c5/hedging/hedging_analysis.dart
```

## Core Concepts

### 1. Hedge Delay
The time to wait before firing the second request.

```dart
// Too short (50ms): Wastes requests
Duration(milliseconds: 50)

// Good (100-150ms): Balances latency and cost
Duration(milliseconds: 120)

// Too long (300ms): Defeats the purpose
Duration(milliseconds: 300)
```

**Rule of thumb:** Set delay to P95 or P99 of normal latency distribution.

### 2. Cancel Tokens
Essential for stopping slower requests.

```dart
final t1 = CancelToken(), t2 = CancelToken();

// When request 1 wins
if (!won) {
  won = true;
  t2.cancel();  // Cancel request 2
  c.complete(r);
}
```

### 3. Race Condition Handling
Prevent completing multiple times.

```dart
var won = false;

void handleResponse(Response r) {
  if (!won) {  // Check BEFORE acting
    won = true;
    // Cancel other requests
    // Complete future
  }
}
```

## Hedging Strategies

### 1. Basic Hedging
Fire one hedge after fixed delay.

```
Time:     0ms        100ms       200ms
Request1: ═══════════════════════════▶ response
Request2:             ═════════▶ response (WINS)
```

**Pros:**
- Simple to implement
- Predictable behavior
- Good for most cases

**Cons:**
- Fixed delay may not be optimal
- No adaptation to changing conditions

### 2. Adaptive Hedging
Adjust delay based on observed latency.

```dart
class AdaptiveHedger {
  Duration _delay = Duration(milliseconds: 100);

  void recordLatency(Duration latency) {
    // Update delay to P95 of observed latencies
    _delay = calculateP95(latencies);
  }
}
```

**Pros:**
- Adapts to actual performance
- Optimizes delay over time
- Better resource utilization

**Cons:**
- More complex
- Needs warmup period

### 3. Cascading Hedges
Fire multiple hedges at different delays.

```
Time:     0ms    50ms    100ms   150ms
Request1: ══════════════════════════════▶
Request2:       ═════════▶ (WINS)
Request3:               ═════════▶
Request4:                       ═════════▶
```

**Pros:**
- Better tail latency coverage
- Multiple safety nets

**Cons:**
- Higher cost
- More requests to manage

### 4. Budget-Based Hedging
Only hedge if under rate limit.

```dart
class BudgetBasedHedger {
  final int _maxHedgesPerSecond = 10;

  bool _canHedge() {
    return currentHedgeRate < _maxHedgesPerSecond;
  }
}
```

**Pros:**
- Controlled cost
- Prevents overload
- Good for production

**Cons:**
- May not hedge when needed
- Requires tuning

## Performance Characteristics

### Latency Impact

**Typical improvements:**
```
Without hedging:
  P50: 120ms
  P95: 450ms
  P99: 800ms

With hedging (100ms delay):
  P50: 110ms  (8% improvement)
  P95: 180ms  (60% improvement)  ← Big win!
  P99: 250ms  (69% improvement)  ← Huge win!
```

### Cost Impact

**Request overhead:**
```
Hedge delay: 100ms
Original P95: 150ms

Hedge fires: ~40% of requests
Extra cost: +40% requests on slow paths
Average overhead: ~20% more requests overall
```

### Optimal Delay Calculation

**Formula:**
```
optimal_delay ≈ P95_latency * 0.5 to 0.75

Example:
  P95 = 200ms
  Optimal delay = 100-150ms
```

**Why this works:**
- Delay < P95: Hedge fires before most requests complete
- Delay > P95: Hedge fires too late to help

## Decision Guide

```
Is latency variance high (>2x between P50 and P95)?
├─ NO → Don't use hedging
└─ YES → Continue
    │
    Is operation idempotent (GET request)?
    ├─ NO → Don't use hedging
    └─ YES → Continue
        │
        Is extra request cost acceptable?
        ├─ NO → Consider:
        │       - Budget-based hedging
        │       - Probabilistic hedging
        │       - Higher hedge delay
        └─ YES → Use hedging!
            │
            What strategy?
            ├─ Starting out → Basic hedging
            ├─ Need optimization → Adaptive hedging
            ├─ Multiple backends → Load-balanced hedging
            └─ Critical latency → Cascading hedges
```

## Best Practices

### 1. Only for Idempotent Operations
```dart
// ✅ Safe: GET requests
await hedgedGet(dio, '/api/users/123');

// ✅ Safe: Idempotent HEAD
await hedgedHead(dio, '/api/health');

// ❌ Unsafe: POST creates resource
await hedgedPost(dio, '/api/orders', data: order);

// ⚠️ Depends: PUT may be idempotent
await hedgedPut(dio, '/api/users/123', data: user);
```

### 2. Set Appropriate Delay
```dart
// Measure your P95 latency first
final p95 = measureP95Latency();

// Set hedge delay to 50-75% of P95
final hedgeDelay = Duration(
  milliseconds: (p95.inMilliseconds * 0.65).round(),
);
```

### 3. Always Cancel Slower Requests
```dart
// ✅ Good: Cancel slower request
if (!won) {
  won = true;
  otherToken.cancel();
  complete(response);
}

// ❌ Bad: Leave request running
if (!won) {
  won = true;
  complete(response);
  // Forgot to cancel!
}
```

### 4. Handle Errors Properly
```dart
void handleError(dynamic e) {
  // Ignore cancellation errors
  if (e is DioException && e.type == DioExceptionType.cancel) {
    return;
  }

  // Only complete error if both requests failed
  errorCount++;
  if (errorCount >= 2) {
    completer.completeError(e);
  }
}
```

### 5. Monitor Hedge Effectiveness
```dart
class HedgingMetrics {
  int totalRequests = 0;
  int hedgesFired = 0;
  int request1Wins = 0;
  int request2Wins = 0;

  double get hedgeRate => hedgesFired / totalRequests;
  double get request2WinRate => request2Wins / hedgesFired;
}
```

### 6. Use Budget Limits in Production
```dart
final hedger = BudgetBasedHedger(
  maxHedgesPerSecond: 100,  // Limit to 100 extra req/sec
);

// Hedging will be skipped when over budget
final response = await hedger.hedgedGet(dio, url);
```

## Common Pitfalls

### 1. Not Canceling Slower Requests
```dart
// ❌ Bad: Wastes resources
won = true;
complete(response);
// Other request keeps running!

// ✅ Good: Clean up
won = true;
otherToken.cancel();
complete(response);
```

### 2. Hedging Non-Idempotent Operations
```dart
// ❌ Bad: Creates duplicate orders
await hedgedPost(dio, '/orders', data: newOrder);

// ✅ Good: Only hedge reads
await hedgedGet(dio, '/orders/123');
```

### 3. Delay Too Short
```dart
// ❌ Bad: Hedge fires immediately
Duration(milliseconds: 10)  // Wastes requests

// ✅ Good: Wait for expected latency
Duration(milliseconds: 100)  // Based on P95
```

### 4. Not Handling Race Conditions
```dart
// ❌ Bad: Can complete twice
dio.get(url, cancelToken: t1).then((r) {
  complete(r);  // No check!
});

// ✅ Good: Check before completing
dio.get(url, cancelToken: t1).then((r) {
  if (!won) {  // Guard
    won = true;
    complete(r);
  }
});
```

### 5. Ignoring Cost
```dart
// ❌ Bad: Aggressive hedging
Duration(milliseconds: 20)  // Fires almost always

// ✅ Good: Consider cost
Duration(milliseconds: 120)  // ~30% hedge rate
```

## Real-World Examples

### Example 1: Mobile App
```dart
// User taps "Load Posts"
// Network conditions vary (WiFi/4G/5G)
final posts = await hedgedGet(
  dio,
  '/api/posts',
  delay: Duration(milliseconds: 100),
);
// Result: Faster load times, better UX
```

### Example 2: Microservices
```dart
// Service A calls Service B
// Service B has variable latency (50-500ms)
final loadBalancer = LoadBalancedHedger([
  'https://service-b-1.internal',
  'https://service-b-2.internal',
  'https://service-b-3.internal',
]);
final data = await loadBalancer.hedgedGet(dio, '/api/data');
// Result: Lower tail latencies, better reliability
```

### Example 3: API Gateway
```dart
// Gateway routes to backend
// Adaptive hedging based on observed latency
final hedger = AdaptiveHedger();
for (var request in requests) {
  final response = await hedger.hedgedGet(dio, request.url);
  // Hedge delay adapts to backend performance
}
```

## Metrics to Track

### Key Metrics
1. **Hedge rate**: % of requests where hedge fires
2. **Win rate**: % of time hedge wins
3. **Latency improvement**: P95/P99 before vs after
4. **Cost increase**: Extra requests as % of total
5. **Efficiency**: Latency improvement / cost increase

### Sample Dashboard
```
Hedging Metrics (last hour)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total requests:     10,000
Hedges fired:        3,200 (32%)
Hedge wins:          1,800 (56% of hedges)
Current delay:       115ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Latency:
  P50:  95ms → 92ms   (-3%)
  P95: 380ms → 165ms  (-57%)
  P99: 720ms → 210ms  (-71%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cost:
  Extra requests:     1,800 (18% increase)
  Efficiency:         3.2x (latency improvement / cost)
```

## Comparison with Other Techniques

| Technique | Tail Latency | Avg Latency | Cost | Complexity |
|-----------|-------------|-------------|------|------------|
| No optimization | Baseline | Baseline | 1x | Low |
| Retries | Poor | Worse | 1-2x | Low |
| Timeouts | Good | Same | 1x | Low |
| Hedging | Excellent | Slightly better | 1.2-1.5x | Medium |
| Load balancing | Good | Better | 1x | Medium |
| Caching | Excellent | Excellent | 1x | High |

**Hedging's sweet spot:** Reducing tail latency when other techniques aren't enough.

## Further Reading

- [The Tail at Scale](https://research.google/pubs/pub40801/) - Google's paper on tail latency
- [Hedged Requests](https://www.bailis.org/blog/doing-redundant-work-to-speed-up-distributed-queries/) - Peter Bailis
- [AWS Best Practices](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)

## Summary

**Use hedging when:**
- ✓ High latency variance (P95 >> P50)
- ✓ Idempotent operations (GET requests)
- ✓ Tail latency matters
- ✓ Extra cost is acceptable

**Don't use hedging when:**
- ✗ Low latency variance
- ✗ Non-idempotent operations
- ✗ Rate-limited APIs
- ✗ Cost-sensitive systems

**Key takeaway:** Hedging trades cost (extra requests) for reduced tail latency. Set delay to ~50-75% of P95 latency for best results.
