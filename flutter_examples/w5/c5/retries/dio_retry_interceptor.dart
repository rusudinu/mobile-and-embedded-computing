// Dio retry interceptor - write an interceptor to retry selected failures
// Add to pubspec.yaml:
//   dependencies:
//     dio: ^5.4.0

import 'package:dio/dio.dart';
import 'dart:math';

void main() async {
  print('=== Dio Retry Interceptor Examples ===\n');

  await basicDioRetryExample();
  await advancedDioRetryExample();
  await retryWithDifferentStrategiesExample();
}

// Simple retry interceptor
class SimpleRetryInterceptor extends Interceptor {
  final int maxRetries;
  final Duration retryDelay;

  SimpleRetryInterceptor({
    this.maxRetries = 3,
    this.retryDelay = const Duration(milliseconds: 500),
  });

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final extra = err.requestOptions.extra;
    final retryCount = extra['retryCount'] as int? ?? 0;

    if (retryCount < maxRetries && _shouldRetry(err)) {
      print('Retry attempt ${retryCount + 1}/$maxRetries');

      // Update retry count
      err.requestOptions.extra['retryCount'] = retryCount + 1;

      // Wait before retrying
      await Future.delayed(retryDelay);

      // Retry the request
      try {
        final options = Options(
          method: err.requestOptions.method,
          headers: err.requestOptions.headers,
        );

        final response = await Dio().request(
          err.requestOptions.path,
          data: err.requestOptions.data,
          queryParameters: err.requestOptions.queryParameters,
          options: options,
        );

        handler.resolve(response);
      } catch (e) {
        if (e is DioException) {
          handler.reject(e);
        } else {
          handler.reject(
            DioException(
              requestOptions: err.requestOptions,
              error: e,
            ),
          );
        }
      }
    } else {
      handler.next(err);
    }
  }

  bool _shouldRetry(DioException err) {
    // Retry on network errors
    if (err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.sendTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        err.type == DioExceptionType.connectionError) {
      return true;
    }

    // Retry on 5xx server errors
    if (err.response?.statusCode != null) {
      final statusCode = err.response!.statusCode!;
      return statusCode >= 500 || statusCode == 429;
    }

    return false;
  }
}

// Advanced retry interceptor with exponential backoff and jitter
class AdvancedRetryInterceptor extends Interceptor {
  final int maxRetries;
  final Duration baseDelay;
  final Duration maxDelay;
  final bool useJitter;
  final Random _random = Random();

  AdvancedRetryInterceptor({
    this.maxRetries = 3,
    this.baseDelay = const Duration(milliseconds: 100),
    this.maxDelay = const Duration(seconds: 30),
    this.useJitter = true,
  });

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final extra = err.requestOptions.extra;
    final retryCount = extra['retryCount'] as int? ?? 0;

    if (retryCount < maxRetries && _shouldRetry(err)) {
      final delay = _calculateDelay(retryCount);

      print(
        'Retry attempt ${retryCount + 1}/$maxRetries '
        'after ${delay.inMilliseconds}ms (${_getErrorType(err)})',
      );

      // Update retry count
      err.requestOptions.extra['retryCount'] = retryCount + 1;

      // Wait before retrying
      await Future.delayed(delay);

      // Create a new Dio instance to avoid interceptor loops
      final dio = Dio(BaseOptions(
        baseUrl: err.requestOptions.baseUrl,
        connectTimeout: err.requestOptions.connectTimeout,
        receiveTimeout: err.requestOptions.receiveTimeout,
        headers: err.requestOptions.headers,
      ));

      try {
        final response = await dio.request(
          err.requestOptions.path,
          data: err.requestOptions.data,
          queryParameters: err.requestOptions.queryParameters,
          options: Options(
            method: err.requestOptions.method,
            headers: err.requestOptions.headers,
          ),
        );

        handler.resolve(response);
      } catch (e) {
        if (e is DioException) {
          // Pass retry count to next error
          e.requestOptions.extra['retryCount'] = retryCount + 1;
          handler.reject(e);
        } else {
          handler.reject(
            DioException(
              requestOptions: err.requestOptions,
              error: e,
            ),
          );
        }
      }
    } else {
      if (retryCount >= maxRetries) {
        print('Max retries ($maxRetries) reached');
      }
      handler.next(err);
    }
  }

  bool _shouldRetry(DioException err) {
    // Network errors
    if (err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.sendTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        err.type == DioExceptionType.connectionError) {
      return true;
    }

    // HTTP status codes
    if (err.response?.statusCode != null) {
      final statusCode = err.response!.statusCode!;

      // 5xx server errors
      if (statusCode >= 500) return true;

      // 429 rate limit
      if (statusCode == 429) return true;

      // Don't retry 4xx client errors (except 429)
      if (statusCode >= 400 && statusCode < 500) return false;
    }

    return false;
  }

  Duration _calculateDelay(int retryCount) {
    // Exponential backoff: baseDelay * 2^retryCount
    final exponentialDelay = baseDelay.inMilliseconds * (1 << retryCount);

    // Apply cap
    final cappedDelay = exponentialDelay.clamp(
      baseDelay.inMilliseconds,
      maxDelay.inMilliseconds,
    );

    if (useJitter) {
      // Full jitter: random between 0 and cappedDelay
      final jitteredMs = _random.nextInt(cappedDelay + 1);
      return Duration(milliseconds: jitteredMs);
    }

    return Duration(milliseconds: cappedDelay);
  }

  String _getErrorType(DioException err) {
    if (err.response?.statusCode != null) {
      return 'HTTP ${err.response!.statusCode}';
    }
    return err.type.toString();
  }
}

// Retry interceptor with custom conditions
class CustomRetryInterceptor extends Interceptor {
  final int maxRetries;
  final Duration Function(int retryCount) delayStrategy;
  final bool Function(DioException error) shouldRetry;

  CustomRetryInterceptor({
    required this.maxRetries,
    required this.delayStrategy,
    required this.shouldRetry,
  });

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    final extra = err.requestOptions.extra;
    final retryCount = extra['retryCount'] as int? ?? 0;

    if (retryCount < maxRetries && shouldRetry(err)) {
      final delay = delayStrategy(retryCount);

      print('Custom retry ${retryCount + 1}: waiting ${delay.inMilliseconds}ms');

      err.requestOptions.extra['retryCount'] = retryCount + 1;

      await Future.delayed(delay);

      try {
        final dio = Dio(BaseOptions(
          baseUrl: err.requestOptions.baseUrl,
        ));

        final response = await dio.request(
          err.requestOptions.path,
          data: err.requestOptions.data,
          queryParameters: err.requestOptions.queryParameters,
          options: Options(method: err.requestOptions.method),
        );

        handler.resolve(response);
      } catch (e) {
        if (e is DioException) {
          e.requestOptions.extra['retryCount'] = retryCount + 1;
          handler.reject(e);
        }
      }
    } else {
      handler.next(err);
    }
  }
}

// Examples

Future<void> basicDioRetryExample() async {
  print('--- Basic Dio Retry ---');

  final dio = Dio(BaseOptions(
    baseUrl: 'https://jsonplaceholder.typicode.com',
    connectTimeout: Duration(seconds: 5),
  ));

  // Add simple retry interceptor
  dio.interceptors.add(SimpleRetryInterceptor(
    maxRetries: 3,
    retryDelay: Duration(milliseconds: 500),
  ));

  try {
    final response = await dio.get('/posts/1');
    print('Success! Status: ${response.statusCode}');
    print('Data: ${response.data['title']}\n');
  } on DioException catch (e) {
    print('Failed: ${e.message}\n');
  }
}

Future<void> advancedDioRetryExample() async {
  print('--- Advanced Dio Retry with Exponential Backoff ---');

  final dio = Dio(BaseOptions(
    baseUrl: 'https://jsonplaceholder.typicode.com',
    connectTimeout: Duration(seconds: 5),
  ));

  // Add advanced retry interceptor
  dio.interceptors.add(AdvancedRetryInterceptor(
    maxRetries: 4,
    baseDelay: Duration(milliseconds: 100),
    maxDelay: Duration(seconds: 10),
    useJitter: true,
  ));

  // Add logging to see retries
  dio.interceptors.add(LogInterceptor(
    requestBody: false,
    responseBody: false,
    logPrint: (msg) => print('  [Log] $msg'),
  ));

  try {
    final response = await dio.get('/posts/1');
    print('Success! Status: ${response.statusCode}\n');
  } on DioException catch (e) {
    print('Failed: ${e.message}\n');
  }
}

Future<void> retryWithDifferentStrategiesExample() async {
  print('--- Different Retry Strategies ---');

  // Strategy 1: Linear backoff
  print('Strategy 1: Linear Backoff');
  final dio1 = Dio(BaseOptions(
    baseUrl: 'https://jsonplaceholder.typicode.com',
  ));

  dio1.interceptors.add(CustomRetryInterceptor(
    maxRetries: 3,
    delayStrategy: (retryCount) {
      // Linear: 200ms, 400ms, 600ms
      return Duration(milliseconds: 200 * (retryCount + 1));
    },
    shouldRetry: (err) =>
        err.type == DioExceptionType.connectionTimeout ||
        (err.response?.statusCode ?? 0) >= 500,
  ));

  try {
    await dio1.get('/posts/1');
    print('Linear backoff succeeded\n');
  } catch (e) {
    print('Linear backoff failed\n');
  }

  // Strategy 2: Decorrelated jitter
  print('Strategy 2: Decorrelated Jitter');
  final dio2 = Dio(BaseOptions(
    baseUrl: 'https://jsonplaceholder.typicode.com',
  ));

  var previousDelay = 100;
  dio2.interceptors.add(CustomRetryInterceptor(
    maxRetries: 3,
    delayStrategy: (retryCount) {
      // Decorrelated: random between base and 3x previous
      final random = Random();
      final maxJitter = previousDelay * 3;
      final delayMs = 100 + random.nextInt(maxJitter - 100 + 1);
      previousDelay = delayMs;
      return Duration(milliseconds: delayMs);
    },
    shouldRetry: (err) => true,
  ));

  try {
    await dio2.get('/posts/1');
    print('Decorrelated jitter succeeded\n');
  } catch (e) {
    print('Decorrelated jitter failed\n');
  }

  // Strategy 3: Only retry on specific status codes
  print('Strategy 3: Specific Status Codes Only');
  final dio3 = Dio(BaseOptions(
    baseUrl: 'https://jsonplaceholder.typicode.com',
  ));

  dio3.interceptors.add(CustomRetryInterceptor(
    maxRetries: 2,
    delayStrategy: (retryCount) => Duration(seconds: 1),
    shouldRetry: (err) {
      // Only retry on 503 and 504
      final statusCode = err.response?.statusCode;
      if (statusCode == 503 || statusCode == 504) {
        print('Retrying ${statusCode} error');
        return true;
      }
      print('Not retrying ${statusCode ?? "unknown"} error');
      return false;
    },
  ));

  try {
    await dio3.get('/posts/1');
    print('Specific status code retry succeeded\n');
  } catch (e) {
    print('Specific status code retry failed\n');
  }
}

// Simulate failures for testing
class _SimulatedFailureInterceptor extends Interceptor {
  int _attemptCount = 0;
  final int _failUntil;

  _SimulatedFailureInterceptor({int failUntil = 2}) : _failUntil = failUntil;

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    _attemptCount++;
    print('Simulated attempt $_attemptCount');

    if (_attemptCount <= _failUntil) {
      handler.reject(
        DioException(
          requestOptions: options,
          type: DioExceptionType.connectionTimeout,
          message: 'Simulated connection timeout',
        ),
      );
    } else {
      handler.next(options);
    }
  }
}

Future<void> simulatedFailureTest() async {
  print('--- Simulated Failure Test ---');

  final dio = Dio(BaseOptions(
    baseUrl: 'https://jsonplaceholder.typicode.com',
  ));

  // Add simulated failure interceptor first
  dio.interceptors.add(_SimulatedFailureInterceptor(failUntil: 2));

  // Then add retry interceptor
  dio.interceptors.add(AdvancedRetryInterceptor(
    maxRetries: 3,
    baseDelay: Duration(milliseconds: 100),
    useJitter: false,
  ));

  try {
    final response = await dio.get('/posts/1');
    print('Success after simulated failures! Status: ${response.statusCode}\n');
  } on DioException catch (e) {
    print('Failed: ${e.message}\n');
  }
}
