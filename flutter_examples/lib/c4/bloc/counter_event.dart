/// Base class for all counter events
abstract class CounterEvent {}

/// Event to increment the counter
class IncrementEvent extends CounterEvent {}

/// Event to decrement the counter
class DecrementEvent extends CounterEvent {}

/// Event to reset the counter to zero
class ResetEvent extends CounterEvent {}
