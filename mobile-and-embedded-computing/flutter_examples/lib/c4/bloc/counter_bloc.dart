import 'package:flutter_bloc/flutter_bloc.dart';
import 'counter_event.dart';
import 'counter_state.dart';

/// BLoC that manages counter state and handles counter events
///
/// The BLoC pattern separates business logic from UI by:
/// 1. Receiving events (user actions)
/// 2. Processing events with business logic
/// 3. Emitting new states based on events
class CounterBloc extends Bloc<CounterEvent, CounterState> {
  // Initialize with count of 0
  CounterBloc() : super(const CounterState(0)) {
    // Register event handlers
    on<IncrementEvent>(_onIncrement);
    on<DecrementEvent>(_onDecrement);
    on<ResetEvent>(_onReset);
  }

  /// Handler for increment event
  void _onIncrement(IncrementEvent event, Emitter<CounterState> emit) {
    emit(CounterState(state.count + 1));
  }

  /// Handler for decrement event
  void _onDecrement(DecrementEvent event, Emitter<CounterState> emit) {
    emit(CounterState(state.count - 1));
  }

  /// Handler for reset event
  void _onReset(ResetEvent event, Emitter<CounterState> emit) {
    emit(const CounterState(0));
  }
}
