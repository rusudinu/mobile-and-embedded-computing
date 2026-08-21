# Mobile and Embedded Computing
Everything you need for the Mobile and Embedded Computing course.

## Repository orientation

The repository is organized into the following top-level folders:

- **slides/** — The course slides (HTML, current). Open `slides/index.html` in a browser: 12 lectures + 5 labs. Navigate a deck with ← → (or click the slide edges); export to PDF with Cmd/Ctrl+P (margins none, background graphics on). Authoring guide: `slides/TEMPLATE.md`.
- **lectures/**, **lectures-pdf/** — Legacy PowerPoint/PDF lecture slides (superseded by `slides/`).
- **labs/**, **labs-pdf/** — Legacy PowerPoint/PDF lab slides (superseded by `slides/`).
- **sources/** — Additional reading materials and reference PDFs.
- **flutter_examples/** — Flutter code demos organized by topic (see below).
- **meta/** — Meta/configuration files.

## Flutter code demos

General Flutter code demos are showcased in the `flutter_examples` folder at the root of the repository.

Each topic has its own folder inside `flutter_examples/lib/`, organized by course chapter:

- **c2/** — Chapter 2 examples
- **c3/** — Chapter 3 examples (state, composition, async, concurrency)
- **c4/** — Chapter 4 examples (bloc, cubit, equatable, parent-child)
- **c5/** — Chapter 5 examples (code generation, hedging, network, retries)

## Contributing

You are welcome to contribute with PRs to this repository if you find any errors in the code or in the slides.
