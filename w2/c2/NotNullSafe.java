record User(String name, String email) {
}

class UserService {
	public void processUser(User user) {
		// This can throw NullPointerException at runtime
		System.out.println("Processing: " + user.name().toUpperCase());

		// Even checking for null doesn't guarantee safety
		if (user.email() != null) {
			System.out.println("Email: " + user.email().toLowerCase());
		}
	}

	static void main() {
		User user1 = new User("John", "john@example.com");
		User user2 = new User(null, null); // Compiles fine!
		User user3 = null; // Also compiles fine!

		UserService service = new UserService();
		service.processUser(user1); // Works fine
		service.processUser(user2); // Runtime NPE on getName().toUpperCase()
		service.processUser(user3); // Runtime NPE on user.getName()
	}
}
