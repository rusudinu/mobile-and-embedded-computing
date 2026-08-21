// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'enums_and_datetime.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Task _$TaskFromJson(Map<String, dynamic> json) => Task(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      priority: $enumDecode(_$PriorityEnumMap, json['priority']),
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
      dueDate: json['dueDate'] == null
          ? null
          : DateTime.parse(json['dueDate'] as String),
      completedAt: json['completedAt'] == null
          ? null
          : DateTime.parse(json['completedAt'] as String),
      tags:
          (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList() ??
              const [],
    );

Map<String, dynamic> _$TaskToJson(Task instance) => <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'description': instance.description,
      'priority': _$PriorityEnumMap[instance.priority]!,
      'createdAt': instance.createdAt.toIso8601String(),
      'dueDate': instance.dueDate?.toIso8601String(),
      'completedAt': instance.completedAt?.toIso8601String(),
      'tags': instance.tags,
    };

const _$PriorityEnumMap = {
  Priority.low: 'low',
  Priority.medium: 'medium',
  Priority.high: 'high',
  Priority.critical: 'critical',
};

Order _$OrderFromJson(Map<String, dynamic> json) => Order(
      orderId: json['orderId'] as String,
      status: $enumDecode(_$OrderStatusEnumMap, json['status']),
      placedBy: $enumDecode(_$UserRoleEnumMap, json['placedBy']),
      orderDate: json['orderDate'] == null
          ? null
          : DateTime.parse(json['orderDate'] as String),
      shippedDate: json['shippedDate'] == null
          ? null
          : DateTime.parse(json['shippedDate'] as String),
      deliveryDate: json['deliveryDate'] == null
          ? null
          : DateTime.parse(json['deliveryDate'] as String),
      items: (json['items'] as List<dynamic>).map((e) => e as String).toList(),
      totalAmount: (json['totalAmount'] as num).toDouble(),
    );

Map<String, dynamic> _$OrderToJson(Order instance) => <String, dynamic>{
      'orderId': instance.orderId,
      'status': _$OrderStatusEnumMap[instance.status]!,
      'placedBy': _$UserRoleEnumMap[instance.placedBy]!,
      'orderDate': instance.orderDate.toIso8601String(),
      'shippedDate': instance.shippedDate?.toIso8601String(),
      'deliveryDate': instance.deliveryDate?.toIso8601String(),
      'items': instance.items,
      'totalAmount': instance.totalAmount,
    };

const _$OrderStatusEnumMap = {
  OrderStatus.pending: 'pending',
  OrderStatus.processing: 'in_progress',
  OrderStatus.shipped: 'shipped',
  OrderStatus.delivered: 'completed',
  OrderStatus.cancelled: 'cancelled',
};

const _$UserRoleEnumMap = {
  UserRole.admin: 'admin',
  UserRole.moderator: 'moderator',
  UserRole.user: 'user',
  UserRole.guest: 'guest',
};

Event _$EventFromJson(Map<String, dynamic> json) => Event(
      eventId: json['eventId'] as String,
      name: json['name'] as String,
      startTime: DateTime.parse(json['startTime'] as String),
      registrationDeadline: const EpochDateTimeConverter()
          .fromJson((json['registrationDeadline'] as num).toInt()),
      priority: $enumDecode(_$PriorityEnumMap, json['priority']),
      attendees: (json['attendees'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
    );

Map<String, dynamic> _$EventToJson(Event instance) => <String, dynamic>{
      'eventId': instance.eventId,
      'name': instance.name,
      'startTime': instance.startTime.toIso8601String(),
      'registrationDeadline':
          const EpochDateTimeConverter().toJson(instance.registrationDeadline),
      'priority': _$PriorityEnumMap[instance.priority]!,
      'attendees': instance.attendees,
    };
