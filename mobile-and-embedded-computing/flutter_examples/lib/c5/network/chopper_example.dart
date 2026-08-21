// Chopper - Declarative API client with code generation
// Add to pubspec.yaml:
//   dependencies:
//     chopper: ^7.1.0
//   dev_dependencies:
//     build_runner: ^2.4.0
//     chopper_generator: ^7.1.0
//
// Run: dart run build_runner build
// Or: dart run build_runner watch

import 'dart:async';
import 'package:chopper/chopper.dart';

// The generated code will be in chopper_example.chopper.dart
part 'chopper_example.chopper.dart';

// Define the API service
@ChopperApi(baseUrl: '/posts')
abstract class PostService extends ChopperService {
  // Factory to create the service
  static PostService create([ChopperClient? client]) {
    return _$PostService(client);
  }

  @Get(path: '/{id}')
  Future<Response<PostModel>> getPost(@Path('id') int id);

  @Get()
  Future<Response<List<PostModel>>> getPosts();

  @Post()
  Future<Response<PostModel>> createPost(@Body() PostModel post);

  @Put(path: '/{id}')
  Future<Response<PostModel>> updatePost(
    @Path('id') int id,
    @Body() PostModel post,
  );

  @Delete(path: '/{id}')
  Future<Response<void>> deletePost(@Path('id') int id);

  @Get(path: '', headers: {'Custom-Header': 'Value'})
  Future<Response<List<PostModel>>> getPostsWithHeaders();
}

// Model class
class PostModel {
  final int? id;
  final String title;
  final String body;
  final int userId;

  PostModel({
    this.id,
    required this.title,
    required this.body,
    required this.userId,
  });

  factory PostModel.fromJson(Map<String, dynamic> json) {
    return PostModel(
      id: json['id'] as int?,
      title: json['title'] as String,
      body: json['body'] as String,
      userId: json['userId'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'title': title,
      'body': body,
      'userId': userId,
    };
  }
}

// JSON converter for PostModel
class PostConverter extends JsonConverter {
  @override
  FutureOr<Response<BodyType>> convertResponse<BodyType, InnerType>(Response response) {
    if (response.body is Map) {
      return response.copyWith<BodyType>(
        body: PostModel.fromJson(response.body as Map<String, dynamic>) as BodyType,
      );
    }

    if (response.body is List) {
      final posts = (response.body as List)
          .map((item) => PostModel.fromJson(item as Map<String, dynamic>))
          .toList();
      return response.copyWith<BodyType>(body: posts as BodyType);
    }

    return super.convertResponse<BodyType, InnerType>(response);
  }
}

void main() async {
  // Create Chopper client
  final chopper = ChopperClient(
    baseUrl: Uri.parse('https://jsonplaceholder.typicode.com'),
    services: [
      PostService.create(),
    ],
    converter: PostConverter(),
    interceptors: [
      HttpLoggingInterceptor(),
      // Add custom interceptor
      (Request request) async {
        print('Request: ${request.method} ${request.url}');
        return request;
      },
    ],
  );

  final postService = chopper.getService<PostService>();

  // Get a single post
  print('=== Get Single Post ===');
  final singlePostResponse = await postService.getPost(1);
  if (singlePostResponse.isSuccessful) {
    final post = singlePostResponse.body!;
    print('Post: ${post.title}');
  }

  // Get all posts
  print('\n=== Get All Posts ===');
  final postsResponse = await postService.getPosts();
  if (postsResponse.isSuccessful) {
    print('Fetched ${postsResponse.body!.length} posts');
  }

  // Create a post
  print('\n=== Create Post ===');
  final newPost = PostModel(
    title: 'New Post',
    body: 'This is a new post',
    userId: 1,
  );
  final createResponse = await postService.createPost(newPost);
  if (createResponse.isSuccessful) {
    print('Created post with ID: ${createResponse.body!.id}');
  }

  // Update a post
  print('\n=== Update Post ===');
  final updatedPost = PostModel(
    id: 1,
    title: 'Updated Title',
    body: 'Updated body',
    userId: 1,
  );
  final updateResponse = await postService.updatePost(1, updatedPost);
  if (updateResponse.isSuccessful) {
    print('Updated post: ${updateResponse.body!.title}');
  }

  // Delete a post
  print('\n=== Delete Post ===');
  final deleteResponse = await postService.deletePost(1);
  if (deleteResponse.isSuccessful) {
    print('Post deleted successfully');
  }

  // Dispose
  chopper.dispose();
}
