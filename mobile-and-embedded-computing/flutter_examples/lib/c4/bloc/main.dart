import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'counter_bloc.dart';
import 'counter_page.dart';

/// Main entry point for the BLoC pattern example
///
/// To run this example:
/// 1. Make sure flutter_bloc is in your pubspec.yaml dependencies
/// 2. Run: flutter pub get
/// 3. Run: flutter run
///
/// The BLoC (Business Logic Component) pattern:
/// - Separates business logic from UI
/// - Uses events to represent user actions
/// - Uses states to represent UI state
/// - Provides predictable state management
/// - Easy to test business logic independently
void main() {
  runApp(const BlocExampleApp());
}

class BlocExampleApp extends StatelessWidget {
  const BlocExampleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BLoC Pattern Example',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blue,
        useMaterial3: true,
      ),
      // BlocProvider makes the CounterBloc available to all child widgets
      home: BlocProvider(
        create: (context) => CounterBloc(),
        child: const CounterPage(),
      ),
    );
  }
}
