// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'chopper_example.dart';

// **************************************************************************
// ChopperGenerator
// **************************************************************************

// coverage:ignore-file
// ignore_for_file: type=lint
final class _$PostService extends PostService {
  _$PostService([ChopperClient? client]) {
    if (client == null) return;
    this.client = client;
  }

  @override
  final Type definitionType = PostService;

  @override
  Future<Response<PostModel>> getPost(int id) {
    final Uri $url = Uri.parse('/posts/${id}');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
    );
    return client.send<PostModel, PostModel>($request);
  }

  @override
  Future<Response<List<PostModel>>> getPosts() {
    final Uri $url = Uri.parse('/posts');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
    );
    return client.send<List<PostModel>, PostModel>($request);
  }

  @override
  Future<Response<PostModel>> createPost(PostModel post) {
    final Uri $url = Uri.parse('/posts');
    final $body = post;
    final Request $request = Request(
      'POST',
      $url,
      client.baseUrl,
      body: $body,
    );
    return client.send<PostModel, PostModel>($request);
  }

  @override
  Future<Response<PostModel>> updatePost(
    int id,
    PostModel post,
  ) {
    final Uri $url = Uri.parse('/posts/${id}');
    final $body = post;
    final Request $request = Request(
      'PUT',
      $url,
      client.baseUrl,
      body: $body,
    );
    return client.send<PostModel, PostModel>($request);
  }

  @override
  Future<Response<void>> deletePost(int id) {
    final Uri $url = Uri.parse('/posts/${id}');
    final Request $request = Request(
      'DELETE',
      $url,
      client.baseUrl,
    );
    return client.send<void, void>($request);
  }

  @override
  Future<Response<List<PostModel>>> getPostsWithHeaders() {
    final Uri $url = Uri.parse('/posts');
    final Map<String, String> $headers = {
      'Custom-Header': 'Value',
    };
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
      headers: $headers,
    );
    return client.send<List<PostModel>, PostModel>($request);
  }
}
