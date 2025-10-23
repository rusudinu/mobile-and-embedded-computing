// Performance analysis and comparison of hedging strategies
// Add to pubspec.yaml:
//   dependencies:
//     dio: ^5.4.0

import 'dart:async';
import 'dart:math';
import 'package:dio/dio.dart';

void main() async {
  print('=== Hedging Performance Analysis ===\n');

  final dio = Dio(BaseOptions(
    baseUrl: 'https://jsonplaceholder.typicode.com',
    connectTimeout: Duration(seconds: 10),
  ));

  await latencyImprovementAnalysis(dio);
  await costBenefitAnalysis(dio);
  await optimalDelayAnalysis(dio);
  await hedgingUnderDifferentConditions(dio);
}

// Measure latency improvements with hedging
Future<void> latencyImprovementAnalysis(Dio dio) async {
  print('--- Latency Improvement Analysis ---');
  print('Comparing normal vs hedged requests (20 samples)\n');

  final normalLatencies = <int>[];
  final hedgedLatencies = <int>[];
  final winners = <int>[0, 0]; // [request1, request2]

  for (var i = 0; i < 20; i++) {
    // Normal request
    final normalStart = DateTime.now();
    await dio.get('/posts/${(i % 10) + 1}');
    normalLatencies.add(DateTime.now().difference(normalStart).inMilliseconds);

    await Future.delayed(Duration(milliseconds: 50));

    // Hedged request
    final result = await _hedgedGetWithTracking(
      dio,
      '/posts/${(i % 10) + 1}',
      delay: Duration(milliseconds: 100),
    );
    hedgedLatencies.add(result.elapsed.inMilliseconds);
    winners[result.winnerIndex - 1]++;

    await Future.delayed(Duration(milliseconds: 50));
  }

  // Calculate statistics
  normalLatencies.sort();
  hedgedLatencies.sort();

  final normalAvg = normalLatencies.reduce((a, b) => a + b) / normalLatencies.length;
  final hedgedAvg = hedgedLatencies.reduce((a, b) => a + b) / hedgedLatencies.length;

  print('Normal requests:');
  print('  Min:    ${normalLatencies.first}ms');
  print('  Max:    ${normalLatencies.last}ms');
  print('  Avg:    ${normalAvg.toStringAsFixed(1)}ms');
  print('  Median: ${normalLatencies[normalLatencies.length ~/ 2]}ms');
  print('  P95:    ${normalLatencies[(normalLatencies.length * 0.95).floor()]}ms');
  print('  P99:    ${normalLatencies[(normalLatencies.length * 0.99).floor()]}ms\n');

  print('Hedged requests:');
  print('  Min:    ${hedgedLatencies.first}ms');
  print('  Max:    ${hedgedLatencies.last}ms');
  print('  Avg:    ${hedgedAvg.toStringAsFixed(1)}ms');
  print('  Median: ${hedgedLatencies[hedgedLatencies.length ~/ 2]}ms');
  print('  P95:    ${hedgedLatencies[(hedgedLatencies.length * 0.95).floor()]}ms');
  print('  P99:    ${hedgedLatencies[(hedgedLatencies.length * 0.99).floor()]}ms\n');

  print('Improvement:');
  final avgImprovement = ((normalAvg - hedgedAvg) / normalAvg * 100);
  print('  Avg latency: ${avgImprovement.toStringAsFixed(1)}% faster');
  print('  Request 1 won: ${winners[0]} times (${(winners[0] / 20 * 100).toStringAsFixed(1)}%)');
  print('  Request 2 won: ${winners[1]} times (${(winners[1] / 20 * 100).toStringAsFixed(1)}%)\n');
}

// Cost-benefit analysis: extra requests vs latency improvement
Future<void> costBenefitAnalysis(Dio dio) async {
  print('--- Cost-Benefit Analysis ---');
  print('Measuring trade-off between extra requests and latency\n');

  final strategies = {
    'No hedging': (Dio d, String url) => _normalRequest(d, url),
    'Hedge @50ms': (Dio d, String url) =>
        _hedgedGetWithTracking(d, url, delay: Duration(milliseconds: 50)),
    'Hedge @100ms': (Dio d, String url) =>
        _hedgedGetWithTracking(d, url, delay: Duration(milliseconds: 100)),
    'Hedge @200ms': (Dio d, String url) =>
        _hedgedGetWithTracking(d, url, delay: Duration(milliseconds: 200)),
  };

  final results = <String, List<int>>{};
  final requestCounts = <String, int>{};

  for (var entry in strategies.entries) {
    results[entry.key] = [];
    requestCounts[entry.key] = 0;

    for (var i = 0; i < 10; i++) {
      final result = await entry.value(dio, '/posts/${(i % 5) + 1}');
      results[entry.key]!.add(result.elapsed.inMilliseconds);

      // Count actual requests made
      if (entry.key == 'No hedging') {
        requestCounts[entry.key] = requestCounts[entry.key]! + 1;
      } else {
        // Hedging might fire 1 or 2 requests
        requestCounts[entry.key] = requestCounts[entry.key]! + result.winnerIndex;
      }

      await Future.delayed(Duration(milliseconds: 50));
    }
  }

  // Display results
  print('Strategy               | Avg Latency | Total Requests | Efficiency');
  print('${"-" * 70}');

  for (var entry in results.entries) {
    final latencies = entry.value..sort();
    final avg = latencies.reduce((a, b) => a + b) / latencies.length;
    final requests = requestCounts[entry.key]!;
    final efficiency = (10 / requests * 100); // Base is 10 requests

    print(
      '${entry.key.padRight(22)} | '
      '${avg.toStringAsFixed(1).padLeft(11)}ms | '
      '${requests.toString().padLeft(14)} | '
      '${efficiency.toStringAsFixed(1)}%',
    );
  }
  print('');
}

// Find optimal hedge delay
Future<void> optimalDelayAnalysis(Dio dio) async {
  print('--- Optimal Delay Analysis ---');
  print('Testing different hedge delays to find optimal value\n');

  final delays = [25, 50, 75, 100, 125, 150, 200];
  final results = <int, List<_HedgingMetrics>>{};

  for (var delay in delays) {
    results[delay] = [];

    for (var i = 0; i < 10; i++) {
      final metrics = await _hedgedGetWithMetrics(
        dio,
        '/posts/${(i % 5) + 1}',
        delay: Duration(milliseconds: delay),
      );
      results[delay]!.add(metrics);

      await Future.delayed(Duration(milliseconds: 50));
    }
  }

  // Display results
  print('Delay | Avg Latency | Hedges Fired | Winner: R1/R2 | Waste');
  print('${"-" * 65}');

  for (var entry in results.entries) {
    final metrics = entry.value;
    final avgLatency =
        metrics.map((m) => m.latency).reduce((a, b) => a + b) / metrics.length;
    final hedgesFired =
        metrics.where((m) => m.hedgeFired).length / metrics.length * 100;
    final r1Wins = metrics.where((m) => m.winner == 1).length;
    final r2Wins = metrics.where((m) => m.winner == 2).length;
    final wasteRate = metrics.where((m) => m.hedgeFired).length /
        metrics.length *
        100;

    print(
      '${entry.key.toString().padLeft(5)}ms | '
      '${avgLatency.toStringAsFixed(1).padLeft(11)}ms | '
      '${hedgesFired.toStringAsFixed(0).padLeft(12)}% | '
      '${r1Wins.toString().padLeft(6)}/${r2Wins.toString().padLeft(2)} | '
      '${wasteRate.toStringAsFixed(0)}%',
    );
  }
  print('');
}

// Test hedging under different network conditions
Future<void> hedgingUnderDifferentConditions(Dio dio) async {
  print('--- Hedging Under Different Conditions ---');
  print('Simulating various network scenarios\n');

  // Simulate with added artificial delays
  final conditions = {
    'Fast network (0-50ms)': (int i) => Duration(milliseconds: Random().nextInt(50)),
    'Normal network (50-200ms)': (int i) =>
        Duration(milliseconds: 50 + Random().nextInt(150)),
    'Slow network (200-500ms)': (int i) =>
        Duration(milliseconds: 200 + Random().nextInt(300)),
    'Variable network (0-500ms)': (int i) =>
        Duration(milliseconds: Random().nextInt(500)),
  };

  for (var entry in conditions.entries) {
    print('${entry.key}:');

    final normalLatencies = <int>[];
    final hedgedLatencies = <int>[];

    for (var i = 0; i < 10; i++) {
      // Simulate delay
      final artificialDelay = entry.value(i);

      // Normal request with delay
      final normalStart = DateTime.now();
      await Future.delayed(artificialDelay);
      await dio.get('/posts/1');
      normalLatencies.add(DateTime.now().difference(normalStart).inMilliseconds);

      // Hedged request (simulated)
      final hedgedStart = DateTime.now();
      // Simulate two requests with delay
      final delay1 = entry.value(i);
      final delay2 = entry.value(i + 1);
      final winner = delay1 < delay2 ? delay1 : delay2;
      await Future.delayed(winner);
      await dio.get('/posts/1');
      hedgedLatencies.add(DateTime.now().difference(hedgedStart).inMilliseconds);

      await Future.delayed(Duration(milliseconds: 50));
    }

    final normalAvg =
        normalLatencies.reduce((a, b) => a + b) / normalLatencies.length;
    final hedgedAvg =
        hedgedLatencies.reduce((a, b) => a + b) / hedgedLatencies.length;
    final improvement = ((normalAvg - hedgedAvg) / normalAvg * 100);

    print('  Normal avg:  ${normalAvg.toStringAsFixed(1)}ms');
    print('  Hedged avg:  ${hedgedAvg.toStringAsFixed(1)}ms');
    print('  Improvement: ${improvement.toStringAsFixed(1)}%\n');
  }
}

// Visualize hedging effectiveness
void visualizeHedgingEffectiveness() {
  print('--- Hedging Effectiveness Visualization ---\n');

  print('Latency Distribution (simulated):');
  print('Without hedging:');
  print('  0-100ms:  ████████ 40%');
  print('  100-200ms: ██████ 30%');
  print('  200-300ms: ████ 20%');
  print('  300ms+:   ██ 10%\n');

  print('With hedging (100ms delay):');
  print('  0-100ms:  ████████████ 60%');
  print('  100-200ms: ██████ 30%');
  print('  200-300ms: ██ 8%');
  print('  300ms+:   ░ 2%\n');

  print('Key insights:');
  print('  • Hedging reduces tail latencies (P95, P99)');
  print('  • ~50% reduction in high-latency requests');
  print('  • Trade-off: 2x requests for slow paths');
  print('  • Best when: latency variance is high\n');
}

// Compare hedging strategies
Future<void> strategyComparison(Dio dio) async {
  print('--- Strategy Comparison ---\n');

  final strategies = {
    'No hedging': _StrategyConfig(hedge: false, delay: 0),
    'Conservative (200ms)': _StrategyConfig(hedge: true, delay: 200),
    'Moderate (100ms)': _StrategyConfig(hedge: true, delay: 100),
    'Aggressive (50ms)': _StrategyConfig(hedge: true, delay: 50),
  };

  print('Strategy              | P50   | P95   | P99   | Extra Reqs');
  print('${"-" * 60}');

  for (var entry in strategies.entries) {
    final latencies = <int>[];
    var totalRequests = 0;

    for (var i = 0; i < 20; i++) {
      if (entry.value.hedge) {
        final result = await _hedgedGetWithTracking(
          dio,
          '/posts/${(i % 5) + 1}',
          delay: Duration(milliseconds: entry.value.delay),
        );
        latencies.add(result.elapsed.inMilliseconds);
        totalRequests += result.winnerIndex;
      } else {
        final start = DateTime.now();
        await dio.get('/posts/${(i % 5) + 1}');
        latencies.add(DateTime.now().difference(start).inMilliseconds);
        totalRequests += 1;
      }

      await Future.delayed(Duration(milliseconds: 50));
    }

    latencies.sort();
    final p50 = latencies[latencies.length ~/ 2];
    final p95 = latencies[(latencies.length * 0.95).floor()];
    final p99 = latencies[(latencies.length * 0.99).floor()];
    final extraReqs = ((totalRequests - 20) / 20 * 100);

    print(
      '${entry.key.padRight(21)} | '
      '${p50.toString().padLeft(5)}ms | '
      '${p95.toString().padLeft(5)}ms | '
      '${p99.toString().padLeft(5)}ms | '
      '${extraReqs.toStringAsFixed(0)}%',
    );
  }
  print('');
}

// Helper classes and functions

class _HedgingResult {
  final int winnerIndex;
  final Duration elapsed;
  final bool hedgeFired;

  _HedgingResult({
    required this.winnerIndex,
    required this.elapsed,
    this.hedgeFired = false,
  });
}

class _HedgingMetrics {
  final int latency;
  final bool hedgeFired;
  final int winner;

  _HedgingMetrics({
    required this.latency,
    required this.hedgeFired,
    required this.winner,
  });
}

class _StrategyConfig {
  final bool hedge;
  final int delay;

  _StrategyConfig({required this.hedge, required this.delay});
}

Future<_HedgingResult> _normalRequest(Dio dio, String url) async {
  final start = DateTime.now();
  await dio.get(url);
  return _HedgingResult(
    winnerIndex: 1,
    elapsed: DateTime.now().difference(start),
    hedgeFired: false,
  );
}

Future<_HedgingResult> _hedgedGetWithTracking(
  Dio dio,
  String url, {
  required Duration delay,
}) async {
  final tokens = [CancelToken(), CancelToken()];
  final c = Completer<_HedgingResult>();
  var won = false;
  var hedgeFired = false;
  final startTime = DateTime.now();

  void handleResponse(Response r, int index) {
    if (!won) {
      won = true;
      tokens[1 - index].cancel();

      c.complete(_HedgingResult(
        winnerIndex: index + 1,
        elapsed: DateTime.now().difference(startTime),
        hedgeFired: hedgeFired,
      ));
    }
  }

  // Original
  dio
      .get(url, cancelToken: tokens[0])
      .then((r) => handleResponse(r, 0))
      .catchError((e) {});

  // Hedge
  Future.delayed(delay, () {
    if (won) return;
    hedgeFired = true;
    dio
        .get(url, cancelToken: tokens[1])
        .then((r) => handleResponse(r, 1))
        .catchError((e) {});
  });

  return c.future;
}

Future<_HedgingMetrics> _hedgedGetWithMetrics(
  Dio dio,
  String url, {
  required Duration delay,
}) async {
  final result = await _hedgedGetWithTracking(dio, url, delay: delay);
  return _HedgingMetrics(
    latency: result.elapsed.inMilliseconds,
    hedgeFired: result.hedgeFired,
    winner: result.winnerIndex,
  );
}
