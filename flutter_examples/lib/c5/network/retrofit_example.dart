// Retrofit.dart - Type-safe HTTP client with annotations and code generation
// Add to pubspec.yaml:
//   dependencies:
//     dio: ^5.4.0
//     retrofit: ^4.0.0
//     json_annotation: ^4.8.0
//   dev_dependencies:
//     build_runner: ^2.4.0
//     retrofit_generator: ^8.0.0
//     json_serializable: ^6.7.0
//
// Run: dart run build_runner build
// Or: dart run build_runner watch

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import 'package:json_annotation/json_annotation.dart';

part 'retrofit_example.g.dart';

// Model with json_serializable
@JsonSerializable()
class Item {
  final int? id;
  final String title;
  final String body;
  @JsonKey(name: 'userId')
  final int userId;

  Item({
    this.id,
    required this.title,
    required this.body,
    required this.userId,
  });

  factory Item.fromJson(Map<String, dynamic> json) => _$ItemFromJson(json);
  Map<String, dynamic> toJson() => _$ItemToJson(this);
}

@JsonSerializable()
class User {
  final int id;
  final String name;
  final String email;
  final String phone;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}

// API Interface
@RestApi(baseUrl: 'https://jsonplaceholder.typicode.com')
abstract class Api {
  factory Api(Dio dio, {String baseUrl}) = _Api;

  // GET request
  @GET('/posts/{id}')
  Future<Item> getItem(@Path('id') int id);

  // GET request with query parameters
  @GET('/posts')
  Future<List<Item>> getItems({
    @Query('userId') int? userId,
    @Query('_limit') int? limit,
  });

  // POST request
  @POST('/posts')
  Future<Item> createItem(@Body() Item item);

  // PUT request
  @PUT('/posts/{id}')
  Future<Item> updateItem(
    @Path('id') int id,
    @Body() Item item,
  );

  // PATCH request
  @PATCH('/posts/{id}')
  Future<Item> patchItem(
    @Path('id') int id,
    @Body() Map<String, dynamic> data,
  );

  // DELETE request
  @DELETE('/posts/{id}')
  Future<void> deleteItem(@Path('id') int id);

  // GET with custom headers
  @GET('/users/{id}')
  @Headers(<String, String>{
    'Accept': 'application/json',
    'Custom-Header': 'MyValue',
  })
  Future<User> getUser(@Path('id') int id);

  // Multiple query parameters
  @GET('/posts')
  Future<List<Item>> searchPosts(
    @Query('q') String query,
    @Query('_sort') String? sortBy,
    @Query('_order') String? order,
  );

  // Response with HttpResponse for access to headers and status
  @GET('/posts/{id}')
  Future<HttpResponse<Item>> getItemWithResponse(@Path('id') int id);
}

void main() async {
  // Create Dio instance with configuration
  final dio = Dio(BaseOptions(
    connectTimeout: Duration(seconds: 10),
    receiveTimeout: Duration(seconds: 10),
  ));

  // Add interceptors
  dio.interceptors.add(LogInterceptor(
    requestBody: true,
    responseBody: true,
  ));

  // Create API client
  final api = Api(dio);

  // Get single item
  print('=== Get Item ===');
  try {
    final item = await api.getItem(1);
    print('Item: ${item.title}');
  } catch (e) {
    print('Error: $e');
  }

  // Get items with query parameters
  print('\n=== Get Items with Query ===');
  try {
    final items = await api.getItems(userId: 1, limit: 5);
    print('Fetched ${items.length} items');
  } catch (e) {
    print('Error: $e');
  }

  // Create item
  print('\n=== Create Item ===');
  try {
    final newItem = Item(
      title: 'New Post',
      body: 'This is a new post',
      userId: 1,
    );
    final created = await api.createItem(newItem);
    print('Created item with ID: ${created.id}');
  } catch (e) {
    print('Error: $e');
  }

  // Update item
  print('\n=== Update Item ===');
  try {
    final updated = Item(
      id: 1,
      title: 'Updated Title',
      body: 'Updated body',
      userId: 1,
    );
    final result = await api.updateItem(1, updated);
    print('Updated: ${result.title}');
  } catch (e) {
    print('Error: $e');
  }

  // Patch item
  print('\n=== Patch Item ===');
  try {
    final patched = await api.patchItem(1, {'title': 'Patched Title'});
    print('Patched: ${patched.title}');
  } catch (e) {
    print('Error: $e');
  }

  // Get user with custom headers
  print('\n=== Get User ===');
  try {
    final user = await api.getUser(1);
    print('User: ${user.name} (${user.email})');
  } catch (e) {
    print('Error: $e');
  }

  // Search posts
  print('\n=== Search Posts ===');
  try {
    final results = await api.searchPosts('sunt', sortBy: 'id', order: 'desc');
    print('Found ${results.length} posts');
  } catch (e) {
    print('Error: $e');
  }

  // Get with HttpResponse
  print('\n=== Get with HttpResponse ===');
  try {
    final response = await api.getItemWithResponse(1);
    print('Status: ${response.response.statusCode}');
    print('Headers: ${response.response.headers}');
    print('Data: ${response.data.title}');
  } catch (e) {
    print('Error: $e');
  }

  // Delete item
  print('\n=== Delete Item ===');
  try {
    await api.deleteItem(1);
    print('Item deleted successfully');
  } catch (e) {
    print('Error: $e');
  }
}
