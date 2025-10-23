// Dio example with interceptors, timeout, and advanced features
// Add to pubspec.yaml:
//   dependencies:
//     dio: ^5.4.0

import 'package:dio/dio.dart';

void main() async {
  await basicDioExample();
  await dioWithInterceptorsExample();
  await dioCancelTokenExample();
  await dioFormDataExample();
}

// Basic Dio with timeout
Future<void> basicDioExample() async {
  print('=== Basic Dio Example ===');

  final dio = Dio(BaseOptions(
    connectTimeout: Duration(seconds: 10),
    receiveTimeout: Duration(seconds: 10),
    baseUrl: 'https://jsonplaceholder.typicode.com',
  ));

  try {
    final response = await dio.get('/posts/1');
    print('Status: ${response.statusCode}');
    print('Data: ${response.data}');
  } on DioException catch (e) {
    print('Error: ${e.type} - ${e.message}');
  }
}

// Dio with interceptors
Future<void> dioWithInterceptorsExample() async {
  print('\n=== Dio with Interceptors ===');

  final dio = Dio(BaseOptions(
    connectTimeout: Duration(seconds: 10),
    baseUrl: 'https://jsonplaceholder.typicode.com',
  ));

  // Add logging interceptor
  dio.interceptors.add(LogInterceptor(
    requestBody: true,
    responseBody: true,
    logPrint: (obj) => print(obj),
  ));

  // Add custom interceptor
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) {
      print('REQUEST[${options.method}] => ${options.uri}');
      // Add custom headers
      options.headers['X-Custom-Header'] = 'MyValue';
      handler.next(options);
    },
    onResponse: (response, handler) {
      print('RESPONSE[${response.statusCode}] => ${response.requestOptions.uri}');
      handler.next(response);
    },
    onError: (DioException e, handler) {
      print('ERROR[${e.response?.statusCode}] => ${e.requestOptions.uri}');
      handler.next(e);
    },
  ));

  try {
    final response = await dio.get('/users/1');
    print('User: ${response.data['name']}');
  } on DioException catch (e) {
    print('Error: ${e.message}');
  }
}

// Cancel token example
Future<void> dioCancelTokenExample() async {
  print('\n=== Dio CancelToken Example ===');

  final dio = Dio();
  final cancelToken = CancelToken();

  // Cancel after 100ms
  Future.delayed(Duration(milliseconds: 100), () {
    if (!cancelToken.isCancelled) {
      cancelToken.cancel('Request cancelled by user');
    }
  });

  try {
    final response = await dio.get(
      'https://jsonplaceholder.typicode.com/posts',
      cancelToken: cancelToken,
    );
    print('Response: ${response.data}');
  } on DioException catch (e) {
    if (e.type == DioExceptionType.cancel) {
      print('Request cancelled: ${e.message}');
    } else {
      print('Error: ${e.message}');
    }
  }
}

// FormData/Multipart example
Future<void> dioFormDataExample() async {
  print('\n=== Dio FormData Example ===');

  final dio = Dio();

  final formData = FormData.fromMap({
    'title': 'My Post',
    'body': 'This is the body',
    'userId': 1,
    // For file upload (commented as we don't have a file):
    // 'file': await MultipartFile.fromFile('./photo.jpg', filename: 'upload.jpg'),
  });

  try {
    final response = await dio.post(
      'https://jsonplaceholder.typicode.com/posts',
      data: formData,
    );
    print('Status: ${response.statusCode}');
    print('Created: ${response.data}');
  } on DioException catch (e) {
    print('Error: ${e.message}');
  }
}

// Response transformer example
class CustomTransformer extends BackgroundTransformer {
  @override
  Future<String> transformResponse(
    RequestOptions options,
    ResponseBody response,
  ) async {
    final result = await super.transformResponse(options, response);
    print('Custom transformation applied');
    return result;
  }
}
