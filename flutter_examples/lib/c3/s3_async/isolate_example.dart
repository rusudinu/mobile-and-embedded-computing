import 'dart:isolate';

// Entry point function for worker isolate
void heavyComputation(SendPort sendPort) {
  // This runs in a separate isolate
  print('Worker: Starting computation...');

  // Simulate CPU-intensive work
  int result = 0;
  for (int i = 0; i < 1000000000; i++) {
    result += i % 1000;
  }

  // Send result back to main isolate
  sendPort.send(result);
  print('Worker: Done!');
}

// Main isolate code
Future<void> runHeavyTask() async {
  print('Main: Starting isolate...');

  // Create receive port (mailbox for results)
  final receivePort = ReceivePort();

  // Spawn the isolate
  await Isolate.spawn(
    heavyComputation,           // Function to run
    receivePort.sendPort,       // How to send back results
  );

  // Wait for result
  final result = await receivePort.first;
  print('Main: Received result: $result');

  // Clean up
  receivePort.close();
}

// The main() entry point
void main() async {
  print('App started');
  await runHeavyTask();
  print('App finished');
}
