// package:http with RetryClient example
// Add to pubspec.yaml:
//   dependencies:
//     http: ^1.1.0

import 'package:http/http.dart' as http;
import 'package:http/retry.dart';

void main() async {
  await simpleHttpExample();
  await retryClientExample();
}

// Simple HTTP GET request
Future<void> simpleHttpExample() async {
  print('=== Simple HTTP Example ===');

  final client = http.Client();
  try {
    final response = await client.get(
      Uri.parse('https://jsonplaceholder.typicode.com/posts/1'),
    );

    if (response.statusCode == 200) {
      print('Status: ${response.statusCode}');
      print('Body: ${response.body}');
    } else {
      print('Request failed with status: ${response.statusCode}');
    }
  } finally {
    client.close();
  }
}

// HTTP with RetryClient for automatic retries
Future<void> retryClientExample() async {
  print('\n=== RetryClient Example ===');

  final base = http.Client();
  final client = RetryClient(
    base,
    retries: 3,
    when: (response) {
      // Retry on 5xx errors
      return response.statusCode >= 500;
    },
    whenError: (error, stackTrace) {
      // Retry on network errors
      return true;
    },
  );

  try {
    final response = await client.get(
      Uri.parse('https://jsonplaceholder.typicode.com/users'),
    );

    print('Status: ${response.statusCode}');
    print('Response length: ${response.body.length} bytes');
  } catch (e) {
    print('Error after retries: $e');
  } finally {
    client.close();
  }
}

// POST request example
Future<void> postExample() async {
  print('\n=== POST Example ===');

  final client = http.Client();
  try {
    final response = await client.post(
      Uri.parse('https://jsonplaceholder.typicode.com/posts'),
      headers: {'Content-Type': 'application/json'},
      body: '{"title": "foo", "body": "bar", "userId": 1}',
    );

    print('Status: ${response.statusCode}');
    print('Created: ${response.body}');
  } finally {
    client.close();
  }
}
