import 'package:flutter/material.dart';
import 'hello_world/main.dart' as hello;
import 'basic_widgets/main.dart' as basic;
import 'stateful_widget/main.dart' as stateful;
import 'navigation/main.dart' as nav;
import 'list/main.dart' as list;

void main() {
  runApp(const AppSwitcher());
}

class AppSwitcher extends StatelessWidget {
  const AppSwitcher({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: HomePage(),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Flutter Basics Topics')),
      body: ListView(
        children: [
          ListTile(
            title: const Text('1. Hello World'),
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const hello.HelloWorldApp()),
              );
            },
          ),
          ListTile(
            title: const Text('2. Basic Widgets'),
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const basic.BasicWidgetsApp()),
              );
            },
          ),
          ListTile(
            title: const Text('3. Stateful Widget'),
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const stateful.StatefulApp()),
              );
            },
          ),
          ListTile(
            title: const Text('4. Navigation'),
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const nav.NavigationApp()),
              );
            },
          ),
          ListTile(
            title: const Text('5. ListView'),
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const list.ListApp()),
              );
            },
          ),
        ],
      ),
    );
  }
}
