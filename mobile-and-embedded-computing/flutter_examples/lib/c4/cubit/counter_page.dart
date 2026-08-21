import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'counter_cubit.dart';

/// UI page that displays the counter and allows user interaction
class CounterPage extends StatelessWidget {
  const CounterPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cubit Pattern Example'),
        backgroundColor: Colors.purple,
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
            BlocBuilder<CounterCubit, int>(
              builder: (context, count) {
                return Text(
                  '$count',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(
                        color: Colors.purple,
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
                    // Call method directly on the Cubit
                    context.read<CounterCubit>().decrement();
                  },
                  heroTag: 'decrement',
                  backgroundColor: Colors.red,
                  child: const Icon(Icons.remove),
                ),
                const SizedBox(width: 20),
                // Reset button
                FloatingActionButton(
                  onPressed: () {
                    // Call method directly on the Cubit
                    context.read<CounterCubit>().reset();
                  },
                  heroTag: 'reset',
                  backgroundColor: Colors.grey,
                  child: const Icon(Icons.refresh),
                ),
                const SizedBox(width: 20),
                // Increment button
                FloatingActionButton(
                  onPressed: () {
                    // Call method directly on the Cubit
                    context.read<CounterCubit>().increment();
                  },
                  heroTag: 'increment',
                  backgroundColor: Colors.green,
                  child: const Icon(Icons.add),
                ),
              ],
            ),
            const SizedBox(height: 20),
            // Custom increment buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton.icon(
                  onPressed: () {
                    context.read<CounterCubit>().incrementBy(5);
                  },
                  icon: const Icon(Icons.add),
                  label: const Text('+5'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.purple.shade200,
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton.icon(
                  onPressed: () {
                    context.read<CounterCubit>().incrementBy(10);
                  },
                  icon: const Icon(Icons.add),
                  label: const Text('+10'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.purple.shade300,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 40),
            Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                color: Colors.purple.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.purple.shade200),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Cubit Pattern Key Concepts:',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text('• No Events: Call methods directly'),
                  Text('• States: Simple int value'),
                  Text('• Cubit: Exposes methods that emit states'),
                  Text('• UI: Calls methods and reacts to states'),
                  Text('• Simpler than BLoC for basic use cases'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
