import 'package:flutter/material.dart';

class ChildWidget extends StatelessWidget {
  final bool active;
  final ValueChanged<bool> onChanged;

  const ChildWidget({super.key, required this.active, required this.onChanged});

  void _handleTap() {
    onChanged(!active);
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _handleTap,
      child: Container(
        width: 150,
        height: 150,
        color: active ? Colors.green : Colors.grey,
        child: Center(
          child: Text(
            active ? 'Active' : 'Inactive',
            style: TextStyle(fontSize: 24, color: Colors.white),
          ),
        ),
      ),
    );
  }
}
