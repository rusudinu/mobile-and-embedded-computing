import 'dart:isolate';

// Worker isolate entrypoint
void isolateWorker(SendPort mainSendPort) {
  final workerReceivePort = ReceivePort();

  // Send this worker’s SendPort back to the main isolate
  mainSendPort.send(workerReceivePort.sendPort);

  // Listen for incoming tasks
  workerReceivePort.listen((message) {
    if (message is Map) {
      final task = message['task'];
      final data = message['data'];
      final SendPort replyPort = message['replyPort'];

      // Process the data
      final result = processData(task, data);

      // Send result back to main isolate
      replyPort.send(result);
    }
  });
}

// Mock data processor
dynamic processData(String task, dynamic data) {
  // Simulate different operations
  switch (task) {
    case 'resize':
      return 'Image resized: ${data.toString()}';
    case 'filter':
      return 'Image filtered: ${data.toString()}';
    default:
      return 'Unknown task: $task with data: $data';
  }
}

// Helper to send a task to the worker isolate
Future<dynamic> sendTask(SendPort workerSendPort, String task, dynamic data) {
  final responsePort = ReceivePort();

  // Send message with task info and response port
  workerSendPort.send({
    'task': task,
    'data': data,
    'replyPort': responsePort.sendPort,
  });

  // Wait for the response
  return responsePort.first;
}

// Main isolate
Future<void> main() async {
  final receivePort = ReceivePort();

  // Spawn the worker isolate
  await Isolate.spawn(isolateWorker, receivePort.sendPort);

  // Get the worker’s SendPort from the first message
  final SendPort workerSendPort = await receivePort.first;

  // Example data
  final imageData = {'width': 800, 'height': 600};

  // Send a few tasks
  final result1 = await sendTask(workerSendPort, 'resize', imageData);
  final result2 = await sendTask(workerSendPort, 'filter', imageData);

  print(result1);
  print(result2);
}
