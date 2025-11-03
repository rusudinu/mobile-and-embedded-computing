// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'nested_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Address _$AddressFromJson(Map<String, dynamic> json) => Address(
      street: json['street'] as String,
      city: json['city'] as String,
      country: json['country'] as String,
      zipCode: json['zipCode'] as String,
    );

Map<String, dynamic> _$AddressToJson(Address instance) => <String, dynamic>{
      'street': instance.street,
      'city': instance.city,
      'country': instance.country,
      'zipCode': instance.zipCode,
    };

Company _$CompanyFromJson(Map<String, dynamic> json) => Company(
      name: json['name'] as String,
      industry: json['industry'] as String,
      headquarters:
          Address.fromJson(json['headquarters'] as Map<String, dynamic>),
    );

Map<String, dynamic> _$CompanyToJson(Company instance) => <String, dynamic>{
      'name': instance.name,
      'industry': instance.industry,
      'headquarters': instance.headquarters,
    };

Employee _$EmployeeFromJson(Map<String, dynamic> json) => Employee(
      id: json['id'] as String,
      name: json['name'] as String,
      position: json['position'] as String,
      homeAddress:
          Address.fromJson(json['homeAddress'] as Map<String, dynamic>),
      company: Company.fromJson(json['company'] as Map<String, dynamic>),
      skills:
          (json['skills'] as List<dynamic>).map((e) => e as String).toList(),
      projectHours: Map<String, int>.from(json['projectHours'] as Map),
    );

Map<String, dynamic> _$EmployeeToJson(Employee instance) => <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'position': instance.position,
      'homeAddress': instance.homeAddress,
      'company': instance.company,
      'skills': instance.skills,
      'projectHours': instance.projectHours,
    };
