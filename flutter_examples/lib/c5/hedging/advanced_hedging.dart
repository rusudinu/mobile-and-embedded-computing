// Advanced hedging patterns and strategies
// Add to pubspec.yaml:
//   dependencies:
//     dio: ^5.4.0

import 'dart:async';
import 'dart:math';
import 'package:dio/dio.dart';

void main() async {
  print('=== Advanced Hedging Patterns ===\n');

  final dio = Dio(BaseOptions(
    baseUrl: 'https://jsonplaceholder.typicode.com',
    connectTimeout: Duration(seconds: 10),
  ));

  await adaptiveHedgingExample(dio);
  await loadBalancedHedgingExample(dio);
  await budgetBasedHedgingExample(dio);
}

// Adaptive hedging - adjusts delay based on historical latency
class AdaptiveHedger {
  final List<Duration> _latencies = [];
  final int _historySize;
  final double _percentile;
  Duration _currentDelay;

  AdaptiveHedger({
    Duration initialDelay = const Duration(milliseconds: 100),
    int historySize = 100,
    double percentile = 0.95,
  })  : _currentDelay = initialDelay,
        _historySize = historySize,
        _percentile = percentile;

  Duration get currentDelay => _currentDelay;

  void recordLatency(Duration latency) {
    _latencies.add(latency);

    // Keep only recent measurements
    if (_latencies.length > _historySize) {
      _latencies.removeAt(0);
    }

    // Update delay based on percentile
    if (_latencies.length >= 10) {
      final sorted = List<Duration>.from(_latencies)
        ..sort((a, b) => a.compareTo(b));
      final index = (sorted.length * _percentile).floor();
      _currentDelay = sorted[index];
    }
  }

  Future<HedgedResponse> hedgedGet(Dio dio, String url) async {
    final tokens = [CancelToken(), CancelToken()];
    final c = Completer<HedgedResponse>();
    var won = false;
    final startTime = DateTime.now();

    void handleResponse(Response r, int index) {
      if (!won) {
        won = true;
        // Cancel other request
        tokens[1 - index].cancel();

        final elapsed = DateTime.now().difference(startTime);
        recordLatency(elapsed);

        c.complete(HedgedResponse(
          response: r,
          winnerIndex: index + 1,
          elapsed: elapsed,
        ));
      }
    }

    // Original request
    dio.get(url, cancelToken: tokens[0]).then((r) {
      handleResponse(r, 0);
    }).catchError((e) {
      if (!won && e is! DioException) c.completeError(e);
    });

    // Hedged request with adaptive delay
    Future.delayed(_currentDelay, () {
      if (won) return;
      print('  Adaptive hedge fired at ${_currentDelay.inMilliseconds}ms');
      dio.get(url, cancelToken: tokens[1]).then((r) {
        handleResponse(r, 1);
      }).catchError((e) {
        if (!won && e is! DioException) c.completeError(e);
      });
    });

    return c.future;
  }

  Map<String, dynamic> getStats() {
    if (_latencies.isEmpty) {
      return {'samples': 0};
    }

    final sorted = List<Duration>.from(_latencies)
      ..sort((a, b) => a.compareTo(b));

    return {
      'samples': _latencies.length,
      'min_ms': sorted.first.inMilliseconds,
      'max_ms': sorted.last.inMilliseconds,
      'avg_ms': _latencies
              .map((d) => d.inMilliseconds)
              .reduce((a, b) => a + b) ~/
          _latencies.length,
      'p50_ms': sorted[sorted.length ~/ 2].inMilliseconds,
      'p95_ms': sorted[(sorted.length * 0.95).floor()].inMilliseconds,
      'current_delay_ms': _currentDelay.inMilliseconds,
    };
  }
}

class HedgedResponse {
  final Response response;
  final int winnerIndex;
  final Duration elapsed;
  final bool hedgeFired;

  HedgedResponse({
    required this.response,
    required this.winnerIndex,
    required this.elapsed,
    this.hedgeFired = false,
  });
}

// Load-balanced hedging - distribute across multiple backends
class LoadBalancedHedger {
  final List<String> _baseUrls;
  int _currentIndex = 0;

  LoadBalancedHedger(this._baseUrls);

  String _nextUrl() {
    final url = _baseUrls[_currentIndex];
    _currentIndex = (_currentIndex + 1) % _baseUrls.length;
    return url;
  }

  Future<HedgedResponse> hedgedGet(
    Dio dio,
    String path, {
    Duration delay = const Duration(milliseconds: 100),
  }) async {
    final url1 = _nextUrl();
    final url2 = _nextUrl();

    print('  Request 1: $url1$path');
    print('  Request 2 (hedge): $url2$path');

    final tokens = [CancelToken(), CancelToken()];
    final c = Completer<HedgedResponse>();
    var won = false;
    final startTime = DateTime.now();

    void handleResponse(Response r, int index) {
      if (!won) {
        won = true;
        tokens[1 - index].cancel();

        c.complete(HedgedResponse(
          response: r,
          winnerIndex: index + 1,
          elapsed: DateTime.now().difference(startTime),
        ));
      }
    }

    // Request to first backend
    dio
        .get('$url1$path', cancelToken: tokens[0])
        .then((r) => handleResponse(r, 0))
        .catchError((e) {
      if (!won && e is! DioException) c.completeError(e);
    });

    // Request to second backend after delay
    Future.delayed(delay, () {
      if (won) return;
      dio
          .get('$url2$path', cancelToken: tokens[1])
          .then((r) => handleResponse(r, 1))
          .catchError((e) {
        if (!won && e is! DioException) c.completeError(e);
      });
    });

    return c.future;
  }
}

// Budget-based hedging - only hedge if under budget
class BudgetBasedHedger {
  final int _maxHedgesPerSecond;
  final List<DateTime> _hedgeTimes = [];
  int _totalHedges = 0;
  int _hedgesFired = 0;

  BudgetBasedHedger({int maxHedgesPerSecond = 10})
      : _maxHedgesPerSecond = maxHedgesPerSecond;

  bool _canHedge() {
    final now = DateTime.now();
    final oneSecondAgo = now.subtract(Duration(seconds: 1));

    // Remove old hedge times
    _hedgeTimes.removeWhere((time) => time.isBefore(oneSecondAgo));

    return _hedgeTimes.length < _maxHedgesPerSecond;
  }

  void _recordHedge() {
    _hedgeTimes.add(DateTime.now());
    _hedgesFired++;
  }

  Future<HedgedResponse> hedgedGet(
    Dio dio,
    String url, {
    Duration delay = const Duration(milliseconds: 100),
  }) async {
    _totalHedges++;

    final tokens = [CancelToken(), CancelToken()];
    final c = Completer<HedgedResponse>();
    var won = false;
    var hedgeFired = false;
    final startTime = DateTime.now();

    void handleResponse(Response r, int index) {
      if (!won) {
        won = true;
        tokens[1 - index].cancel();

        c.complete(HedgedResponse(
          response: r,
          winnerIndex: index + 1,
          elapsed: DateTime.now().difference(startTime),
          hedgeFired: hedgeFired,
        ));
      }
    }

    // Original request
    dio
        .get(url, cancelToken: tokens[0])
        .then((r) => handleResponse(r, 0))
        .catchError((e) {
      if (!won && e is! DioException) c.completeError(e);
    });

    // Conditional hedge based on budget
    Future.delayed(delay, () {
      if (won) return;

      if (_canHedge()) {
        hedgeFired = true;
        _recordHedge();
        print('  Hedge fired (within budget)');

        dio
            .get(url, cancelToken: tokens[1])
            .then((r) => handleResponse(r, 1))
            .catchError((e) {
          if (!won && e is! DioException) c.completeError(e);
        });
      } else {
        print('  Hedge skipped (budget exceeded)');
      }
    });

    return c.future;
  }

  Map<String, dynamic> getStats() {
    return {
      'total_requests': _totalHedges,
      'hedges_fired': _hedgesFired,
      'hedge_rate': _totalHedges > 0 ? _hedgesFired / _totalHedges : 0.0,
      'current_rate_per_sec': _hedgeTimes.length,
      'max_rate_per_sec': _maxHedgesPerSecond,
    };
  }
}

// Probabilistic hedging - hedge with probability based on load
class ProbabilisticHedger {
  final Random _random = Random();
  double _hedgeProbability;

  ProbabilisticHedger({double initialProbability = 0.5})
      : _hedgeProbability = initialProbability;

  void adjustProbability(double serverLoad) {
    // Higher load = lower hedge probability to reduce server burden
    _hedgeProbability = 1.0 - serverLoad;
  }

  Future<HedgedResponse> hedgedGet(
    Dio dio,
    String url, {
    Duration delay = const Duration(milliseconds: 100),
  }) async {
    final shouldHedge = _random.nextDouble() < _hedgeProbability;

    final tokens = [CancelToken(), CancelToken()];
    final c = Completer<HedgedResponse>();
    var won = false;
    final startTime = DateTime.now();

    void handleResponse(Response r, int index) {
      if (!won) {
        won = true;
        tokens[1 - index].cancel();

        c.complete(HedgedResponse(
          response: r,
          winnerIndex: index + 1,
          elapsed: DateTime.now().difference(startTime),
          hedgeFired: shouldHedge,
        ));
      }
    }

    // Original request
    dio
        .get(url, cancelToken: tokens[0])
        .then((r) => handleResponse(r, 0))
        .catchError((e) {
      if (!won && e is! DioException) c.completeError(e);
    });

    // Probabilistic hedge
    if (shouldHedge) {
      print(
        '  Hedging (probability: ${(_hedgeProbability * 100).toStringAsFixed(1)}%)',
      );
      Future.delayed(delay, () {
        if (won) return;
        dio
            .get(url, cancelToken: tokens[1])
            .then((r) => handleResponse(r, 1))
            .catchError((e) {
          if (!won && e is! DioException) c.completeError(e);
        });
      });
    } else {
      print('  No hedge (probability too low)');
    }

    return c.future;
  }
}

// Examples

Future<void> adaptiveHedgingExample(Dio dio) async {
  print('--- Adaptive Hedging Example ---');
  print('Hedging delay adapts to observed P95 latency\n');

  final hedger = AdaptiveHedger(
    initialDelay: Duration(milliseconds: 100),
    percentile: 0.95,
  );

  for (var i = 1; i <= 5; i++) {
    print('Request $i:');
    try {
      final result = await hedger.hedgedGet(dio, '/posts/$i');
      print('  Winner: Request ${result.winnerIndex}');
      print('  Time: ${result.elapsed.inMilliseconds}ms');
      print('  Current delay: ${hedger.currentDelay.inMilliseconds}ms\n');
    } catch (e) {
      print('  Error: $e\n');
    }

    await Future.delayed(Duration(milliseconds: 200));
  }

  print('Final statistics:');
  final stats = hedger.getStats();
  stats.forEach((key, value) {
    print('  $key: $value');
  });
  print('');
}

Future<void> loadBalancedHedgingExample(Dio dio) async {
  print('--- Load-Balanced Hedging Example ---');
  print('Distributing requests across multiple backends\n');

  final hedger = LoadBalancedHedger([
    'https://jsonplaceholder.typicode.com',
    'https://jsonplaceholder.typicode.com', // In real use, different backends
  ]);

  for (var i = 1; i <= 3; i++) {
    print('Request $i:');
    try {
      final result = await hedger.hedgedGet(
        dio,
        '/posts/$i',
        delay: Duration(milliseconds: 50),
      );
      print('  Winner: Backend ${result.winnerIndex}');
      print('  Time: ${result.elapsed.inMilliseconds}ms\n');
    } catch (e) {
      print('  Error: $e\n');
    }
  }
}

Future<void> budgetBasedHedgingExample(Dio dio) async {
  print('--- Budget-Based Hedging Example ---');
  print('Only hedge if within rate limit budget\n');

  final hedger = BudgetBasedHedger(maxHedgesPerSecond: 3);

  // Fire 5 requests rapidly
  for (var i = 1; i <= 5; i++) {
    print('Request $i:');
    try {
      final result = await hedger.hedgedGet(
        dio,
        '/posts/$i',
        delay: Duration(milliseconds: 50),
      );
      print('  Winner: Request ${result.winnerIndex}');
      print('  Hedge fired: ${result.hedgeFired}');
      print('  Time: ${result.elapsed.inMilliseconds}ms\n');
    } catch (e) {
      print('  Error: $e\n');
    }

    // Small delay between requests
    await Future.delayed(Duration(milliseconds: 150));
  }

  print('Budget statistics:');
  final stats = hedger.getStats();
  stats.forEach((key, value) {
    print('  $key: $value');
  });
  print('');
}

// Cascading hedging - hedge at multiple levels
Future<HedgedResponse> cascadingHedge(
  Dio dio,
  String url, {
  List<Duration> delays = const [
    Duration(milliseconds: 50),
    Duration(milliseconds: 100),
    Duration(milliseconds: 200),
  ],
}) async {
  final tokens = List.generate(delays.length + 1, (_) => CancelToken());
  final c = Completer<HedgedResponse>();
  var won = false;
  final startTime = DateTime.now();

  void handleResponse(Response r, int index) {
    if (!won) {
      won = true;
      for (var i = 0; i < tokens.length; i++) {
        if (i != index && !tokens[i].isCancelled) {
          tokens[i].cancel();
        }
      }
      c.complete(HedgedResponse(
        response: r,
        winnerIndex: index + 1,
        elapsed: DateTime.now().difference(startTime),
      ));
    }
  }

  // Original
  dio
      .get(url, cancelToken: tokens[0])
      .then((r) => handleResponse(r, 0))
      .catchError((e) {
    if (!won && e is! DioException) c.completeError(e);
  });

  // Cascading hedges
  for (var i = 0; i < delays.length; i++) {
    final index = i;
    Future.delayed(delays[i], () {
      if (won) return;
      print('  Cascade hedge ${index + 1} fired at ${delays[i].inMilliseconds}ms');
      dio
          .get(url, cancelToken: tokens[index + 1])
          .then((r) => handleResponse(r, index + 1))
          .catchError((e) {
        if (!won && e is! DioException) c.completeError(e);
      });
    });
  }

  return c.future;
}

Future<void> cascadingHedgingExample(Dio dio) async {
  print('--- Cascading Hedging Example ---');
  print('Fire additional hedges at multiple delay points\n');

  try {
    final result = await cascadingHedge(dio, '/posts/1');
    print('\nResult:');
    print('  Winner: Request ${result.winnerIndex}');
    print('  Time: ${result.elapsed.inMilliseconds}ms');
  } catch (e) {
    print('Error: $e');
  }
}
