# Flutter Basics Presentation Demo

This repository contains a set of small, focused examples designed to teach students the absolute basics of Flutter. Each example is organized into its own package within the `lib/` directory and contains its own `main.dart` entry point. 

## Explained Concepts & Packages

### 1. Hello World (`lib/hello_world/main.dart`)
- **App Entry Point:** How `void main()` and `runApp()` start a Flutter application.
- **Root Widgets:** Introducing `MaterialApp` for app-wide configuration and `Scaffold` as the basic screen layout structure.
- **Basic UI:** Utilizing the `Center` widget to position children, and the `Text` widget to render strings on the screen.

### 2. Basic Layout Widgets (`lib/basic_widgets/main.dart`)
- **Layouts:** Dealing with vertical and horizontal arrangements using `Column` and `Row`.
- **Spacing & Alignment:** Understanding cross-axis and main-axis alignments.
- **Styling:** Using `Container` for colored boxes and padding, and separating widgets using `SizedBox`.
- **Visuals:** Rendering vector graphics with the `Icon` widget.

### 3. Stateful Widgets (`lib/stateful_widget/main.dart`)
- **State Management:** The difference between `StatelessWidget` and `StatefulWidget`.
- **Reactivity:** Using `setState()` to notify the framework that a variable has changed and the UI should rebuild.
- **Interaction:** Triggering state updates from a `FloatingActionButton`.

### 4. Navigation (`lib/navigation/main.dart`)
- **Routing:** Moving between different screens entirely using `Navigator`.
- **Push & Pop:** Pushing a new `MaterialPageRoute` onto the navigation stack (`Navigator.push`), and returning to the previous screen removing the current route (`Navigator.pop`).
- **Interactive Elements:** Using `ElevatedButton` for triggering navigation actions.

### 5. Lists (`lib/list/main.dart`)
- **Scrollable Views:** How to render content that exceeds the screen bounds.
- **Dynamic Rendering:** Utilizing `ListView.builder` for efficiently rendering large or infinite lists on demand (lazy loading), rather than building them all at once in memory.
- **List items:** Using `ListTile` and `CircleAvatar` for standard Material Design list rows.

### 6. Network Requests (`lib/network/main.dart`)
- **Dependencies:** Adding external packages like `http` via pubspec.
- **Async Operations:** Using `Future`, `async`, and `await` to fetch data asynchronously without blocking the UI.
- **Loading States:** Managing UI loading states (`_isLoading`) while waiting for the network response.

### 7. Equatable (`lib/equatable/main.dart`)
- **Object Comparison:** Demonstrating the problem with default class equality (referential equality) versus value equality.
- **Using Equatable:** Inheriting from `Equatable` and overriding `props` to easily compare objects based on their values.

---

## How to Run the Code

There are two primary ways to run these examples:

### Option A: Run the Master App Switcher (Recommended)
The root `lib/main.dart` has been set up as a launcher that aggregates all the examples into a simple list menu.
You can launch it from your terminal at the root of the project:
```bash
flutter run
```

### Option B: Run Examples Individually
Since every package has its own independent `main.dart` file without relying on the root runner, you can execute any lesson individually by specifying its target file using the `-t` (target) flag.

For example, to run just the Navigation demo:
```bash
flutter run -t lib/navigation/main.dart
```

*(You can replace `lib/navigation/main.dart` with any of the other paths listed above).*
