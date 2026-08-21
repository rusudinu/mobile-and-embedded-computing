// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'custom_serialization.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Product _$ProductFromJson(Map<String, dynamic> json) => Product(
      id: json['product_id'] as String,
      name: json['product_name'] as String,
      price: (json['unit_price'] as num?)?.toDouble() ?? 0.0,
      importSource: json['importSource'] as String?,
      storageTemperature: _$JsonConverterFromJson<double, double>(
          json['storage_temp'], const TemperatureConverter().fromJson),
      category: json['category'] as String? ?? 'Unknown',
      description: json['description'] as String?,
    );

Map<String, dynamic> _$ProductToJson(Product instance) => <String, dynamic>{
      'product_id': instance.id,
      'product_name': instance.name,
      'unit_price': instance.price,
      'storage_temp': _$JsonConverterToJson<double, double>(
          instance.storageTemperature, const TemperatureConverter().toJson),
      'category': instance.category,
      'description': instance.description,
    };

Value? _$JsonConverterFromJson<Json, Value>(
  Object? json,
  Value? Function(Json json) fromJson,
) =>
    json == null ? null : fromJson(json as Json);

Json? _$JsonConverterToJson<Json, Value>(
  Value? value,
  Json? Function(Value value) toJson,
) =>
    value == null ? null : toJson(value);

ApiResponse _$ApiResponseFromJson(Map<String, dynamic> json) => ApiResponse(
      success: json['success'] as bool,
      message: json['message'] as String,
      statusCode: (json['status_code'] as num?)?.toInt(),
      timestamp: json['timestamp'] == null
          ? null
          : DateTime.parse(json['timestamp'] as String),
      metadata: json['metadata'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$ApiResponseToJson(ApiResponse instance) {
  final val = <String, dynamic>{
    'success': instance.success,
    'message': instance.message,
  };

  void writeNotNull(String key, dynamic value) {
    if (value != null) {
      val[key] = value;
    }
  }

  writeNotNull('status_code', instance.statusCode);
  val['timestamp'] = instance.timestamp.toIso8601String();
  writeNotNull('metadata', instance.metadata);
  return val;
}
