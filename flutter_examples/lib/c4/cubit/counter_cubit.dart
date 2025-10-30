import 'package:flutter_bloc/flutter_bloc.dart';

/// Cubit that manages counter state
///
/// Cubit is a simpler version of BLoC:
/// - No events needed - just call methods directly
/// - Methods directly emit new states
/// - Less boilerplate than BLoC
/// - Perfect for simple state management
class CounterCubit extends Cubit<int> {
  // Initialize with count of 0
  CounterCubit() : super(0);

  /// Increment the counter by 1
  void increment() {
    emit(state + 1);
  }

  /// Decrement the counter by 1
  void decrement() {
    emit(state - 1);
  }

  /// Reset the counter to 0
  void reset() {
    emit(0);
  }

  /// Increment by a custom amount
  void incrementBy(int amount) {
    emit(state + amount);
  }

  /// Set counter to a specific value
  void setCount(int value) {
    emit(value);
  }
}
