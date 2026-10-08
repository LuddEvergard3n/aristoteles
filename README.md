# Aristoteles

![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=111111)
![Lessons](https://img.shields.io/badge/Lessons-42-7C3AED)
![Tests](https://img.shields.io/badge/Tests-82-2563EB)
![Deploy](https://img.shields.io/badge/Deploy-GitHub_Pages-222222?logo=github)

Educational philosophy platform for close reading, argument analysis, exercise-based reconstruction, and guided discussion of philosophical texts.

## Scope

Version 1.19.0 contains nine active modules, 42 lessons, 53 declarative exercises, annotated primary texts, and approximately 70 to 90 hours of material.

The platform emphasizes reasoning over memorization. Learners classify arguments, reconstruct premises and conclusions, compare positions, inspect annotations, and answer questions attached to individual passages.

## Features

- Modular lessons and content defined in JSON.
- Annotated reading system with paragraph-level questions.
- Exercise engine for classification, reconstruction, and comparison.
- Internal references between philosophers, concepts, texts, and lessons.
- Teacher guide with classroom activities.
- Keyboard navigation and static information pages.
- Static deployment without a backend or framework.

## Run locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`. ES modules and JSON loading require HTTP.

## Tests

```bash
node tests/test-runner.js
```

The 82 checks cover data integrity, exercise engines, and core content relationships.

## Structure

```text
index.html       Single-page application entry point
css/             Base styles, layout, components, and mobile behavior
js/              Router, state, readers, exercises, and UI modules
data/            Modules, lessons, texts, exercises, and references
tests/           Dependency-free automated checks
docs/            Architecture and content guidance
```

## Live version

[luddevergard3n.github.io/aristoteles](https://luddevergard3n.github.io/aristoteles/)

## License

See [LICENSE](LICENSE).
