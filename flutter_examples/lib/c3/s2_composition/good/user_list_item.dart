import 'package:flutter/material.dart';
import 'package:flutter_examples/c3/s2_composition/good/avatar_with_indicator.dart';
import 'package:flutter_examples/c3/s2_composition/good/message_badge.dart';
import 'package:flutter_examples/c3/s2_composition/good/styled_card.dart';
import 'package:flutter_examples/c3/s2_composition/good/user_info.dart';

class UserListItem extends StatelessWidget {
  final String name;
  final String email;
  final String avatarUrl;
  final int messageCount;
  final bool isOnline;

  const UserListItem({super.key,
    required this.name,
    required this.email,
    required this.avatarUrl,
    required this.messageCount,
    required this.isOnline,
  });

  @override
  Widget build(BuildContext context) {
    return StyledCard(
      child: Row(
        children: [
          AvatarWithIndicator(
            imageUrl: avatarUrl,
            isOnline: isOnline,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: UserInfo(name: name, email: email),
          ),
          if (messageCount > 0)
            MessageBadge(count: messageCount),
        ],
      ),
    );
  }
}


