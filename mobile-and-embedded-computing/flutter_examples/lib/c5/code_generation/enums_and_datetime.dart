import 'package:json_annotation/json_annotation.dart';

part 'enums_and_datetime.g.dart';

/// Enum for user roles
enum UserRole {
  admin,
  moderator,
  user,
  guest,
}

/// Enum for order status with custom JSON values
@JsonEnum(valueField: 'status')
enum OrderStatus {
  pending('pending'),
  processing('in_progress'),
  shipped('shipped'),
  delivered('completed'),
  cancelled('cancelled');

  const OrderStatus(this.status);
  final String status;
}

/// Enum for priority levels
enum Priority {
  @JsonValue('low')
  low,
  @JsonValue('medium')
  medium,
  @JsonValue('high')
  high,
  @JsonValue('critical')
  critical,
}

/// Example demonstrating enum and DateTime serialization
@JsonSerializable()
class Task {
  final String id;
  final String title;
  final String description;
  final Priority priority;
  final DateTime createdAt;
  final DateTime? dueDate;
  final DateTime? completedAt;
  final List<String> tags;

  Task({
    required this.id,
    required this.title,
    required this.description,
    required this.priority,
    DateTime? createdAt,
    this.dueDate,
    this.completedAt,
    this.tags = const [],
  }) : createdAt = createdAt ?? DateTime.now();

  factory Task.fromJson(Map<String, dynamic> json) => _$TaskFromJson(json);

  Map<String, dynamic> toJson() => _$TaskToJson(this);

  @override
  String toString() {
    return 'Task(id: $id, title: $title, priority: $priority, '
        'createdAt: $createdAt, dueDate: $dueDate, completedAt: $completedAt)';
  }
}

/// Order example with multiple enums
@JsonSerializable()
class Order {
  final String orderId;
  final OrderStatus status;
  final UserRole placedBy;
  final DateTime orderDate;
  final DateTime? shippedDate;
  final DateTime? deliveryDate;
  final List<String> items;
  final double totalAmount;

  Order({
    required this.orderId,
    required this.status,
    required this.placedBy,
    DateTime? orderDate,
    this.shippedDate,
    this.deliveryDate,
    required this.items,
    required this.totalAmount,
  }) : orderDate = orderDate ?? DateTime.now();

  factory Order.fromJson(Map<String, dynamic> json) => _$OrderFromJson(json);

  Map<String, dynamic> toJson() => _$OrderToJson(this);

  @override
  String toString() {
    return 'Order(id: $orderId, status: $status, placedBy: $placedBy, '
        'orderDate: $orderDate, items: ${items.length}, total: \$$totalAmount)';
  }
}

/// Example with custom DateTime format using converters
class EpochDateTimeConverter implements JsonConverter<DateTime, int> {
  const EpochDateTimeConverter();

  @override
  DateTime fromJson(int json) => DateTime.fromMillisecondsSinceEpoch(json);

  @override
  int toJson(DateTime object) => object.millisecondsSinceEpoch;
}

@JsonSerializable()
class Event {
  final String eventId;
  final String name;

  // Standard ISO 8601 DateTime (default)
  final DateTime startTime;

  // Custom epoch time converter
  @EpochDateTimeConverter()
  final DateTime registrationDeadline;

  final Priority priority;
  final List<String> attendees;

  Event({
    required this.eventId,
    required this.name,
    required this.startTime,
    required this.registrationDeadline,
    required this.priority,
    this.attendees = const [],
  });

  factory Event.fromJson(Map<String, dynamic> json) => _$EventFromJson(json);

  Map<String, dynamic> toJson() => _$EventToJson(this);

  @override
  String toString() {
    return 'Event(id: $eventId, name: $name, startTime: $startTime, '
        'deadline: $registrationDeadline, priority: $priority, '
        'attendees: ${attendees.length})';
  }
}

// Example usage:
void enumsAndDateTimeExample() {
  print('\n=== Enums and DateTime Example ===');

  // Task with enum and DateTime
  final taskJson = {
    'id': 'task-001',
    'title': 'Fix critical bug',
    'description': 'Address the payment processing issue',
    'priority': 'critical',
    'createdAt': '2024-01-15T10:30:00.000Z',
    'dueDate': '2024-01-16T18:00:00.000Z',
    'completedAt': null,
    'tags': ['bug', 'urgent', 'payment'],
  };

  final task = Task.fromJson(taskJson);
  print('Task from JSON: $task');
  print('Priority enum: ${task.priority}');
  print('Created at: ${task.createdAt}');
  print('Due date: ${task.dueDate}');

  // Convert back to JSON
  final taskToJson = task.toJson();
  print('\nTask to JSON:');
  taskToJson.forEach((key, value) {
    print('  $key: $value');
  });

  // Order example with OrderStatus enum
  print('\n=== Order Example ===');
  final orderJson = {
    'orderId': 'ORD-12345',
    'status': 'in_progress', // Maps to OrderStatus.processing
    'placedBy': 'user',
    'orderDate': '2024-01-15T14:20:00.000Z',
    'shippedDate': '2024-01-16T09:00:00.000Z',
    'deliveryDate': null,
    'items': ['Item 1', 'Item 2', 'Item 3'],
    'totalAmount': 299.99,
  };

  final order = Order.fromJson(orderJson);
  print('Order from JSON: $order');
  print('Order status enum: ${order.status}');
  print('Order status value: ${order.status.status}');

  print('\nOrder to JSON: ${order.toJson()}');

  // Create new task with enum
  final newTask = Task(
    id: 'task-002',
    title: 'Update documentation',
    description: 'Add API docs for new endpoints',
    priority: Priority.medium,
    dueDate: DateTime.now().add(const Duration(days: 3)),
    tags: ['documentation', 'api'],
  );
  print('\nNew task: $newTask');
  print('New task to JSON: ${newTask.toJson()}');

  // Event example with epoch time
  print('\n=== Event Example (with epoch time) ===');
  final eventJson = {
    'eventId': 'evt-001',
    'name': 'Flutter Conference',
    'startTime': '2024-03-15T09:00:00.000Z',
    'registrationDeadline': 1710374400000, // Epoch milliseconds
    'priority': 'high',
    'attendees': ['Alice', 'Bob', 'Charlie'],
  };

  final event = Event.fromJson(eventJson);
  print('Event from JSON: $event');
  print('Start time (ISO): ${event.startTime.toIso8601String()}');
  print('Registration deadline (epoch): ${event.registrationDeadline.millisecondsSinceEpoch}');
  print('Registration deadline (formatted): ${event.registrationDeadline}');

  final eventToJson = event.toJson();
  print('\nEvent to JSON:');
  eventToJson.forEach((key, value) {
    print('  $key: $value');
  });
}
