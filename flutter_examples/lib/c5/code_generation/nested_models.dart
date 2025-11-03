import 'package:json_annotation/json_annotation.dart';

part 'nested_models.g.dart';

/// Example demonstrating nested object serialization
/// Shows how json_serializable handles complex nested structures

@JsonSerializable()
class Address {
  final String street;
  final String city;
  final String country;
  final String zipCode;

  Address({
    required this.street,
    required this.city,
    required this.country,
    required this.zipCode,
  });

  factory Address.fromJson(Map<String, dynamic> json) =>
      _$AddressFromJson(json);

  Map<String, dynamic> toJson() => _$AddressToJson(this);

  @override
  String toString() {
    return 'Address($street, $city, $country $zipCode)';
  }
}

@JsonSerializable()
class Company {
  final String name;
  final String industry;
  final Address headquarters;

  Company({
    required this.name,
    required this.industry,
    required this.headquarters,
  });

  factory Company.fromJson(Map<String, dynamic> json) =>
      _$CompanyFromJson(json);

  Map<String, dynamic> toJson() => _$CompanyToJson(this);

  @override
  String toString() {
    return 'Company(name: $name, industry: $industry, headquarters: $headquarters)';
  }
}

@JsonSerializable()
class Employee {
  final String id;
  final String name;
  final String position;
  final Address homeAddress;
  final Company company;
  final List<String> skills;
  final Map<String, int> projectHours;

  Employee({
    required this.id,
    required this.name,
    required this.position,
    required this.homeAddress,
    required this.company,
    required this.skills,
    required this.projectHours,
  });

  factory Employee.fromJson(Map<String, dynamic> json) =>
      _$EmployeeFromJson(json);

  Map<String, dynamic> toJson() => _$EmployeeToJson(this);

  @override
  String toString() {
    return 'Employee(id: $id, name: $name, position: $position, '
        'address: $homeAddress, company: $company, '
        'skills: $skills, projectHours: $projectHours)';
  }
}

// Example usage:
void nestedModelsExample() {
  print('\n=== Nested Models Example ===');

  // Complex nested JSON
  final jsonData = {
    'id': 'emp-001',
    'name': 'Alice Johnson',
    'position': 'Senior Developer',
    'homeAddress': {
      'street': '123 Main St',
      'city': 'San Francisco',
      'country': 'USA',
      'zipCode': '94105',
    },
    'company': {
      'name': 'Tech Corp',
      'industry': 'Software',
      'headquarters': {
        'street': '456 Tech Blvd',
        'city': 'Mountain View',
        'country': 'USA',
        'zipCode': '94043',
      },
    },
    'skills': ['Dart', 'Flutter', 'Python', 'JavaScript'],
    'projectHours': {
      'Project A': 40,
      'Project B': 25,
      'Project C': 15,
    },
  };

  // Deserialize complex nested object
  final employee = Employee.fromJson(jsonData);
  print('Employee from JSON: $employee');

  // Serialize back to JSON
  final employeeJson = employee.toJson();
  print('Employee to JSON:');
  employeeJson.forEach((key, value) {
    print('  $key: $value');
  });

  // Create a new nested object
  final newEmployee = Employee(
    id: 'emp-002',
    name: 'Bob Smith',
    position: 'Product Manager',
    homeAddress: Address(
      street: '789 Oak Ave',
      city: 'Seattle',
      country: 'USA',
      zipCode: '98101',
    ),
    company: Company(
      name: 'Startup Inc',
      industry: 'Tech',
      headquarters: Address(
        street: '321 Innovation Way',
        city: 'Seattle',
        country: 'USA',
        zipCode: '98102',
      ),
    ),
    skills: ['Product Design', 'Agile', 'Strategy'],
    projectHours: {
      'Launch': 60,
      'Marketing': 20,
    },
  );

  print('\nNew employee to JSON: ${newEmployee.toJson()}');
}
