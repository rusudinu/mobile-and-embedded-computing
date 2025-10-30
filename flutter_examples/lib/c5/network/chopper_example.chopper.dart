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
  Future<Response<Post>> getPost(int id) {
    final Uri $url = Uri.parse('/posts/${id}');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
    );
    return client.send<Post, Post>($request);
  }

  @override
  Future<Response<List<Post>>> getPosts() {
    final Uri $url = Uri.parse('/posts');
    final Request $request = Request(
      'GET',
      $url,
      client.baseUrl,
    );
    return client.send<List<Post>, Post>($request);
  }

  @override
  Future<Response<Post>> updatePost(
    int id,
    Post post,
  ) {
    final Uri $url = Uri.parse('/posts/${id}');
    final $body = post;
    final Request $request = Request(
      'PUT',
      $url,
      client.baseUrl,
      body: $body,
    );
    return client.send<Post, Post>($request);
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
  Future<Response<List<Post>>> getPostsWithHeaders() {
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
    return client.send<List<Post>, Post>($request);
  }
}
