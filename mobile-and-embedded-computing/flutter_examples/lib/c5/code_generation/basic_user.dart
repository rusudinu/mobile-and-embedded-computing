import 'package:json_annotation/json_annotation.dart';

// This tells the code generator to create the serialization code
part 'basic_user.g.dart';

/// Basic example of json_serializable
/// Demonstrates simple field mapping and automatic serialization
@JsonSerializable()
class BasicUser {
  final String id;
  final String name;
  final String email;
  final int age;
  final bool isActive;

  BasicUser({
    required this.id,
    required this.name,
    required this.email,
    required this.age,
    required this.isActive,
  });

  /// A necessary factory constructor for creating a new BasicUser instance
  /// from a map. Pass the map to the generated `_$BasicUserFromJson()` constructor.
  factory BasicUser.fromJson(Map<String, dynamic> json) =>
      _$BasicUserFromJson(json);

  /// `toJson` is the convention for a class to declare support for serialization
  /// to JSON. The implementation simply calls the private, generated
  /// helper method `_$BasicUserToJson`.
  Map<String, dynamic> toJson() => _$BasicUserToJson(this);

  @override
  String toString() {
    return 'BasicUser(id: $id, name: $name, email: $email, age: $age, isActive: $isActive)';
  }
}

// Example usage:
void basicUserExample() {
  print('\n=== Basic User Example ===');

  // Creating a user from JSON
  final jsonString = {
    'id': '123',
    'name': 'John Doe',
    'email': 'john@example.com',
    'age': 30,
    'isActive': true,
  };

  final user = BasicUser.fromJson(jsonString);
  print('User from JSON: $user');

  // Converting user to JSON
  final userJson = user.toJson();
  print('User to JSON: $userJson');

  // Creating a user and serializing it
  final newUser = BasicUser(
    id: '456',
    name: 'Jane Smith',
    email: 'jane@example.com',
    age: 28,
    isActive: false,
  );
  print('New user to JSON: ${newUser.toJson()}');
}
