import 'package:flutter/material.dart';

class StatefulText extends StatefulWidget {
  const StatefulText({super.key});

  @override
  State<StatefulText> createState() => _StatefulTextState();
}

class _StatefulTextState extends State<StatefulText> {
  int count = 0;

  void increment() {
    setState(() {
      count++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: increment,
      child: Text('Hello Flutter, the count is: $count'),
    );
  }
}
