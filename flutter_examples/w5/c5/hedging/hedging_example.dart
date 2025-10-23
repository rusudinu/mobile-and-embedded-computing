// Hedging pattern - fire multiple requests, take the first to complete
// Add to pubspec.yaml:
//   dependencies:
//     dio: ^5.4.0

import 'dart:async';
import 'package:dio/dio.dart';

void main() async {
  print('=== Hedging Pattern Examples ===\n');

  final dio = Dio(BaseOptions(
    baseUrl: 'https://jsonplaceholder.typicode.com',
    connectTimeout: Duration(seconds: 10),
  ));

  await basicHedgingExample(dio);
  await hedgingWithTimingExample(dio);
  await multipleHedgesExample(dio);
  await hedgingVsNormalComparison(dio);
}

// Basic hedging implementation (from slides)
Future<Response> hedgedGet(
  Dio dio,
  String url, {
  Duration delay = const Duration(milliseconds: 120),
}) async {
  final t1 = CancelToken(), t2 = CancelToken();
  final c = Completer<Response>();
  var won = false;

  // Fire original request
  dio.get(url, cancelToken: t1).then((r) {
    if (!won) {
      won = true;
      t2.cancel();
      c.complete(r);
    }
  }).catchError((e) {
    if (!won && e is! DioException) c.completeError(e);
  });

  // Fire hedge after delay
  Future.delayed(delay, () {
    if (won) return;
    dio.get(url, cancelToken: t2).then((r) {
      if (!won) {
        won = true;
        t1.cancel();
        c.complete(r);
      }
    }).catchError((e) {
      if (!won && e is! DioException) c.completeError(e);
    });
  });

  return c.future;
}

// Enhanced hedging with metadata about which request won
class HedgedResponse {
  final Response response;
  final int winnerIndex;
  final Duration elapsed;

  HedgedResponse({
    required this.response,
    required this.winnerIndex,
    required this.elapsed,
  });
}

Future<HedgedResponse> hedgedGetWithMetadata(
  Dio dio,
  String url, {
  Duration delay = const Duration(milliseconds: 120),
}) async {
  final t1 = CancelToken(), t2 = CancelToken();
  final c = Completer<HedgedResponse>();
  var won = false;
  final startTime = DateTime.now();

  // Fire original request
  dio.get(url, cancelToken: t1).then((r) {
    if (!won) {
      won = true;
      t2.cancel();
      final elapsed = DateTime.now().difference(startTime);
      c.complete(HedgedResponse(
        response: r,
        winnerIndex: 1,
        elapsed: elapsed,
      ));
    }
  }).catchError((e) {
    if (!won && e is! DioException) c.completeError(e);
  });

  // Fire hedge after delay
  Future.delayed(delay, () {
    if (won) return;
    print('  Hedge fired at ${delay.inMilliseconds}ms');
    dio.get(url, cancelToken: t2).then((r) {
      if (!won) {
        won = true;
        t1.cancel();
        final elapsed = DateTime.now().difference(startTime);
        c.complete(HedgedResponse(
          response: r,
          winnerIndex: 2,
          elapsed: elapsed,
        ));
      }
    }).catchError((e) {
      if (!won && e is! DioException) c.completeError(e);
    });
  });

  return c.future;
}

// Multiple hedging requests (fire N requests)
Future<HedgedResponse> multiHedgedGet(
  Dio dio,
  String url, {
  List<Duration> delays = const [
    Duration(milliseconds: 100),
    Duration(milliseconds: 200),
    Duration(milliseconds: 300),
  ],
}) async {
  final tokens = List.generate(delays.length + 1, (_) => CancelToken());
  final c = Completer<HedgedResponse>();
  var won = false;
  final startTime = DateTime.now();

  void handleResponse(Response r, int index) {
    if (!won) {
      won = true;
      // Cancel all other requests
      for (var i = 0; i < tokens.length; i++) {
        if (i != index && !tokens[i].isCancelled) {
          tokens[i].cancel();
        }
      }
      final elapsed = DateTime.now().difference(startTime);
      c.complete(HedgedResponse(
        response: r,
        winnerIndex: index + 1,
        elapsed: elapsed,
      ));
    }
  }

  void handleError(dynamic e, int index) {
    if (!won && e is! DioException) {
      c.completeError(e);
    }
  }

  // Fire original request
  print('  Request 1 fired immediately');
  dio.get(url, cancelToken: tokens[0]).then((r) {
    handleResponse(r, 0);
  }).catchError((e) {
    handleError(e, 0);
  });

  // Fire hedged requests after delays
  for (var i = 0; i < delays.length; i++) {
    final index = i;
    final delay = delays[i];

    Future.delayed(delay, () {
      if (won) return;
      print('  Request ${index + 2} fired at ${delay.inMilliseconds}ms');
      dio.get(url, cancelToken: tokens[index + 1]).then((r) {
        handleResponse(r, index + 1);
      }).catchError((e) {
        handleError(e, index + 1);
      });
    });
  }

  return c.future;
}

// Configurable hedging strategy
class HedgingConfig {
  final Duration delay;
  final int maxConcurrentRequests;
  final bool cancelSlowerRequests;

  HedgingConfig({
    this.delay = const Duration(milliseconds: 120),
    this.maxConcurrentRequests = 2,
    this.cancelSlowerRequests = true,
  });
}

Future<Response> hedgedGetConfigurable(
  Dio dio,
  String url, {
  HedgingConfig config = const HedgingConfig(),
}) async {
  final tokens = List.generate(
    config.maxConcurrentRequests,
    (_) => CancelToken(),
  );
  final c = Completer<Response>();
  var won = false;

  void handleResponse(Response r, int index) {
    if (!won) {
      won = true;
      if (config.cancelSlowerRequests) {
        for (var i = 0; i < tokens.length; i++) {
          if (i != index && !tokens[i].isCancelled) {
            tokens[i].cancel();
          }
        }
      }
      c.complete(r);
    }
  }

  // Fire original
  dio.get(url, cancelToken: tokens[0]).then((r) {
    handleResponse(r, 0);
  }).catchError((e) {
    if (!won && e is! DioException) c.completeError(e);
  });

  // Fire additional hedges
  for (var i = 1; i < config.maxConcurrentRequests; i++) {
    final index = i;
    final delay = config.delay * i;

    Future.delayed(delay, () {
      if (won) return;
      dio.get(url, cancelToken: tokens[index]).then((r) {
        handleResponse(r, index);
      }).catchError((e) {
        if (!won && e is! DioException) c.completeError(e);
      });
    });
  }

  return c.future;
}

// Examples

Future<void> basicHedgingExample(Dio dio) async {
  print('--- Basic Hedging ---');

  try {
    final response = await hedgedGet(
      dio,
      '/posts/1',
      delay: Duration(milliseconds: 100),
    );

    print('Success! Status: ${response.statusCode}');
    print('Title: ${response.data['title']}\n');
  } catch (e) {
    print('Error: $e\n');
  }
}

Future<void> hedgingWithTimingExample(Dio dio) async {
  print('--- Hedging with Timing Information ---');

  try {
    final result = await hedgedGetWithMetadata(
      dio,
      '/posts/1',
      delay: Duration(milliseconds: 50),
    );

    print('Success!');
    print('Winner: Request ${result.winnerIndex}');
    print('Elapsed: ${result.elapsed.inMilliseconds}ms');
    print('Status: ${result.response.statusCode}\n');
  } catch (e) {
    print('Error: $e\n');
  }
}

Future<void> multipleHedgesExample(Dio dio) async {
  print('--- Multiple Hedged Requests ---');
  print('Firing up to 4 requests with staggered delays\n');

  try {
    final result = await multiHedgedGet(
      dio,
      '/posts/1',
      delays: [
        Duration(milliseconds: 50),
        Duration(milliseconds: 100),
        Duration(milliseconds: 150),
      ],
    );

    print('\nResult:');
    print('Winner: Request ${result.winnerIndex}');
    print('Total time: ${result.elapsed.inMilliseconds}ms');
    print('Status: ${result.response.statusCode}\n');
  } catch (e) {
    print('Error: $e\n');
  }
}

Future<void> hedgingVsNormalComparison(Dio dio) async {
  print('--- Hedging vs Normal Request Comparison ---');

  // Normal request
  print('Normal request:');
  final normalStart = DateTime.now();
  try {
    final response = await dio.get('/posts/1');
    final normalElapsed = DateTime.now().difference(normalStart);
    print('  Completed in ${normalElapsed.inMilliseconds}ms');
    print('  Status: ${response.statusCode}\n');
  } catch (e) {
    print('  Error: $e\n');
  }

  // Hedged request
  print('Hedged request:');
  final hedgedStart = DateTime.now();
  try {
    final result = await hedgedGetWithMetadata(
      dio,
      '/posts/1',
      delay: Duration(milliseconds: 100),
    );
    final hedgedElapsed = DateTime.now().difference(hedgedStart);
    print('  Completed in ${hedgedElapsed.inMilliseconds}ms');
    print('  Winner: Request ${result.winnerIndex}');
    print('  Status: ${result.response.statusCode}\n');
  } catch (e) {
    print('  Error: $e\n');
  }
}

// Advanced: Hedging with custom strategy
class AdaptiveHedging {
  final List<Duration> _latencies = [];
  Duration _hedgeDelay = Duration(milliseconds: 100);

  // Calculate hedge delay based on P95 latency
  Duration get hedgeDelay => _hedgeDelay;

  void recordLatency(Duration latency) {
    _latencies.add(latency);

    // Keep only recent measurements
    if (_latencies.length > 100) {
      _latencies.removeAt(0);
    }

    // Update hedge delay to P95
    if (_latencies.length >= 10) {
      final sorted = List<Duration>.from(_latencies)
        ..sort((a, b) => a.compareTo(b));
      final p95Index = (sorted.length * 0.95).floor();
      _hedgeDelay = sorted[p95Index];
    }
  }

  Future<Response> hedgedGet(Dio dio, String url) async {
    final startTime = DateTime.now();

    try {
      final response = await hedgedGetConfigurable(
        dio,
        url,
        config: HedgingConfig(delay: _hedgeDelay),
      );

      final elapsed = DateTime.now().difference(startTime);
      recordLatency(elapsed);

      return response;
    } catch (e) {
      rethrow;
    }
  }
}

// Example with error handling
Future<Response> hedgedGetWithErrorHandling(
  Dio dio,
  String url, {
  Duration delay = const Duration(milliseconds: 120),
}) async {
  final t1 = CancelToken(), t2 = CancelToken();
  final c = Completer<Response>();
  var won = false;
  var errorCount = 0;
  dynamic lastError;

  void handleError(dynamic e, CancelToken otherToken) {
    if (won) return;

    errorCount++;
    lastError = e;

    // If both requests failed, complete with error
    if (errorCount >= 2) {
      c.completeError(lastError);
    }
  }

  // Fire original
  dio.get(url, cancelToken: t1).then((r) {
    if (!won) {
      won = true;
      t2.cancel();
      c.complete(r);
    }
  }).catchError((e) {
    if (e is DioException && e.type == DioExceptionType.cancel) return;
    handleError(e, t2);
  });

  // Fire hedge
  Future.delayed(delay, () {
    if (won) return;
    dio.get(url, cancelToken: t2).then((r) {
      if (!won) {
        won = true;
        t1.cancel();
        c.complete(r);
      }
    }).catchError((e) {
      if (e is DioException && e.type == DioExceptionType.cancel) return;
      handleError(e, t1);
    });
  });

  return c.future;
}

// Performance testing
Future<void> performanceTest(Dio dio) async {
  print('--- Performance Test ---');
  print('Running 10 requests to measure effectiveness\n');

  final normalTimes = <int>[];
  final hedgedTimes = <int>[];

  for (var i = 0; i < 10; i++) {
    // Normal request
    final normalStart = DateTime.now();
    await dio.get('/posts/${i + 1}');
    normalTimes.add(DateTime.now().difference(normalStart).inMilliseconds);

    await Future.delayed(Duration(milliseconds: 100));

    // Hedged request
    final hedgedStart = DateTime.now();
    await hedgedGet(dio, '/posts/${i + 1}');
    hedgedTimes.add(DateTime.now().difference(hedgedStart).inMilliseconds);

    await Future.delayed(Duration(milliseconds: 100));
  }

  normalTimes.sort();
  hedgedTimes.sort();

  print('Normal requests:');
  print('  Min: ${normalTimes.first}ms');
  print('  Max: ${normalTimes.last}ms');
  print('  Avg: ${normalTimes.reduce((a, b) => a + b) / normalTimes.length}ms');
  print('  P95: ${normalTimes[(normalTimes.length * 0.95).floor()]}ms\n');

  print('Hedged requests:');
  print('  Min: ${hedgedTimes.first}ms');
  print('  Max: ${hedgedTimes.last}ms');
  print('  Avg: ${hedgedTimes.reduce((a, b) => a + b) / hedgedTimes.length}ms');
  print('  P95: ${hedgedTimes[(hedgedTimes.length * 0.95).floor()]}ms\n');
}
