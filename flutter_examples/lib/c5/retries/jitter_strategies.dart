// Comparison of different jitter strategies for retries
// No additional dependencies needed

import 'dart:math';
import 'dart:io';

void main() async {
  print('=== Jitter Strategies Comparison ===\n');
  print('Comparing different backoff strategies with 4 retries:\n');

  await compareStrategies();
  print('\n');
  await visualizeStrategies();
}

// Jitter Strategy Implementations

// 1. No jitter - Pure exponential backoff
Duration noJitter(int retryCount, {int baseMs = 100}) {
  final delayMs = baseMs * (1 << retryCount); // 2^retryCount
  return Duration(milliseconds: delayMs);
}

// 2. Full jitter (AWS recommendation)
// Random between 0 and exponential backoff
Duration fullJitter(int retryCount, {int baseMs = 100, Random? random}) {
  final rnd = random ?? Random();
  final maxDelay = baseMs * (1 << retryCount);
  final delayMs = rnd.nextInt(maxDelay + 1);
  return Duration(milliseconds: delayMs);
}

// 3. Equal jitter
// Half of exponential backoff + random other half
Duration equalJitter(int retryCount, {int baseMs = 100, Random? random}) {
  final rnd = random ?? Random();
  final exponentialDelay = baseMs * (1 << retryCount);
  final half = exponentialDelay ~/ 2;
  final delayMs = half + rnd.nextInt(half + 1);
  return Duration(milliseconds: delayMs);
}

// 4. Decorrelated jitter (AWS recommendation)
// Random between base and 3x previous delay
class DecorrelatedJitter {
  int _previousDelay;
  final int baseMs;
  final Random _random;

  DecorrelatedJitter({this.baseMs = 100, Random? random})
      : _previousDelay = baseMs,
        _random = random ?? Random();

  Duration next(int retryCount) {
    final maxJitter = _previousDelay * 3;
    final delayMs = baseMs + _random.nextInt(maxJitter - baseMs + 1);
    _previousDelay = delayMs;
    return Duration(milliseconds: delayMs);
  }

  void reset() {
    _previousDelay = baseMs;
  }
}

// Retry functions using different strategies

Future<T> retryWithStrategy<T>(
  Future<T> Function() fn,
  Duration Function(int) delayStrategy, {
  int maxAttempts = 4,
  String strategyName = 'Unknown',
}) async {
  for (var attempt = 0;; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt >= maxAttempts) rethrow;

      final delay = delayStrategy(attempt);
      print(
        '$strategyName - Retry ${attempt + 1}/$maxAttempts: '
        'waiting ${delay.inMilliseconds}ms',
      );

      await Future.delayed(delay);
    }
  }
}

// Compare strategies
Future<void> compareStrategies() async {
  final testError = SocketException('Simulated connection error');

  // Test each strategy
  print('1. No Jitter (Pure Exponential Backoff)');
  var attempts = 0;
  try {
    await retryWithStrategy(
      () async {
        attempts++;
        if (attempts < 4) throw testError;
        return 'Success';
      },
      (retry) => noJitter(retry),
      strategyName: 'No Jitter',
    );
    print('Succeeded after retries\n');
  } catch (e) {
    print('Failed\n');
  }

  print('2. Full Jitter (AWS Recommendation)');
  attempts = 0;
  try {
    await retryWithStrategy(
      () async {
        attempts++;
        if (attempts < 4) throw testError;
        return 'Success';
      },
      (retry) => fullJitter(retry, random: Random(42)), // Fixed seed for demo
      strategyName: 'Full Jitter',
    );
    print('Succeeded after retries\n');
  } catch (e) {
    print('Failed\n');
  }

  print('3. Equal Jitter');
  attempts = 0;
  try {
    await retryWithStrategy(
      () async {
        attempts++;
        if (attempts < 4) throw testError;
        return 'Success';
      },
      (retry) => equalJitter(retry, random: Random(42)),
      strategyName: 'Equal Jitter',
    );
    print('Succeeded after retries\n');
  } catch (e) {
    print('Failed\n');
  }

  print('4. Decorrelated Jitter (AWS Recommendation)');
  attempts = 0;
  final decorrelated = DecorrelatedJitter(random: Random(42));
  try {
    await retryWithStrategy(
      () async {
        attempts++;
        if (attempts < 4) throw testError;
        return 'Success';
      },
      (retry) => decorrelated.next(retry),
      strategyName: 'Decorrelated',
    );
    print('Succeeded after retries\n');
  } catch (e) {
    print('Failed\n');
  }
}

// Visualize delay patterns
Future<void> visualizeStrategies() async {
  print('=== Delay Patterns Visualization ===\n');
  print('Base delay: 100ms, 5 retry attempts\n');

  final strategies = {
    'No Jitter': (int retry) => noJitter(retry),
    'Full Jitter': (int retry) => fullJitter(retry, random: Random(42)),
    'Equal Jitter': (int retry) => equalJitter(retry, random: Random(42)),
  };

  // Show delays for each strategy
  for (var entry in strategies.entries) {
    print('${entry.key}:');
    var totalDelay = 0;
    for (var i = 0; i < 5; i++) {
      final delay = entry.value(i);
      totalDelay += delay.inMilliseconds;
      final bar = '█' * (delay.inMilliseconds ~/ 50);
      print(
        '  Retry $i: ${delay.inMilliseconds.toString().padLeft(4)}ms $bar',
      );
    }
    print('  Total wait time: ${totalDelay}ms\n');
  }

  // Decorrelated jitter (stateful)
  print('Decorrelated Jitter:');
  final decorrelated = DecorrelatedJitter(random: Random(42));
  var totalDelay = 0;
  for (var i = 0; i < 5; i++) {
    final delay = decorrelated.next(i);
    totalDelay += delay.inMilliseconds;
    final bar = '█' * (delay.inMilliseconds ~/ 50);
    print('  Retry $i: ${delay.inMilliseconds.toString().padLeft(4)}ms $bar');
  }
  print('  Total wait time: ${totalDelay}ms\n');
}

// Statistical comparison
void statisticalComparison() {
  print('=== Statistical Comparison (1000 simulations) ===\n');

  const simulations = 1000;
  const retries = 5;

  final strategies = {
    'No Jitter': (int retry, Random rnd) => noJitter(retry).inMilliseconds,
    'Full Jitter': (int retry, Random rnd) =>
        fullJitter(retry, random: rnd).inMilliseconds,
    'Equal Jitter': (int retry, Random rnd) =>
        equalJitter(retry, random: rnd).inMilliseconds,
  };

  for (var entry in strategies.entries) {
    final delays = <int>[];

    for (var sim = 0; sim < simulations; sim++) {
      final rnd = Random(sim);
      var totalDelay = 0;

      for (var retry = 0; retry < retries; retry++) {
        totalDelay += entry.value(retry, rnd);
      }

      delays.add(totalDelay);
    }

    delays.sort();
    final min = delays.first;
    final max = delays.last;
    final avg = delays.reduce((a, b) => a + b) / delays.length;
    final median = delays[delays.length ~/ 2];

    print('${entry.key}:');
    print('  Min:    ${min}ms');
    print('  Max:    ${max}ms');
    print('  Avg:    ${avg.toStringAsFixed(1)}ms');
    print('  Median: ${median}ms\n');
  }
}

// Collision avoidance comparison
// Shows how jitter helps avoid "thundering herd" problem
void collisionAvoidanceDemo() {
  print('=== Collision Avoidance Demo ===\n');
  print('10 clients all failing at the same time:\n');

  const clients = 10;
  const retryAttempt = 2; // 3rd attempt (0-indexed)

  print('No Jitter (all retry at same time):');
  for (var i = 0; i < clients; i++) {
    final delay = noJitter(retryAttempt);
    print('  Client $i: ${delay.inMilliseconds}ms');
  }
  print('  Result: All 10 clients hit server simultaneously!\n');

  print('Full Jitter (spread out retries):');
  final rnd = Random(42);
  for (var i = 0; i < clients; i++) {
    final delay = fullJitter(retryAttempt, random: rnd);
    print('  Client $i: ${delay.inMilliseconds}ms');
  }
  print('  Result: Retries spread over time, reducing server load\n');
}

// Performance characteristics
void performanceCharacteristics() {
  print('=== Performance Characteristics ===\n');

  print('Strategy Comparison:\n');

  print('1. No Jitter (Pure Exponential Backoff)');
  print('   Pros:');
  print('   - Predictable delays');
  print('   - Simple to implement');
  print('   Cons:');
  print('   - Thundering herd problem');
  print('   - All clients retry simultaneously');
  print('   - Can overwhelm recovering servers\n');

  print('2. Full Jitter');
  print('   Pros:');
  print('   - Best for avoiding thundering herd');
  print('   - Good distribution of retry times');
  print('   - AWS recommendation');
  print('   Cons:');
  print('   - Can have very short delays (near 0)');
  print('   - Higher variance\n');

  print('3. Equal Jitter');
  print('   Pros:');
  print('   - Balance between predictability and randomness');
  print('   - Guaranteed minimum delay (50% of exponential)');
  print('   Cons:');
  print('   - Still has some collision potential');
  print('   - More complex than full jitter\n');

  print('4. Decorrelated Jitter');
  print('   Pros:');
  print('   - Best balance (AWS recommendation)');
  print('   - Each retry independent of attempt number');
  print('   - Good distribution');
  print('   Cons:');
  print('   - Stateful (tracks previous delay)');
  print('   - Slightly more complex\n');
}

// Real-world example
Future<void> realWorldExample() async {
  print('=== Real-World Example ===\n');
  print('Simulating API rate limit scenario\n');

  var requestCount = 0;
  final startTime = DateTime.now();

  Future<String> apiCall() async {
    requestCount++;
    final elapsed = DateTime.now().difference(startTime).inMilliseconds;
    print('Request $requestCount at ${elapsed}ms');

    if (requestCount < 4) {
      throw HttpException('429 Rate Limit Exceeded');
    }
    return 'Success';
  }

  try {
    final result = await retryWithStrategy(
      apiCall,
      (retry) => fullJitter(retry, baseMs: 200),
      strategyName: 'Full Jitter',
      maxAttempts: 5,
    );

    final totalTime = DateTime.now().difference(startTime).inMilliseconds;
    print('\nResult: $result');
    print('Total time: ${totalTime}ms');
    print('Total requests: $requestCount');
  } catch (e) {
    print('Failed: $e');
  }
}
