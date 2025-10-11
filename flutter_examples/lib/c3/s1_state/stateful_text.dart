import 'package:flutter/material.dart';

class StatelessText extends StatefulWidget {
  const StatelessText({super.key});

  @override
  State<StatelessText> createState() => _StatelessTextState();
}

class _StatelessTextState extends State<StatelessText> {
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
