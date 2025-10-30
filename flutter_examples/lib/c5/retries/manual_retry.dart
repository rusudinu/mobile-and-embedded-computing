// Manual retry implementation with error classification and jitter strategies
// No additional dependencies needed

import 'dart:async';
import 'dart:math';
import 'dart:io';

void main() async {
  print('=== Manual Retry Examples ===\n');

  await basicRetryExample();
  await retryWithErrorClassificationExample();
  await retryWithDecorrelatedJitterExample();
  await retryWithExponentialBackoffExample();
  await retryWithFullJitterExample();
}

// Basic retry with decorrelated jitter (from slides)
Future<T> retry<T>(
  Future<T> Function() fn, {
  int max = 4,
  Duration base = const Duration(milliseconds: 400),
}) async {
  final rnd = Random();
  var delay = base;
  for (var attempt = 0;; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt >= max) rethrow;
      await Future.delayed(Duration(
        milliseconds: rnd.nextInt(delay.inMilliseconds + 1),
      ));
      delay = delay * 2; // cap in real code
    }
  }
}

// Enhanced retry with error classification
class RetryableException implements Exception {
  final String message;
  RetryableException(this.message);
  @override
  String toString() => 'RetryableException: $message';
}

class NonRetryableException implements Exception {
  final String message;
  NonRetryableException(this.message);
  @override
  String toString() => 'NonRetryableException: $message';
}

// Classify HTTP errors
bool isRetryable(dynamic error) {
  // Network errors - retryable
  if (error is SocketException) return true;
  if (error is TimeoutException) return true;

  // HTTP status codes
  if (error is HttpException) {
    final message = error.message.toLowerCase();
    // 5xx server errors - retryable
    if (message.contains('500') ||
        message.contains('502') ||
        message.contains('503') ||
        message.contains('504')) {
      return true;
    }
    // 429 rate limit - retryable
    if (message.contains('429')) return true;

    // 4xx client errors (except 429) - not retryable
    if (message.contains('400') ||
        message.contains('401') ||
        message.contains('403') ||
        message.contains('404')) {
      return false;
    }
  }

  // Custom exceptions
  if (error is RetryableException) return true;
  if (error is NonRetryableException) return false;

  // Unknown errors - don't retry by default
  return false;
}

// Advanced retry with error classification
Future<T> retryWithClassification<T>(
  Future<T> Function() fn, {
  int maxAttempts = 4,
  Duration baseDelay = const Duration(milliseconds: 400),
  Duration maxDelay = const Duration(seconds: 30),
  bool Function(dynamic error)? shouldRetry,
}) async {
  final rnd = Random();
  var delay = baseDelay;

  for (var attempt = 0;; attempt++) {
    try {
      return await fn();
    } catch (e) {
      // Check if we've exhausted retries
      if (attempt >= maxAttempts) {
        print('Max attempts ($maxAttempts) reached. Failing.');
        rethrow;
      }

      // Check if error is retryable
      final retryable = shouldRetry?.call(e) ?? isRetryable(e);
      if (!retryable) {
        print('Non-retryable error: $e');
        rethrow;
      }

      // Calculate delay with decorrelated jitter
      final jitteredDelay = Duration(
        milliseconds: rnd.nextInt(delay.inMilliseconds + 1),
      );

      print(
        'Attempt ${attempt + 1} failed: $e. '
        'Retrying in ${jitteredDelay.inMilliseconds}ms...',
      );

      await Future.delayed(jitteredDelay);

      // Exponential backoff with cap
      delay = Duration(
        milliseconds: min(
          delay.inMilliseconds * 2,
          maxDelay.inMilliseconds,
        ),
      );
    }
  }
}

// Decorrelated jitter (AWS recommendation)
// Each retry picks a random delay between base and 3x previous delay
Future<T> retryWithDecorrelatedJitter<T>(
  Future<T> Function() fn, {
  int maxAttempts = 4,
  Duration baseDelay = const Duration(milliseconds: 100),
  Duration maxDelay = const Duration(seconds: 20),
}) async {
  final rnd = Random();
  var previousDelay = baseDelay;

  for (var attempt = 0;; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt >= maxAttempts || !isRetryable(e)) rethrow;

      // Decorrelated jitter: random between base and 3x previous
      final maxJitter = min(
        maxDelay.inMilliseconds,
        previousDelay.inMilliseconds * 3,
      );
      final delayMs = baseDelay.inMilliseconds +
          rnd.nextInt(maxJitter - baseDelay.inMilliseconds + 1);

      previousDelay = Duration(milliseconds: delayMs);

      print(
        'Decorrelated jitter retry ${attempt + 1}: '
        'waiting ${delayMs}ms',
      );

      await Future.delayed(previousDelay);
    }
  }
}

// Exponential backoff (no jitter)
Future<T> retryWithExponentialBackoff<T>(
  Future<T> Function() fn, {
  int maxAttempts = 4,
  Duration baseDelay = const Duration(milliseconds: 100),
  Duration maxDelay = const Duration(seconds: 30),
  double multiplier = 2.0,
}) async {
  var delay = baseDelay;

  for (var attempt = 0;; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt >= maxAttempts || !isRetryable(e)) rethrow;

      print(
        'Exponential backoff retry ${attempt + 1}: '
        'waiting ${delay.inMilliseconds}ms',
      );

      await Future.delayed(delay);

      // Exponential backoff with cap
      delay = Duration(
        milliseconds: min(
          (delay.inMilliseconds * multiplier).toInt(),
          maxDelay.inMilliseconds,
        ),
      );
    }
  }
}

// Full jitter (AWS recommendation)
// Random delay between 0 and exponential backoff
Future<T> retryWithFullJitter<T>(
  Future<T> Function() fn, {
  int maxAttempts = 4,
  Duration baseDelay = const Duration(milliseconds: 100),
  Duration maxDelay = const Duration(seconds: 30),
}) async {
  final rnd = Random();
  var delay = baseDelay;

  for (var attempt = 0;; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt >= maxAttempts || !isRetryable(e)) rethrow;

      // Full jitter: random between 0 and current delay
      final jitteredDelay = Duration(
        milliseconds: rnd.nextInt(delay.inMilliseconds + 1),
      );

      print(
        'Full jitter retry ${attempt + 1}: '
        'waiting ${jitteredDelay.inMilliseconds}ms',
      );

      await Future.delayed(jitteredDelay);

      // Exponential backoff with cap
      delay = Duration(
        milliseconds: min(
          delay.inMilliseconds * 2,
          maxDelay.inMilliseconds,
        ),
      );
    }
  }
}

// Examples
Future<void> basicRetryExample() async {
  print('--- Basic Retry ---');
  var attempts = 0;

  try {
    final result = await retry(() async {
      attempts++;
      print('Attempt $attempts');
      if (attempts < 3) {
        throw SocketException('Connection failed');
      }
      return 'Success!';
    });
    print('Result: $result\n');
  } catch (e) {
    print('Failed: $e\n');
  }
}

Future<void> retryWithErrorClassificationExample() async {
  print('--- Retry with Error Classification ---');

  // Retryable error (5xx)
  print('Testing retryable error (5xx):');
  var attempts = 0;
  try {
    await retryWithClassification(() async {
      attempts++;
      if (attempts < 3) {
        throw HttpException('503 Service Unavailable');
      }
      return 'Success';
    }, maxAttempts: 3, baseDelay: Duration(milliseconds: 100));
    print('Succeeded after retries\n');
  } catch (e) {
    print('Failed: $e\n');
  }

  // Non-retryable error (4xx)
  print('Testing non-retryable error (404):');
  attempts = 0;
  try {
    await retryWithClassification(() async {
      attempts++;
      throw HttpException('404 Not Found');
    }, maxAttempts: 3);
    print('Success\n');
  } catch (e) {
    print('Failed immediately (attempts: $attempts): $e\n');
  }

  // Timeout (retryable)
  print('Testing timeout (retryable):');
  attempts = 0;
  try {
    await retryWithClassification(() async {
      attempts++;
      if (attempts < 2) {
        throw TimeoutException('Request timeout');
      }
      return 'Success';
    }, maxAttempts: 3, baseDelay: Duration(milliseconds: 50));
    print('Succeeded after retry\n');
  } catch (e) {
    print('Failed: $e\n');
  }
}

Future<void> retryWithDecorrelatedJitterExample() async {
  print('--- Decorrelated Jitter ---');
  var attempts = 0;

  try {
    await retryWithDecorrelatedJitter(() async {
      attempts++;
      if (attempts < 3) {
        throw SocketException('Connection failed');
      }
      return 'Success';
    }, baseDelay: Duration(milliseconds: 100));
    print('Succeeded\n');
  } catch (e) {
    print('Failed: $e\n');
  }
}

Future<void> retryWithExponentialBackoffExample() async {
  print('--- Exponential Backoff (no jitter) ---');
  var attempts = 0;

  try {
    await retryWithExponentialBackoff(() async {
      attempts++;
      if (attempts < 3) {
        throw SocketException('Connection failed');
      }
      return 'Success';
    }, baseDelay: Duration(milliseconds: 100));
    print('Succeeded\n');
  } catch (e) {
    print('Failed: $e\n');
  }
}

Future<void> retryWithFullJitterExample() async {
  print('--- Full Jitter ---');
  var attempts = 0;

  try {
    await retryWithFullJitter(() async {
      attempts++;
      if (attempts < 3) {
        throw SocketException('Connection failed');
      }
      return 'Success';
    }, baseDelay: Duration(milliseconds: 100));
    print('Succeeded\n');
  } catch (e) {
    print('Failed: $e\n');
  }
}
