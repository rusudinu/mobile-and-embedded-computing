import 'basic_user.dart';
import 'nested_models.dart';
import 'custom_serialization.dart';
import 'enums_and_datetime.dart';

/// Main example file that demonstrates all json_serializable features
///
/// To run these examples:
/// 1. First generate the code: flutter pub run build_runner build
/// 2. Then run: dart lib/c5/code_generation/main_example.dart
void main() {
  print('==============================================');
  print('JSON Serializable Code Generation Examples');
  print('==============================================');

  // Run all examples
  basicUserExample();
  nestedModelsExample();
  customSerializationExample();
  enumsAndDateTimeExample();

  print('\n==============================================');
  print('All examples completed successfully!');
  print('==============================================');
}
