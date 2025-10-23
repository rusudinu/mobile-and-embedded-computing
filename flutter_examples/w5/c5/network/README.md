# Flutter HTTP Libraries

This directory contains examples of different HTTP libraries available in Flutter/Dart ecosystem.

## Decision Flowchart

```
Need HTTP client?
│
├─ Need simple & lightweight?
│  └─ Use package:http (with RetryClient for retries)
│     ✓ Simple, composable API
│     ✓ Small footprint
│     ✓ RetryClient helper available
│
├─ Need interceptors/cancel/advanced features?
│  └─ Use Dio
│     ✓ Interceptors for logging, auth, etc.
│     ✓ Cancel tokens for request cancellation
│     ✓ FormData/Multipart support
│     ✓ Request/Response transformers
│     ✓ Global configuration
│
├─ Prefer declarative/generated API clients?
│  │
│  ├─ Want simple code generation?
│  │  └─ Use Chopper
│  │     ✓ Declarative API with annotations
│  │     ✓ Built-in converters
│  │     ✓ Interceptor support
│  │
│  └─ Want type-safe REST API with Dio features?
│     └─ Use retrofit.dart
│        ✓ Annotations + code generation
│        ✓ Built on top of Dio
│        ✓ Full type safety
│        ✓ Works with json_serializable
│
└─ Need very low-level control (TLS, sockets)?
   └─ Use dart:io HttpClient
      ✓ Low-level socket access
      ✓ TLS configuration
      ✓ Certificate validation
      ✓ Connection pooling control
```

## Library Comparison

| Feature | package:http | Dio | Chopper | retrofit.dart | HttpClient |
|---------|-------------|-----|---------|---------------|------------|
| Simplicity | ✓✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓ |
| Interceptors | ✗ | ✓✓✓ | ✓✓ | ✓✓✓ | ✗ |
| Code Generation | ✗ | ✗ | ✓✓✓ | ✓✓✓ | ✗ |
| Cancel Tokens | ✗ | ✓✓✓ | ✗ | ✓✓✓ | ✗ |
| FormData/Multipart | ✗ | ✓✓✓ | ✓✓ | ✓✓✓ | Manual |
| Type Safety | ✓ | ✓✓ | ✓✓✓ | ✓✓✓ | ✓ |
| Low-level Control | ✗ | ✗ | ✗ | ✗ | ✓✓✓ |
| Learning Curve | Easy | Medium | Medium | Medium | Hard |

## Files

### 1. `http_example.dart`
Examples using `package:http`:
- Simple HTTP GET request
- POST request with body
- RetryClient for automatic retries with configurable retry logic

**Dependencies:**
```yaml
dependencies:
  http: ^1.1.0
```

**Run:**
```bash
dart run w5/c5/network/http_example.dart
```

### 2. `dio_example.dart`
Examples using Dio with advanced features:
- Basic usage with timeout configuration
- Interceptors for logging and custom headers
- Cancel tokens for request cancellation
- FormData/Multipart for file uploads
- Response transformers

**Dependencies:**
```yaml
dependencies:
  dio: ^5.4.0
```

**Run:**
```bash
dart run w5/c5/network/dio_example.dart
```

### 3. `chopper_example.dart`
Declarative API client with code generation:
- Service definition with annotations
- CRUD operations (GET, POST, PUT, DELETE)
- Custom headers
- JSON conversion
- Interceptors

**Dependencies:**
```yaml
dependencies:
  chopper: ^7.1.0
dev_dependencies:
  build_runner: ^2.4.0
  chopper_generator: ^7.1.0
```

**Setup:**
```bash
# Generate code
dart run build_runner build

# Or watch for changes
dart run build_runner watch
```

**Run:**
```bash
dart run w5/c5/network/chopper_example.dart
```

### 4. `retrofit_example.dart`
Type-safe REST API client built on Dio:
- REST API interface with annotations
- JSON serialization with json_serializable
- Full CRUD operations
- Query parameters
- Custom headers
- HttpResponse for accessing headers and status

**Dependencies:**
```yaml
dependencies:
  dio: ^5.4.0
  retrofit: ^4.0.0
  json_annotation: ^4.8.0
dev_dependencies:
  build_runner: ^2.4.0
  retrofit_generator: ^8.0.0
  json_serializable: ^6.7.0
```

**Setup:**
```bash
# Generate code
dart run build_runner build

# Or watch for changes
dart run build_runner watch
```

**Run:**
```bash
dart run w5/c5/network/retrofit_example.dart
```

### 5. `http_client_example.dart`
Low-level HTTP client from dart:io:
- Basic GET and POST requests
- Custom headers
- TLS/SSL configuration
- Certificate validation
- Timeout configuration
- Socket control
- Connection pooling
- Error handling

**Dependencies:**
None (part of dart:io)

**Run:**
```bash
dart run w5/c5/network/http_client_example.dart
```

## Quick Start Examples

### package:http
```dart
final client = http.Client();
final res = await client.get(Uri.parse('https://api.example.com'));
client.close();
```

### package:http with RetryClient
```dart
final base = http.Client();
final client = RetryClient(base);
final res = await client.get(Uri.parse('https://api.example.com'));
client.close();
```

### Dio
```dart
final dio = Dio(BaseOptions(connectTimeout: Duration(seconds: 10)));
dio.interceptors.add(LogInterceptor());
final res = await dio.get('https://api.example.com');
```

### Chopper
```dart
@ChopperApi(baseUrl: '/items')
abstract class ItemService extends ChopperService {
  @Get(path: '/{id}')
  Future<Response<Item>> getItem(@Path('id') String id);
}
```

### retrofit.dart
```dart
@RestApi(baseUrl: 'https://api.example.com')
abstract class Api {
  factory Api(Dio dio) = _Api;

  @GET('/items/{id}')
  Future<Item> getItem(@Path('id') String id);
}
```

### dart:io HttpClient
```dart
final client = HttpClient();
final request = await client.getUrl(Uri.parse('https://api.example.com'));
final response = await request.close();
final body = await response.transform(utf8.decoder).join();
client.close();
```

## When to Use Each

### Use `package:http` when:
- Building simple applications with basic HTTP needs
- You want minimal dependencies
- You need automatic retries (RetryClient)
- Performance and package size are critical

### Use `Dio` when:
- You need interceptors for auth, logging, or error handling
- You want to cancel requests
- You need to upload files (multipart/form-data)
- You want global configuration
- You need request/response transformers

### Use `Chopper` when:
- You prefer declarative API definitions
- You want code generation for boilerplate reduction
- You need a structured approach to API clients
- You're building a client for a well-defined API

### Use `retrofit.dart` when:
- You want the best type safety
- You're using Dio and want a cleaner API
- You need all Dio features (interceptors, cancellation, etc.)
- You're familiar with Retrofit from Android/Java

### Use `dart:io HttpClient` when:
- You need fine-grained control over TLS/SSL
- You want to configure certificate validation
- You need socket-level control
- You're implementing custom protocols
- You need precise connection pooling control

## Additional Resources

- [package:http documentation](https://pub.dev/packages/http)
- [Dio documentation](https://pub.dev/packages/dio)
- [Chopper documentation](https://pub.dev/packages/chopper)
- [retrofit.dart documentation](https://pub.dev/packages/retrofit)
- [HttpClient API reference](https://api.dart.dev/stable/dart-io/HttpClient-class.html)
