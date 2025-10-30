import 'package:equatable/equatable.dart';

/// Represents the state of the counter
/// Without equatable
// class CounterState {
//   final int count;
//
//   const CounterState(this.count);
//
//   @override
//   bool operator ==(Object other) =>
//       identical(this, other) ||
//       other is CounterState &&
//           runtimeType == other.runtimeType &&
//           count == other.count;
//
//   @override
//   int get hashCode => count.hashCode;
// }

class CounterState extends Equatable{
  final int count;

  const CounterState(this.count);

  @override
  List<Object?> get props => [count];
}
