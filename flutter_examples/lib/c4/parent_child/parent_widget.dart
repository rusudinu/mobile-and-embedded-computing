import 'package:flutter/material.dart';
import 'package:flutter_examples/c4/parent_child/child_widget.dart';

class ParentWidget extends StatefulWidget {
  const ParentWidget({super.key});

  @override
  ParentWidgetState createState() => ParentWidgetState();
}

class ParentWidgetState extends State<ParentWidget> {
  bool _active = false;

  void _handleTapboxChanged(bool newValue) {
    setState(() {
      _active = newValue;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      child: ChildWidget(
        active: _active,
        onChanged: _handleTapboxChanged,
      ),
    );
  }
}
