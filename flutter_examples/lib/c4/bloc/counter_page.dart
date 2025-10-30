import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'counter_bloc.dart';
import 'counter_event.dart';
import 'counter_state.dart';

/// UI page that displays the counter and allows user interaction
class CounterPage extends StatelessWidget {
  const CounterPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('BLoC Pattern Example'),
        backgroundColor: Colors.blue,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'You have pushed the button this many times:',
              style: TextStyle(fontSize: 18),
            ),
            const SizedBox(height: 20),
            // BlocBuilder rebuilds when state changes
            BlocBuilder<CounterBloc, CounterState>(
              builder: (context, state) {
                return Text(
                  '${state.count}',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(
                        color: Colors.blue,
                        fontWeight: FontWeight.bold,
                      ),
                );
              },
            ),
            const SizedBox(height: 40),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Decrement button
                FloatingActionButton(
                  onPressed: () {
                    // Add decrement event to the BLoC
                    context.read<CounterBloc>().add(DecrementEvent());
                  },
                  heroTag: 'decrement',
                  backgroundColor: Colors.red,
                  child: const Icon(Icons.remove),
                ),
                const SizedBox(width: 20),
                // Reset button
                FloatingActionButton(
                  onPressed: () {
                    // Add reset event to the BLoC
                    context.read<CounterBloc>().add(ResetEvent());
                  },
                  heroTag: 'reset',
                  backgroundColor: Colors.grey,
                  child: const Icon(Icons.refresh),
                ),
                const SizedBox(width: 20),
                // Increment button
                FloatingActionButton(
                  onPressed: () {
                    // Add increment event to the BLoC
                    context.read<CounterBloc>().add(IncrementEvent());
                  },
                  heroTag: 'increment',
                  backgroundColor: Colors.green,
                  child: const Icon(Icons.add),
                ),
              ],
            ),
            const SizedBox(height: 40),
            Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.blue.shade200),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'BLoC Pattern Key Concepts:',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text('• Events: User actions (Increment, Decrement, Reset)'),
                  Text('• States: Counter value'),
                  Text('• BLoC: Processes events and emits states'),
                  Text('• UI: Dispatches events and reacts to states'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
