import 'package:equatable/equatable.dart';
import 'package:flutter/material.dart';

// without equatable - and Flutter won't know
// that the state has changed
class CounterStateBad {
  final int count;
  CounterStateBad(this.count);
}

// with equatable - Flutter knows that the state has changed
class CounterState extends Equatable {
  final int count;
  const CounterState(this.count);

  @override
  List<Object> get props => [count];
}

