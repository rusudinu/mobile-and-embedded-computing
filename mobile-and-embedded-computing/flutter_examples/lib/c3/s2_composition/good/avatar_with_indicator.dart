import 'package:flutter/material.dart';

import 'online_indicator.dart';

class AvatarWithIndicator extends StatelessWidget {
  final String imageUrl;
  final bool isOnline;

  const AvatarWithIndicator({super.key,
    required this.imageUrl,
    required this.isOnline,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        CircleAvatar(
          radius: 30,
          backgroundImage: NetworkImage(imageUrl),
        ),
        if (isOnline)
          Positioned(
            right: 0,
            bottom: 0,
            child: OnlineIndicator(),
          ),
      ],
    );
  }
}
