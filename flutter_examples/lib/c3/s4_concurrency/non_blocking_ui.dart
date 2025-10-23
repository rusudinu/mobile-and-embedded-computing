import 'dart:isolate';
import 'package:flutter/material.dart';

/// GOOD EXAMPLE: Heavy computation using isolates
///
/// This demonstrates the correct way to run CPU-intensive operations
/// using isolates - the UI remains responsive during computation.
class NonBlockingUIExample extends StatefulWidget {
  const NonBlockingUIExample({super.key});

  @override
  State<NonBlockingUIExample> createState() => _NonBlockingUIExampleState();
}

class _NonBlockingUIExampleState extends State<NonBlockingUIExample> {
  String _status = 'Ready';
  int? _result;
  bool _isComputing = false;

  // Entry point function for the isolate (runs in separate thread)
  static void _heavyComputationIsolate(SendPort sendPort) {
    // This runs in a completely separate isolate
    int result = 0;
    for (int i = 0; i < 2000000000; i++) {
      result += i % 1000;
    }
    // Send the result back to the main isolate
    sendPort.send(result);
  }

  // GOOD: Run computation in an isolate (separate thread)
  Future<void> _runNonBlockingComputation() async {
    setState(() {
      _status = 'Computing in isolate...';
      _isComputing = true;
      _result = null;
    });

    try {
      // Create a receive port to get results from the isolate
      final receivePort = ReceivePort();

      // Spawn the isolate (creates a new thread)
      await Isolate.spawn(
        _heavyComputationIsolate,
        receivePort.sendPort,
      );

      // Wait for the result (this doesn't block - it's async!)
      final result = await receivePort.first;

      setState(() {
        _result = result as int;
        _status = 'Done!';
        _isComputing = false;
      });

      receivePort.close();
    } catch (e) {
      setState(() {
        _status = 'Error: $e';
        _isComputing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Non-Blocking UI Example (GOOD)'),
        backgroundColor: Colors.green.shade700,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Animated indicator to show if UI is responsive
              const _SpinningIndicator(),
              const SizedBox(height: 40),

              Text(
                _status,
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 20),

              if (_result != null)
                Text(
                  'Result: $_result',
                  style: const TextStyle(fontSize: 18),
                ),
              const SizedBox(height: 40),

              ElevatedButton.icon(
                onPressed: _isComputing ? null : _runNonBlockingComputation,
                icon: const Icon(Icons.check_circle),
                label: const Text('Run Heavy Computation'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green.shade700,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 12,
                  ),
                ),
              ),
              const SizedBox(height: 20),

              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.green.shade700),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.check_circle, color: Colors.green, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Solution:',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.green,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 8),
                    Text(
                      'When you click the button, the spinner keeps spinning! '
                      'The heavy computation runs in a separate isolate (thread), '
                      'so the UI remains fully responsive.',
                      style: TextStyle(fontSize: 13),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// A constantly spinning widget to visually demonstrate UI responsiveness
class _SpinningIndicator extends StatefulWidget {
  const _SpinningIndicator();

  @override
  State<_SpinningIndicator> createState() => _SpinningIndicatorState();
}

class _SpinningIndicatorState extends State<_SpinningIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Text(
          'UI Responsiveness Indicator',
          style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        RotationTransition(
          turns: _controller,
          child: const Icon(
            Icons.refresh,
            size: 60,
            color: Colors.blue,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'This should keep spinning smoothly!',
          style: TextStyle(fontSize: 11, color: Colors.grey),
        ),
      ],
    );
  }
}
