# JSON Serializable Code Generation Examples

This folder contains comprehensive examples demonstrating how to use `json_serializable` for automatic JSON serialization in Flutter/Dart.

## Overview

`json_serializable` is a code generation library that automatically creates `fromJson()` and `toJson()` methods for your Dart classes, eliminating the need to write boilerplate serialization code manually.

## Prerequisites

The following dependencies are already in `pubspec.yaml`:

```yaml
dependencies:
  json_annotation: ^4.8.0

dev_dependencies:
  build_runner: ^2.4.0
  json_serializable: ^6.7.0
```

## Examples Included

### 1. **basic_user.dart** - Basic Serialization
- Simple class with primitive types
- Basic `fromJson()` and `toJson()` implementation
- Shows the fundamental pattern for json_serializable

**Key concepts:**
- `@JsonSerializable()` annotation
- `part` directive for generated code
- Factory constructor pattern
- `toJson()` method

### 2. **nested_models.dart** - Nested Objects
- Complex nested object structures
- Lists and Maps serialization
- Multiple related classes

**Key concepts:**
- Nested object serialization
- `List<String>` and `Map<String, int>` handling
- Automatic recursive serialization

### 3. **custom_serialization.dart** - Advanced Features
- Custom field name mapping with `@JsonKey(name: '...')`
- Custom type converters (TemperatureConverter example)
- Include/exclude fields from JSON
- Default values
- Field rename strategies (snake_case, camelCase)

**Key concepts:**
- `@JsonKey` annotations
- `JsonConverter` implementation
- `includeFromJson` and `includeToJson` options
- `fieldRename` strategies
- `includeIfNull` configuration

### 4. **enums_and_datetime.dart** - Enums and DateTime
- Enum serialization with default and custom values
- DateTime handling (ISO 8601 format)
- Custom DateTime converters (epoch time)
- Multiple enum types

**Key concepts:**
- `@JsonEnum` annotation
- `@JsonValue` for custom enum values
- DateTime serialization
- Custom `EpochDateTimeConverter`

## How to Use

### Step 1: Generate Code

Before running any examples, you need to generate the serialization code:

```bash
# Generate code once
flutter pub run build_runner build

# Or watch for changes (recommended during development)
flutter pub run build_runner watch

# Delete conflicting outputs before generating
flutter pub run build_runner build --delete-conflicting-outputs
```

This will create `.g.dart` files for each model:
- `basic_user.g.dart`
- `nested_models.g.dart`
- `custom_serialization.g.dart`
- `enums_and_datetime.g.dart`

### Step 2: Run Examples

```bash
# Run all examples
dart lib/c5/code_generation/main_example.dart

# Or run individual example files
dart lib/c5/code_generation/basic_user.dart
```

## Creating Your Own Models

### Basic Template

```dart
import 'package:json_annotation/json_annotation.dart';

// This is required - points to the generated file
part 'your_model.g.dart';

@JsonSerializable()
class YourModel {
  final String field1;
  final int field2;

  YourModel({
    required this.field1,
    required this.field2,
  });

  // Factory constructor for deserialization
  factory YourModel.fromJson(Map<String, dynamic> json) =>
      _$YourModelFromJson(json);

  // Method for serialization
  Map<String, dynamic> toJson() => _$YourModelToJson(this);
}
```

### Common Annotations

#### @JsonSerializable Options
```dart
@JsonSerializable(
  explicitToJson: true,           // Explicitly convert nested objects
  fieldRename: FieldRename.snake,  // Convert field names to snake_case
  includeIfNull: false,            // Exclude null values from JSON
  createToJson: true,              // Generate toJson method
  createFactory: true,             // Generate fromJson factory
)
```

#### @JsonKey Options
```dart
@JsonKey(
  name: 'custom_name',           // Custom JSON key name
  defaultValue: 'default',       // Default value if null
  includeFromJson: true,         // Include when deserializing
  includeToJson: true,           // Include when serializing
  required: true,                // Field is required
  disallowNullValue: true,       // Throw error if null
)
```

### Custom Converters

```dart
class CustomConverter implements JsonConverter<DartType, JsonType> {
  const CustomConverter();

  @override
  DartType fromJson(JsonType json) {
    // Convert JSON to Dart
  }

  @override
  JsonType toJson(DartType object) {
    // Convert Dart to JSON
  }
}

// Usage:
@JsonSerializable()
class MyClass {
  @CustomConverter()
  final DartType myField;
}
```

## Common Commands

```bash
# Generate code
flutter pub run build_runner build

# Watch and regenerate on changes
flutter pub run build_runner watch

# Clean generated files
flutter pub run build_runner clean

# Force rebuild (delete conflicting outputs)
flutter pub run build_runner build --delete-conflicting-outputs
```

## Best Practices

1. **Always generate code before running** - The `.g.dart` files are not committed to version control
2. **Use const constructors** where possible for better performance
3. **Add toString() methods** for better debugging
4. **Use explicit types** instead of dynamic when possible
5. **Handle nullable fields** appropriately with `?` operator
6. **Document your models** with clear comments
7. **Use enums** instead of strings for fixed value sets
8. **Create custom converters** for complex type transformations

## Troubleshooting

### "Missing part 'file.g.dart'" Error
- Run `flutter pub run build_runner build` to generate the file

### "Conflicting outputs" Error
- Run `flutter pub run build_runner build --delete-conflicting-outputs`

### Changes Not Reflected
- Make sure build_runner has completed successfully
- Try running with `--delete-conflicting-outputs` flag
- Check that the `part` directive matches your file name

### Type Errors
- Ensure all nested classes also have `@JsonSerializable` annotation
- Check that custom converters match the expected types
