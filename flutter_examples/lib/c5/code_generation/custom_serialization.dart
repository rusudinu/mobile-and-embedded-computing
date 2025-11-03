import 'package:json_annotation/json_annotation.dart';

part 'custom_serialization.g.dart';

/// Custom JSON converter for temperature
/// Converts between Celsius and Fahrenheit
class TemperatureConverter implements JsonConverter<double, double> {
  const TemperatureConverter();

  @override
  double fromJson(double json) {
    // Convert Fahrenheit to Celsius
    return (json - 32) * 5 / 9;
  }

  @override
  double toJson(double object) {
    // Convert Celsius to Fahrenheit
    return (object * 9 / 5) + 32;
  }
}

/// Example demonstrating custom field names and converters
/// Shows how to map JSON keys to different Dart property names
/// and use custom conversion logic
@JsonSerializable()
class Product {
  // Use @JsonKey to customize field mapping
  @JsonKey(name: 'product_id')
  final String id;

  @JsonKey(name: 'product_name')
  final String name;

  // Custom field name with default value
  @JsonKey(name: 'unit_price', defaultValue: 0.0)
  final double price;

  // Field that should be excluded from JSON
  @JsonKey(includeFromJson: false, includeToJson: false)
  final String? internalNotes;

  // Field only included when serializing to JSON
  @JsonKey(includeFromJson: false)
  final DateTime createdAt;

  // Field only included when deserializing from JSON
  @JsonKey(includeToJson: false)
  final String? importSource;

  // Custom converter for temperature (stored in Celsius, transmitted in Fahrenheit)
  @JsonKey(name: 'storage_temp')
  @TemperatureConverter()
  final double? storageTemperature;

  // Field with custom default value if null
  @JsonKey(defaultValue: 'Unknown')
  final String category;

  // Nullable field
  @JsonKey(name: 'description')
  final String? description;

  Product({
    required this.id,
    required this.name,
    required this.price,
    this.internalNotes,
    DateTime? createdAt,
    this.importSource,
    this.storageTemperature,
    required this.category,
    this.description,
  }) : createdAt = createdAt ?? DateTime.now();

  factory Product.fromJson(Map<String, dynamic> json) =>
      _$ProductFromJson(json);

  Map<String, dynamic> toJson() => _$ProductToJson(this);

  @override
  String toString() {
    return 'Product(id: $id, name: $name, price: \$$price, '
        'category: $category, storageTemp: ${storageTemperature?.toStringAsFixed(1)}°C, '
        'description: $description, createdAt: $createdAt)';
  }
}

/// Example with explicit JSON conversion configuration
@JsonSerializable(
  explicitToJson: true,
  fieldRename: FieldRename.snake, // Automatically convert camelCase to snake_case
  includeIfNull: false, // Don't include null fields in JSON
)
class ApiResponse {
  final bool success;
  final String message;
  final int? statusCode;
  final DateTime timestamp;
  final Map<String, dynamic>? metadata;

  ApiResponse({
    required this.success,
    required this.message,
    this.statusCode,
    DateTime? timestamp,
    this.metadata,
  }) : timestamp = timestamp ?? DateTime.now();

  factory ApiResponse.fromJson(Map<String, dynamic> json) =>
      _$ApiResponseFromJson(json);

  Map<String, dynamic> toJson() => _$ApiResponseToJson(this);

  @override
  String toString() {
    return 'ApiResponse(success: $success, message: $message, '
        'statusCode: $statusCode, timestamp: $timestamp, metadata: $metadata)';
  }
}

// Example usage:
void customSerializationExample() {
  print('\n=== Custom Serialization Example ===');

  // JSON with different field names
  final productJson = {
    'product_id': 'prod-123',
    'product_name': 'Ice Cream',
    'unit_price': 4.99,
    'storage_temp': 14.0, // Fahrenheit
    'category': 'Frozen Food',
    'description': 'Delicious vanilla ice cream',
    'import_source': 'API Import', // This will be read but not written back
  };

  final product = Product.fromJson(productJson);
  print('Product from JSON: $product');
  print('Storage temperature in Celsius: ${product.storageTemperature?.toStringAsFixed(1)}°C');

  // When converting back to JSON, field names are mapped back
  final productToJson = product.toJson();
  print('\nProduct to JSON:');
  productToJson.forEach((key, value) {
    print('  $key: $value');
  });
  print('Note: internalNotes and importSource are excluded from JSON');
  print('Note: storage_temp is converted back to Fahrenheit: ${productToJson['storage_temp']}°F');

  // Example with missing optional fields
  final minimalProduct = Product.fromJson({
    'product_id': 'prod-456',
    'product_name': 'Mystery Product',
  });
  print('\nMinimal product: $minimalProduct');
  print('Minimal product JSON: ${minimalProduct.toJson()}');

  // ApiResponse example with snake_case conversion
  print('\n=== API Response Example (snake_case) ===');

  final apiResponseJson = {
    'success': true,
    'message': 'Operation completed successfully',
    'status_code': 200,
    'timestamp': DateTime.now().toIso8601String(),
    'metadata': {
      'request_id': 'req-789',
      'processing_time': 150,
    },
  };

  final apiResponse = ApiResponse.fromJson(apiResponseJson);
  print('API Response: $apiResponse');
  print('API Response to JSON: ${apiResponse.toJson()}');

  // Example without status_code (null fields excluded)
  final simpleResponse = ApiResponse(
    success: true,
    message: 'Simple response',
  );
  print('\nSimple response (nulls excluded): ${simpleResponse.toJson()}');
}
