import 'package:flutter/material.dart';
import 'package:equatable/equatable.dart';

void main() {
  runApp(const EquatableApp());
}

class EquatableApp extends StatelessWidget {
  const EquatableApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: EquatablePage(),
    );
  }
}

class StandardPerson {
  final String name;
  final int age;

  StandardPerson(this.name, this.age);
}

class EquatablePerson extends Equatable {
  final String name;
  final int age;

  const EquatablePerson(this.name, this.age);

  @override
  List<Object?> get props => [name, age];
}

class EquatablePage extends StatefulWidget {
  const EquatablePage({super.key});

  @override
  State<EquatablePage> createState() => _EquatablePageState();
}

class _EquatablePageState extends State<EquatablePage> {
  String _standardResult = '';
  String _equatableResult = '';

  void _compareStandard() {
    final person1 = StandardPerson('Alice', 30);
    final person2 = StandardPerson('Alice', 30);
    final isEqual = person1 == person2;

    setState(() {
      _standardResult = 'person1 == person2 is $isEqual';
    });
  }

  void _compareEquatable() {
    const person1 = EquatablePerson('Alice', 30);
    const person2 = EquatablePerson('Alice', 30);
    final isEqual = person1 == person2;

    setState(() {
      _equatableResult = 'person1 == person2 is $isEqual';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Equatable Example')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Without Equatable',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: _compareStandard,
              child: const Text('Compare Standard Person'),
            ),
            const SizedBox(height: 10),
            Text(
              _standardResult,
              style: const TextStyle(fontSize: 16, color: Colors.blue),
            ),
            const Divider(height: 40),
            const Text(
              'With Equatable',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            ElevatedButton(
              onPressed: _compareEquatable,
              child: const Text('Compare Equatable Person'),
            ),
            const SizedBox(height: 10),
            Text(
              _equatableResult,
              style: const TextStyle(fontSize: 16, color: Colors.blue),
            ),
          ],
        ),
      ),
    );
  }
}
