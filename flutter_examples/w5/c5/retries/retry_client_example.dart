// RetryClient from package:http - library-based retry implementation
// Add to pubspec.yaml:
//   dependencies:
//     http: ^1.1.0

import 'package:http/http.dart' as http;
import 'package:http/retry.dart';

void main() async {
  print('=== RetryClient Examples ===\n');

  await basicRetryClientExample();
  await customRetryConditionsExample();
  await retryWithDelayExample();
  await retryOnSpecificErrorsExample();
}

// Basic RetryClient usage
Future<void> basicRetryClientExample() async {
  print('--- Basic RetryClient ---');

  final base = http.Client();
  // RetryClient wraps an underlying client and retries for you
  final client = RetryClient(base);

  try {
    final response = await client.get(
      Uri.parse('https://jsonplaceholder.typicode.com/posts/1'),
    );

    print('Status: ${response.statusCode}');
    print('Body length: ${response.body.length} bytes');
  } catch (e) {
    print('Error: $e');
  } finally {
    client.close();
  }

  print('');
}

// Custom retry conditions
Future<void> customRetryConditionsExample() async {
  print('--- Custom Retry Conditions ---');

  final base = http.Client();

  // Customize when to retry based on response
  final client = RetryClient(
    base,
    retries: 3,
    when: (response) {
      // Retry on 5xx server errors
      if (response.statusCode >= 500) {
        print('Got ${response.statusCode}, retrying...');
        return true;
      }
      // Retry on 429 rate limit
      if (response.statusCode == 429) {
        print('Rate limited (429), retrying...');
        return true;
      }
      // Don't retry on other status codes
      return false;
    },
    whenError: (error, stackTrace) {
      // Retry on any error (network issues, timeouts, etc.)
      print('Got error: $error, retrying...');
      return true;
    },
  );

  try {
    // Simulate a request to a URL that might fail
    final response = await client.get(
      Uri.parse('https://jsonplaceholder.typicode.com/posts/1'),
    );

    print('Success! Status: ${response.statusCode}');
  } catch (e) {
    print('Failed after retries: $e');
  } finally {
    client.close();
  }

  print('');
}

// Custom delay between retries
Future<void> retryWithDelayExample() async {
  print('--- Custom Delay Strategy ---');

  final base = http.Client();

  // Custom exponential backoff
  final client = RetryClient(
    base,
    retries: 4,
    delay: (retryCount) {
      // Exponential backoff: 100ms, 200ms, 400ms, 800ms
      final delayMs = 100 * (1 << retryCount);
      print('Retry $retryCount: waiting ${delayMs}ms');
      return Duration(milliseconds: delayMs);
    },
    when: (response) => response.statusCode >= 500,
    whenError: (error, stackTrace) => true,
  );

  try {
    final response = await client.get(
      Uri.parse('https://jsonplaceholder.typicode.com/posts/1'),
    );
    print('Success! Status: ${response.statusCode}');
  } catch (e) {
    print('Failed: $e');
  } finally {
    client.close();
  }

  print('');
}

// Retry only on specific errors
Future<void> retryOnSpecificErrorsExample() async {
  print('--- Retry on Specific Errors ---');

  final base = http.Client();

  final client = RetryClient(
    base,
    retries: 3,
    // Only retry on 503 Service Unavailable
    when: (response) {
      if (response.statusCode == 503) {
        print('Service unavailable (503), retrying...');
        return true;
      }
      if (response.statusCode == 502) {
        print('Bad gateway (502), retrying...');
        return true;
      }
      if (response.statusCode == 504) {
        print('Gateway timeout (504), retrying...');
        return true;
      }
      return false;
    },
    whenError: (error, stackTrace) {
      // Only retry on network errors, not other exceptions
      final errorStr = error.toString().toLowerCase();
      if (errorStr.contains('socket') ||
          errorStr.contains('timeout') ||
          errorStr.contains('connection')) {
        print('Network error, retrying...');
        return true;
      }
      print('Non-network error, not retrying: $error');
      return false;
    },
    delay: (retryCount) {
      // Linear backoff with jitter
      final baseDelay = 200 * (retryCount + 1);
      return Duration(milliseconds: baseDelay);
    },
  );

  try {
    final response = await client.get(
      Uri.parse('https://jsonplaceholder.typicode.com/posts/1'),
    );
    print('Success! Status: ${response.statusCode}');
  } catch (e) {
    print('Failed: $e');
  } finally {
    client.close();
  }

  print('');
}

// Advanced: Retry with timeout and logging
Future<void> advancedRetryExample() async {
  print('--- Advanced Retry with Timeout ---');

  final base = http.Client();

  var totalAttempts = 0;

  final client = RetryClient(
    base,
    retries: 5,
    when: (response) {
      totalAttempts++;
      final shouldRetry = response.statusCode >= 500;
      if (shouldRetry) {
        print(
          'Attempt $totalAttempts: ${response.statusCode} - Retrying',
        );
      } else {
        print(
          'Attempt $totalAttempts: ${response.statusCode} - Not retrying',
        );
      }
      return shouldRetry;
    },
    whenError: (error, stackTrace) {
      totalAttempts++;
      print('Attempt $totalAttempts: Error - $error');
      return true;
    },
    delay: (retryCount) {
      // Exponential backoff with cap at 5 seconds
      final delayMs = (100 * (1 << retryCount)).clamp(100, 5000);
      print('Waiting ${delayMs}ms before retry $retryCount');
      return Duration(milliseconds: delayMs);
    },
  );

  try {
    final response = await client
        .get(
          Uri.parse('https://jsonplaceholder.typicode.com/posts/1'),
        )
        .timeout(
          Duration(seconds: 30),
          onTimeout: () {
            throw Exception('Overall request timeout after 30s');
          },
        );

    print('Success after $totalAttempts attempts!');
    print('Status: ${response.statusCode}');
  } catch (e) {
    print('Failed after $totalAttempts attempts: $e');
  } finally {
    client.close();
  }

  print('');
}

// Example: Combining multiple clients
Future<void> composableClientsExample() async {
  print('--- Composable Clients ---');

  // You can wrap clients in layers
  final base = http.Client();

  // Add retry logic
  final retryClient = RetryClient(
    base,
    retries: 3,
    when: (response) => response.statusCode >= 500,
  );

  // You could add more wrappers here (logging, auth, etc.)

  try {
    final response = await retryClient.get(
      Uri.parse('https://jsonplaceholder.typicode.com/posts/1'),
    );
    print('Success! Status: ${response.statusCode}');
  } finally {
    retryClient.close();
  }

  print('');
}

// Simulate failing requests for testing
class _FailingClient extends http.BaseClient {
  final http.Client _inner;
  int _attemptCount = 0;
  final int _failUntil;

  _FailingClient(this._inner, {int failUntil = 2}) : _failUntil = failUntil;

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) async {
    _attemptCount++;
    print('Simulated attempt $_attemptCount');

    if (_attemptCount <= _failUntil) {
      throw Exception('Simulated network error');
    }

    return _inner.send(request);
  }
}

// Test retry behavior with simulated failures
Future<void> simulatedFailureExample() async {
  print('--- Simulated Failure Test ---');

  final base = http.Client();
  final failingClient = _FailingClient(base, failUntil: 2);

  final retryClient = RetryClient(
    failingClient,
    retries: 3,
    whenError: (error, stackTrace) {
      print('Caught error, will retry: $error');
      return true;
    },
    delay: (retryCount) {
      print('Retry delay: ${retryCount * 100}ms');
      return Duration(milliseconds: retryCount * 100);
    },
  );

  try {
    final response = await retryClient.get(
      Uri.parse('https://jsonplaceholder.typicode.com/posts/1'),
    );
    print('Success! Status: ${response.statusCode}');
  } catch (e) {
    print('Failed: $e');
  } finally {
    retryClient.close();
  }

  print('');
}
