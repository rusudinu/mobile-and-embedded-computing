import 'package:flutter/foundation.dart';

// Define a top-level or static function
int expensiveCalculation(int input) {
  int result = 0;
  for (int i = 0; i < input; i++) {
    result += i * i;
  }
  return result;
}

// Call it with compute
Future<void> doWork() async {
  final result = await compute(expensiveCalculation, 1000000);
  print('Result: $result');
}

void main() async {
  print('App started');
  doWork();
  print('App finished');
}

/*
// Without compute (manual isolate)
Future<R> manualIsolate<R>(Function fn, dynamic arg) async {
  final receivePort = ReceivePort();
  await Isolate.spawn(_isolateEntry, [receivePort.sendPort, fn, arg]);
  return await receivePort.first;
}

// With compute (automatic)
final result = await compute(myFunction, myArgument);

*/
