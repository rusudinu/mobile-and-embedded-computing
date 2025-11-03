// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'basic_user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

BasicUser _$BasicUserFromJson(Map<String, dynamic> json) => BasicUser(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      age: (json['age'] as num).toInt(),
      isActive: json['isActive'] as bool,
    );

Map<String, dynamic> _$BasicUserToJson(BasicUser instance) => <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'email': instance.email,
      'age': instance.age,
      'isActive': instance.isActive,
    };
