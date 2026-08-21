import 'package:flutter/material.dart';

void main() {
  runApp(const BasicWidgetsApp());
}

class BasicWidgetsApp extends StatelessWidget {
  const BasicWidgetsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      home: Scaffold(
        appBar: AppBar(title: const Text('Basic Widgets')),
        body: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(8.0),
                color: Colors.blue,
                child: const Text(
                  'Container Widget',
                  style: TextStyle(color: Colors.white, fontSize: 20),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 20),
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Icon(Icons.star, color: Colors.amber, size: 40),
                  Icon(Icons.favorite, color: Colors.red, size: 40),
                  Icon(Icons.thumb_up, color: Colors.blue, size: 40),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
