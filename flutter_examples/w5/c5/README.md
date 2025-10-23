# Week 5 - Lecture 5 Examples

Comprehensive examples for Flutter HTTP networking, including HTTP libraries, retry patterns, and hedging strategies.

## Directory Structure

```
c5/
├── network/          # HTTP library examples
├── retries/          # Retry pattern implementations
├── hedging/          # Request hedging patterns
├── pubspec.yaml      # Package dependencies
└── README.md         # This file
```

## Installation

### 1. Install Dependencies

```bash
cd w5/c5
dart pub get
```

### 2. Generate Code (for Chopper and Retrofit)

Some examples use code generation. Run this to generate the necessary files:

```bash
dart run build_runner build
```

Or watch for changes:

```bash
dart run build_runner watch
```

## Topics Covered

### 1. Network - HTTP Libraries
Compare different HTTP libraries available in Flutter/Dart:

- **package:http**: Simple, composable HTTP client with RetryClient
- **Dio**: Feature-rich with interceptors, cancel tokens, transformers
- **Chopper**: Declarative API client with code generation
- **retrofit.dart**: Type-safe REST API with annotations (built on Dio)
- **dart:io HttpClient**: Low-level HTTP with TLS/socket control

**Navigate to:** `network/`

**Run examples:**
```bash
dart run network/http_example.dart
dart run network/dio_example.dart
dart run network/chopper_example.dart        # After code generation
dart run network/retrofit_example.dart       # After code generation
dart run network/http_client_example.dart
```

### 2. Retries - Retry Patterns
Implement retry logic for handling transient failures:

- **Manual retries**: Full control with error classification and jitter
- **RetryClient** (package:http): Library-based retries
- **Dio interceptors**: Custom retry logic with Dio
- **Jitter strategies**: Decorrelated, exponential, full jitter

**Navigate to:** `retries/`

**Run examples:**
```bash
dart run retries/manual_retry.dart
dart run retries/retry_client_example.dart
dart run retries/dio_retry_interceptor.dart
dart run retries/jitter_strategies.dart
```

### 3. Hedging - Request Hedging
Reduce tail latencies by firing redundant requests:

- **Basic hedging**: Fire second request after delay
- **Advanced patterns**: Adaptive, load-balanced, budget-based
- **Performance analysis**: Measure effectiveness and cost

**Navigate to:** `hedging/`

**Run examples:**
```bash
dart run hedging/hedging_example.dart
dart run hedging/advanced_hedging.dart
dart run hedging/hedging_analysis.dart
```

## Quick Start

### Example 1: Simple HTTP Request
```bash
dart run network/http_example.dart
```

### Example 2: Retry with Error Classification
```bash
dart run retries/manual_retry.dart
```

### Example 3: Hedged Request
```bash
dart run hedging/hedging_example.dart
```

## Dependencies

All required dependencies are in `pubspec.yaml`:

```yaml
dependencies:
  http: ^1.1.0              # Simple HTTP client
  dio: ^5.4.0               # Feature-rich HTTP client
  chopper: ^7.1.0           # Declarative API client
  retrofit: ^4.0.0          # Type-safe REST API client
  json_annotation: ^4.8.0   # JSON serialization

dev_dependencies:
  build_runner: ^2.4.0           # Code generation
  chopper_generator: ^7.1.0      # Chopper code gen
  retrofit_generator: ^8.0.0     # Retrofit code gen
  json_serializable: ^6.7.0      # JSON serialization
```

## Code Generation

Some examples use code generation (Chopper, Retrofit). The generated files will be created with `.g.dart` or `.chopper.dart` extensions.

**To generate:**
```bash
dart run build_runner build
```

**To clean and rebuild:**
```bash
dart run build_runner build --delete-conflicting-outputs
```

## Testing Without Code Generation

If you want to run examples without code generation, use these:

**HTTP Libraries (no code gen needed):**
- `network/http_example.dart`
- `network/dio_example.dart`
- `network/http_client_example.dart`

**Retries (no code gen needed):**
- `retries/manual_retry.dart`
- `retries/retry_client_example.dart`
- `retries/dio_retry_interceptor.dart`
- `retries/jitter_strategies.dart`

**Hedging (no code gen needed):**
- `hedging/hedging_example.dart`
- `hedging/advanced_hedging.dart`
- `hedging/hedging_analysis.dart`

## Learning Path

### Beginner
1. Start with `network/http_example.dart` - Simple HTTP requests
2. Then `retries/manual_retry.dart` - Basic retry logic
3. Finally `hedging/hedging_example.dart` - Basic hedging

### Intermediate
1. `network/dio_example.dart` - Advanced HTTP features
2. `retries/retry_client_example.dart` - Library-based retries
3. `retries/jitter_strategies.dart` - Different backoff strategies
4. `hedging/advanced_hedging.dart` - Advanced hedging patterns

### Advanced
1. `network/chopper_example.dart` - Code generation with Chopper
2. `network/retrofit_example.dart` - Type-safe REST APIs
3. `retries/dio_retry_interceptor.dart` - Custom interceptors
4. `hedging/hedging_analysis.dart` - Performance analysis

## Key Concepts

### HTTP Libraries
**When to use each:**
- **package:http**: Simple apps, minimal dependencies
- **Dio**: Need interceptors, cancel tokens, advanced features
- **Chopper/Retrofit**: Prefer declarative APIs, code generation
- **HttpClient**: Need low-level control (TLS, sockets)

### Retries
**Key patterns:**
- Classify errors (5xx, 429, timeouts = retryable; 4xx = not)
- Use jitter to avoid thundering herd
- Set max retries and delay caps
- Choose jitter strategy (full, equal, decorrelated)

### Hedging
**When to use:**
- High latency variance (P95 >> P50)
- Idempotent operations only (GET requests)
- Tail latency matters (P95, P99)
- Extra request cost is acceptable

**Set delay to:** ~50-75% of P95 latency

## Common Issues

### Issue: Code generation fails
**Solution:**
```bash
dart pub get
dart run build_runner clean
dart run build_runner build --delete-conflicting-outputs
```

### Issue: Package conflicts
**Solution:**
```bash
dart pub upgrade --major-versions
```

### Issue: Examples not running
**Solution:**
```bash
# Make sure you're in the c5 directory
cd w5/c5
dart pub get

# Run with full path
dart run network/http_example.dart
```

## Additional Resources

- [package:http documentation](https://pub.dev/packages/http)
- [Dio documentation](https://pub.dev/packages/dio)
- [Chopper documentation](https://pub.dev/packages/chopper)
- [Retrofit documentation](https://pub.dev/packages/retrofit)
- [AWS Exponential Backoff](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
- [Google: The Tail at Scale](https://research.google/pubs/pub40801/)

## Summary

This directory contains production-ready examples of:
- ✓ 5 different HTTP libraries with complete examples
- ✓ Manual and library-based retry implementations
- ✓ Multiple jitter strategies (decorrelated, exponential, full)
- ✓ Request hedging patterns (basic, adaptive, load-balanced)
- ✓ Performance analysis and measurement tools

Each subdirectory has its own detailed README with specific examples and best practices.
