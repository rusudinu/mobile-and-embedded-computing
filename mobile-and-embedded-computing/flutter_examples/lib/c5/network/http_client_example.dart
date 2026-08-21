// dart:io HttpClient - Low-level HTTP client with TLS and socket control
// No additional dependencies needed - part of dart:io

import 'dart:async';
import 'dart:io';
import 'dart:convert';

void main() async {
  await basicHttpClientExample();
  await httpClientWithHeadersExample();
  await httpClientPostExample();
  await httpClientWithTLSExample();
  await httpClientWithTimeoutExample();
}

// Basic GET request
Future<void> basicHttpClientExample() async {
  print('=== Basic HttpClient Example ===');

  final client = HttpClient();
  try {
    // Open connection
    final request = await client.getUrl(
      Uri.parse('https://jsonplaceholder.typicode.com/posts/1'),
    );

    // Get response
    final response = await request.close();

    // Read response body
    final responseBody = await response.transform(utf8.decoder).join();

    print('Status: ${response.statusCode}');
    print('Content-Length: ${response.contentLength}');
    print('Body: $responseBody');
  } finally {
    client.close();
  }
}

// GET with custom headers
Future<void> httpClientWithHeadersExample() async {
  print('\n=== HttpClient with Headers ===');

  final client = HttpClient();
  try {
    final request = await client.getUrl(
      Uri.parse('https://jsonplaceholder.typicode.com/users/1'),
    );

    // Add custom headers
    request.headers.set('User-Agent', 'Dart HttpClient');
    request.headers.set('Accept', 'application/json');
    request.headers.set('X-Custom-Header', 'MyValue');

    final response = await request.close();

    print('Status: ${response.statusCode}');
    print('Response Headers:');
    response.headers.forEach((name, values) {
      print('  $name: ${values.join(", ")}');
    });

    final responseBody = await response.transform(utf8.decoder).join();
    print('Body: $responseBody');
  } finally {
    client.close();
  }
}

// POST request with body
Future<void> httpClientPostExample() async {
  print('\n=== HttpClient POST Example ===');

  final client = HttpClient();
  try {
    final request = await client.postUrl(
      Uri.parse('https://jsonplaceholder.typicode.com/posts'),
    );

    // Set headers
    request.headers.set('Content-Type', 'application/json; charset=UTF-8');

    // Write request body
    final body = jsonEncode({
      'title': 'foo',
      'body': 'bar',
      'userId': 1,
    });
    request.write(body);

    // Get response
    final response = await request.close();
    final responseBody = await response.transform(utf8.decoder).join();

    print('Status: ${response.statusCode}');
    print('Response: $responseBody');
  } finally {
    client.close();
  }
}

// HttpClient with TLS configuration
Future<void> httpClientWithTLSExample() async {
  print('\n=== HttpClient with TLS Configuration ===');

  final client = HttpClient();

  // Configure TLS
  client.badCertificateCallback = (cert, host, port) {
    // WARNING: Only use this for development/testing!
    // In production, validate certificates properly
    print('Certificate: $host:$port');
    return false; // Reject bad certificates in production
  };

  try {
    final request = await client.getUrl(
      Uri.parse('https://jsonplaceholder.typicode.com/posts/1'),
    );

    final response = await request.close();
    final responseBody = await response.transform(utf8.decoder).join();

    print('Status: ${response.statusCode}');
    print('Secure: ${response.certificate != null}');
    if (response.certificate != null) {
      print('Certificate subject: ${response.certificate!.subject}');
      print('Certificate issuer: ${response.certificate!.issuer}');
    }
  } finally {
    client.close();
  }
}

// HttpClient with timeout and connection settings
Future<void> httpClientWithTimeoutExample() async {
  print('\n=== HttpClient with Timeout ===');

  final client = HttpClient();

  // Configure client
  client.connectionTimeout = Duration(seconds: 5);
  client.idleTimeout = Duration(seconds: 10);
  client.maxConnectionsPerHost = 6;

  try {
    final request = await client.getUrl(
      Uri.parse('https://jsonplaceholder.typicode.com/posts'),
    );

    final response = await request.close();

    // Stream response with timeout
    final responseBody = await response
        .transform(utf8.decoder)
        .timeout(
          Duration(seconds: 5),
          onTimeout: (sink) {
            sink.addError(TimeoutException('Reading response timed out'));
          },
        )
        .join();

    print('Status: ${response.statusCode}');
    print('Response length: ${responseBody.length} bytes');
  } on TimeoutException catch (e) {
    print('Timeout: $e');
  } finally {
    client.close();
  }
}

// Advanced: Manual socket control
Future<void> httpClientSocketExample() async {
  print('\n=== HttpClient with Socket Control ===');

  final client = HttpClient();

  try {
    final request = await client.getUrl(
      Uri.parse('https://jsonplaceholder.typicode.com/posts/1'),
    );

    // Enable persistent connection
    request.persistentConnection = true;

    final response = await request.close();
    final responseBody = await response.transform(utf8.decoder).join();

    print('Status: ${response.statusCode}');
    print('Persistent: ${response.persistentConnection}');
    print('Response: ${responseBody.substring(0, 100)}...');
  } finally {
    client.close(force: false); // Allow connections to complete
  }
}

// Error handling example
Future<void> httpClientErrorHandling() async {
  print('\n=== HttpClient Error Handling ===');

  final client = HttpClient();

  try {
    final request = await client.getUrl(
      Uri.parse('https://invalid-domain-that-does-not-exist.com'),
    );

    final response = await request.close();
    final responseBody = await response.transform(utf8.decoder).join();

    if (response.statusCode == 200) {
      print('Success: $responseBody');
    } else {
      print('HTTP Error: ${response.statusCode}');
    }
  } on SocketException catch (e) {
    print('Socket Error: ${e.message}');
  } on HttpException catch (e) {
    print('HTTP Error: ${e.message}');
  } on FormatException catch (e) {
    print('Format Error: ${e.message}');
  } catch (e) {
    print('Unknown Error: $e');
  } finally {
    client.close();
  }
}
