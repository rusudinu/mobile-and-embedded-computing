void randomMethod() {
  int x = 42;
  int y = x * 2;
  anotherRandomMethod();
  print('Debug me!');
}

void anotherRandomMethod() {
  String message = "Hello, Debugging!";
  print(message);
}

void main() {
  randomMethod();
}
