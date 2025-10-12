import 'dart:io';

void main() async {
  example();
  // exampleThen();
  stdout.writeln('3: End');

  countStream().listen((value) {
    stdout.writeln('Stream value: $value');
  });
}

void example() async {
  stdout.writeln('1: Start');

  await fetchData(); // Pauses here

  stdout.writeln('2: Got data'); // Resumes when data ready
}

// Under the hood:
void exampleThen() {
  stdout.writeln('1: Start');

  fetchData().then((data) {
    stdout.writeln('2: Got data');
  });
  stdout.writeln('2.1: Method end');
  // Function returns immediately
}

Future<String> fetchData() async {
  // Simulate network delay
  await Future.delayed(Duration(seconds: 2));
  return 'User Data';
}

Stream<int> countStream() async* {
  for (int i = 1; i <= 5; i++) {
    await Future.delayed(Duration(seconds: 1));
    yield i; // Emit value
  }
}
