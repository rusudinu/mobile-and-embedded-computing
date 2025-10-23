import 'package:flutter/material.dart';

/// BAD EXAMPLE: Heavy computation on the main UI thread
///
/// This demonstrates the problem of running CPU-intensive operations
/// on the main thread - the UI will freeze completely during computation.
class BlockingUIExample extends StatefulWidget {
  const BlockingUIExample({super.key});

  @override
  State<BlockingUIExample> createState() => _BlockingUIExampleState();
}

class _BlockingUIExampleState extends State<BlockingUIExample> {
  String _status = 'Ready';
  int? _result;
  bool _isComputing = false;

  // This runs on the main thread and BLOCKS the UI
  void _runBlockingComputation() {
    setState(() {
      _status = 'Computing...';
      _isComputing = true;
      _result = null;
    });

    // BAD: Heavy computation directly on main thread
    // This will freeze the UI - animations stop, buttons don't respond
    int result = 0;
    for (int i = 0; i < 2000000000; i++) {
      result += i % 1000;
    }

    setState(() {
      _result = result;
      _status = 'Done!';
      _isComputing = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Blocking UI Example (BAD)'),
        backgroundColor: Colors.red.shade700,
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
                onPressed: _isComputing ? null : _runBlockingComputation,
                icon: const Icon(Icons.warning),
                label: const Text('Run Heavy Computation'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red.shade700,
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
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.shade700),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.warning, color: Colors.red, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Problem:',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.red,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 8),
                    Text(
                      'When you click the button, the spinner above will FREEZE. '
                      'The entire UI becomes unresponsive because the heavy '
                      'computation blocks the main thread.',
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
          'If this stops spinning, UI is frozen!',
          style: TextStyle(fontSize: 11, color: Colors.grey),
        ),
      ],
    );
  }
}
