class User {
  final String name;    // Non-nullable - cannot be null
  final String? email;  // Nullable - can be null (note the ?)

  User({required this.name, this.email});
}

class UserService {
  void processUser(User user) {
    // This is guaranteed safe - name cannot be null
    print('Processing: ${user.name.toUpperCase()}');

    // Compiler forces null checking for nullable types
    if (user.email != null) {
      // Smart cast: email is promoted to non-null String inside this block
      print('Email: ${user.email!.toLowerCase()}');
    }

    // Alternative null-aware operators
    print('Email length: ${user.email?.length ?? 0}');
  }
}

void main() {
  var user1 = User(name: 'John', email: 'john@example.com');
  var user2 = User(name: 'Jane'); // email is null, but explicitly nullable


  // This won't compile - name is required and non-nullable
  // var user3 = User(name: null); // Compilation error!

  // This won't compile - User itself is non-nullable
  // User user4 = null; // Compilation error!

  var service = UserService();
  service.processUser(user1); // Safe
  service.processUser(user2); // Safe - null handling is explicit

  // print(user2.email!.toLowerCase()); // Unsafe - will throw if email is null
  // print(user2.email?.toLowerCase() ?? 'No email provided'); // Safe alternative
}
