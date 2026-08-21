import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'counter_cubit.dart';
import 'counter_page.dart';

/// Main entry point for the Cubit pattern example
///
/// To run this example:
/// 1. Make sure flutter_bloc is in your pubspec.yaml dependencies
/// 2. Run: flutter pub get
/// 3. Run: flutter run
///
/// The Cubit pattern:
/// - Simpler alternative to BLoC
/// - No events - just call methods directly
/// - Methods emit new states
/// - Less boilerplate code
/// - Perfect for simple state management
/// - Still testable and maintainable
void main() {
  runApp(const CubitExampleApp());
}

class CubitExampleApp extends StatelessWidget {
  const CubitExampleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Cubit Pattern Example',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.purple,
        useMaterial3: true,
      ),
      // BlocProvider makes the CounterCubit available to all child widgets
      home: BlocProvider(
        create: (context) => CounterCubit(),
        child: const CounterPage(),
      ),
    );
  }
}
