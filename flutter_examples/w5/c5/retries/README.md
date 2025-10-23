# Implementing Retries in Flutter/Dart

This directory contains comprehensive examples of implementing retry logic for HTTP requests, covering both manual implementations and library-based approaches.

## Overview

Retries are essential for handling transient failures in distributed systems:
- Network timeouts
- Server errors (5xx)
- Rate limiting (429)
- Temporary service unavailability

## Approaches

### Manual Retries
Implement retry logic yourself with full control:
- Loop with try/catch
- Classify errors (timeouts, 5xx, 429)
- Compute next delay with jitter
- Stop on non-retryable errors

### Library-Based Retries
Use existing libraries that handle retries:
- **RetryClient** (package:http): Wraps an underlying client
- **Dio Interceptor**: Custom interceptor for Dio

## Files

### 1. `manual_retry.dart`
Manual retry implementations with error classification and various jitter strategies.

**Features:**
- Basic retry with decorrelated jitter (from slides)
- Error classification (retryable vs non-retryable)
- Multiple jitter strategies
- Customizable retry conditions

**Run:**
```bash
dart run w5/c5/retries/manual_retry.dart
```

**Example:**
```dart
// Basic retry with decorrelated jitter
Future<T> retry<T>(Future<T> Function() fn,
    {int max = 4, Duration base = const Duration(milliseconds: 400)}) async {
  final rnd = Random();
  var delay = base;
  for (var attempt = 0;; attempt++) {
    try { return await fn(); }
    catch (e) {
      if (attempt >= max) rethrow;
      await Future.delayed(Duration(
        milliseconds: rnd.nextInt(delay.inMilliseconds + 1)
      ));
      delay = delay * 2; // cap in real code
    }
  }
}
```

### 2. `retry_client_example.dart`
Using RetryClient from package:http.

**Features:**
- Simple wrapper around http.Client
- Customizable retry conditions
- Custom delay strategies
- Composable with other clients

**Dependencies:**
```yaml
dependencies:
  http: ^1.1.0
```

**Run:**
```bash
dart run w5/c5/retries/retry_client_example.dart
```

**Example:**
```dart
final base = http.Client();
final client = RetryClient(
  base,
  retries: 3,
  when: (response) => response.statusCode >= 500,
  whenError: (error, stackTrace) => true,
);
final res = await client.get(Uri.parse('https://api.example.com'));
client.close();
```

### 3. `dio_retry_interceptor.dart`
Custom Dio interceptor for retry logic.

**Features:**
- Simple and advanced interceptors
- Exponential backoff with jitter
- Custom retry conditions
- Multiple retry strategies

**Dependencies:**
```yaml
dependencies:
  dio: ^5.4.0
```

**Run:**
```bash
dart run w5/c5/retries/dio_retry_interceptor.dart
```

**Example:**
```dart
final dio = Dio();
dio.interceptors.add(AdvancedRetryInterceptor(
  maxRetries: 3,
  baseDelay: Duration(milliseconds: 100),
  useJitter: true,
));
final res = await dio.get('https://api.example.com');
```

### 4. `jitter_strategies.dart`
Comprehensive comparison of different jitter strategies.

**Features:**
- No jitter (pure exponential backoff)
- Full jitter (AWS recommendation)
- Equal jitter
- Decorrelated jitter (AWS recommendation)
- Visual comparison and statistics

**Run:**
```bash
dart run w5/c5/retries/jitter_strategies.dart
```

## Error Classification

### Retryable Errors
These errors are typically transient and worth retrying:

| Error Type | Status Code | Reason |
|------------|-------------|---------|
| Server Errors | 500-504 | Temporary server issues |
| Rate Limiting | 429 | Too many requests |
| Timeout | - | Network congestion |
| Connection Error | - | Network issues |

### Non-Retryable Errors
These errors indicate client problems and should not be retried:

| Error Type | Status Code | Reason |
|------------|-------------|---------|
| Bad Request | 400 | Invalid request |
| Unauthorized | 401 | Authentication required |
| Forbidden | 403 | No permission |
| Not Found | 404 | Resource doesn't exist |

## Jitter Strategies

### Why Use Jitter?
Jitter prevents the "thundering herd" problem where multiple clients retry simultaneously, overwhelming a recovering server.

### Strategy Comparison

```
Retry Attempt: 0 → 1 → 2 → 3 → 4
Base Delay: 100ms

No Jitter:          100ms → 200ms → 400ms → 800ms → 1600ms
Full Jitter:        0-100 → 0-200 → 0-400 → 0-800 → 0-1600
Equal Jitter:      50-100 → 100-200 → 200-400 → 400-800 → 800-1600
Decorrelated:    100-300 → varies based on previous delay
```

### 1. No Jitter (Pure Exponential Backoff)
```dart
Duration noJitter(int retryCount, {int baseMs = 100}) {
  final delayMs = baseMs * (1 << retryCount); // 2^retryCount
  return Duration(milliseconds: delayMs);
}
```

**Pros:**
- Predictable delays
- Simple to implement

**Cons:**
- Thundering herd problem
- All clients retry simultaneously

### 2. Full Jitter (AWS Recommendation)
```dart
Duration fullJitter(int retryCount, {int baseMs = 100}) {
  final rnd = Random();
  final maxDelay = baseMs * (1 << retryCount);
  final delayMs = rnd.nextInt(maxDelay + 1);
  return Duration(milliseconds: delayMs);
}
```

**Pros:**
- Best for avoiding thundering herd
- AWS recommendation
- Good distribution

**Cons:**
- Can have very short delays (near 0)
- Higher variance

### 3. Equal Jitter
```dart
Duration equalJitter(int retryCount, {int baseMs = 100}) {
  final rnd = Random();
  final exponentialDelay = baseMs * (1 << retryCount);
  final half = exponentialDelay ~/ 2;
  final delayMs = half + rnd.nextInt(half + 1);
  return Duration(milliseconds: delayMs);
}
```

**Pros:**
- Balance between predictability and randomness
- Guaranteed minimum delay (50% of exponential)

**Cons:**
- Still has some collision potential

### 4. Decorrelated Jitter (AWS Recommendation)
```dart
class DecorrelatedJitter {
  int _previousDelay;
  final int baseMs;
  final Random _random;

  Duration next(int retryCount) {
    final maxJitter = _previousDelay * 3;
    final delayMs = baseMs + _random.nextInt(maxJitter - baseMs + 1);
    _previousDelay = delayMs;
    return Duration(milliseconds: delayMs);
  }
}
```

**Pros:**
- Best balance (AWS recommendation)
- Each retry independent of attempt number
- Good distribution

**Cons:**
- Stateful (tracks previous delay)
- Slightly more complex

## Best Practices

### 1. Choose Appropriate Max Retries
```dart
// Too few retries
maxRetries: 1  // May give up too quickly

// Reasonable for most APIs
maxRetries: 3

// For critical operations
maxRetries: 5
```

### 2. Set Maximum Delay Cap
```dart
final delay = Duration(
  milliseconds: min(
    exponentialDelay,
    30000, // Cap at 30 seconds
  ),
);
```

### 3. Classify Errors Properly
```dart
bool isRetryable(dynamic error) {
  // Network errors - retryable
  if (error is SocketException) return true;
  if (error is TimeoutException) return true;

  // 5xx server errors - retryable
  if (statusCode >= 500) return true;

  // 429 rate limit - retryable
  if (statusCode == 429) return true;

  // 4xx client errors - not retryable
  if (statusCode >= 400 && statusCode < 500) return false;

  return false;
}
```

### 4. Use Jitter
Always use jitter to avoid thundering herd:
```dart
// ❌ Bad: No jitter
await Future.delayed(Duration(milliseconds: baseDelay * (1 << retry)));

// ✅ Good: Full jitter
final maxDelay = baseDelay * (1 << retry);
await Future.delayed(Duration(
  milliseconds: Random().nextInt(maxDelay + 1),
));
```

### 5. Log Retry Attempts
```dart
print(
  'Retry attempt ${attempt + 1}/${maxAttempts} '
  'after ${delay.inMilliseconds}ms (${errorType})',
);
```

### 6. Consider Idempotency
Only retry idempotent operations:
- ✅ GET requests
- ✅ PUT requests (if truly idempotent)
- ✅ DELETE requests (if idempotent)
- ⚠️ POST requests (only if idempotent)

## Decision Guide

### Use Manual Retry When:
- You need fine-grained control over retry logic
- You want custom error classification
- You need specific jitter strategies
- You're not using http or Dio

### Use RetryClient (package:http) When:
- You're using package:http
- You want a simple, composable solution
- Default retry logic is sufficient
- You prefer declarative configuration

### Use Dio Interceptor When:
- You're already using Dio
- You want to leverage Dio's features
- You need access to full request/response context
- You want to integrate with other Dio interceptors

## Performance Considerations

### Total Wait Time Comparison
With base delay of 100ms and 4 retries:

| Strategy | Min Wait | Max Wait | Avg Wait |
|----------|----------|----------|----------|
| No Jitter | 3,100ms | 3,100ms | 3,100ms |
| Full Jitter | 0ms | 3,100ms | ~1,550ms |
| Equal Jitter | 1,550ms | 3,100ms | ~2,325ms |
| Decorrelated | Varies | Varies | ~1,800ms |

### Thundering Herd Impact

**Scenario:** 1000 clients all fail at the same time

**No Jitter:**
```
All 1000 clients retry at exactly:
- 100ms
- 300ms (100 + 200)
- 700ms (300 + 400)
- 1500ms (700 + 800)
```

**Full Jitter:**
```
Clients spread across time ranges:
- 0-100ms
- 0-200ms after first retry
- 0-400ms after second retry
- 0-800ms after third retry
```

Result: Jitter reduces peak load by ~50-75%

## Code Examples

### Complete Manual Retry Example
```dart
Future<T> retryWithClassification<T>(
  Future<T> Function() fn, {
  int maxAttempts = 4,
  Duration baseDelay = const Duration(milliseconds: 400),
  Duration maxDelay = const Duration(seconds: 30),
}) async {
  final rnd = Random();
  var delay = baseDelay;

  for (var attempt = 0;; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt >= maxAttempts || !isRetryable(e)) rethrow;

      final jitteredDelay = Duration(
        milliseconds: rnd.nextInt(delay.inMilliseconds + 1),
      );

      await Future.delayed(jitteredDelay);

      delay = Duration(
        milliseconds: min(
          delay.inMilliseconds * 2,
          maxDelay.inMilliseconds,
        ),
      );
    }
  }
}
```

### Complete RetryClient Example
```dart
final base = http.Client();
final client = RetryClient(
  base,
  retries: 3,
  when: (response) {
    return response.statusCode >= 500 || response.statusCode == 429;
  },
  whenError: (error, stackTrace) => true,
  delay: (retryCount) {
    final delayMs = 100 * (1 << retryCount);
    return Duration(milliseconds: Random().nextInt(delayMs + 1));
  },
);
```

### Complete Dio Interceptor Example
```dart
class AdvancedRetryInterceptor extends Interceptor {
  final int maxRetries;
  final Duration baseDelay;
  final bool useJitter;

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final retryCount = err.requestOptions.extra['retryCount'] as int? ?? 0;

    if (retryCount < maxRetries && _shouldRetry(err)) {
      final delay = _calculateDelay(retryCount);

      err.requestOptions.extra['retryCount'] = retryCount + 1;
      await Future.delayed(delay);

      try {
        final dio = Dio();
        final response = await dio.request(
          err.requestOptions.path,
          data: err.requestOptions.data,
          options: Options(method: err.requestOptions.method),
        );
        handler.resolve(response);
      } catch (e) {
        handler.reject(e as DioException);
      }
    } else {
      handler.next(err);
    }
  }
}
```

## Additional Resources

- [AWS Exponential Backoff and Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
- [package:http documentation](https://pub.dev/packages/http)
- [Dio documentation](https://pub.dev/packages/dio)
- [RFC 7231 - HTTP Status Codes](https://tools.ietf.org/html/rfc7231)
- [Google Cloud Retry Strategy](https://cloud.google.com/storage/docs/retry-strategy)

## Summary

| Approach | Complexity | Control | Best For |
|----------|-----------|---------|----------|
| Manual | High | Full | Custom logic, learning |
| RetryClient | Low | Medium | package:http users |
| Dio Interceptor | Medium | High | Dio users, complex needs |

**Recommendation:** Start with RetryClient or Dio interceptor for simplicity. Implement manual retries only when you need custom behavior not provided by libraries.
