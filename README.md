# Verse Online Editor
A work-in-progress, offline-ready Verse code playground built with React and Monaco Editor for learning, parsing, and interpreting Verse scripts in the browser without UEFN integration.

## 📌 Summary

The Verse Online Editor is a lightweight, browser-based environment for writing and interpreting Verse, the programming language used in Unreal Engine for Fortnite (UEFN). Designed for learning and experimentation, this playground helps users understand Verse syntax and semantics without the need to open Unreal Editor or deploy a map.

The project runs without UEFN integration and executes Verse code as if inside an `OnBegin()` block, making it ideal for experimentation, logic testing, and syntax familiarization.

The Verse Online Editor currently supports only a subset of core language features such as variables, loops, conditionals, expressions, and arrays — advanced constructs like classes, functions, or UEFN-specific APIs are not yet implemented.

🔧 **Currently Supported:**

- ✅ Variables
- ✅ Loops (`loop`, `for`)
- ✅ Conditionals (`if`, `else`)
- ✅ `Print` statements
- ✅ Basic arithmetic and logic expressions
- ✅ Arrays and array access

❌ **Not Yet Supported:**
- Classes (`class(creative_device)`)
- Functions
- UEFN-specific APIs (`OnBegin`, `GetPlayspace`, etc.)

> 🧩 **Note:** This project uses [Peggy](https://peggyjs.org/), a modern fork of PEG.js, to define and compile the Verse grammar into a JavaScript parser.

## 🛠️ Setup 
Clone the repository to your local machine
```
$ git clone https://github.com/johanfortus/Verse-Compiler/
$ cd Verse-Compiler
```

Install dependencies
```
$ npm i
```

Generate the parser from the PEG.js grammar
```
$ npx peggy --format es -o src/utils/parser.js src/language/verse-grammar.pegjs
```

Start the development server
```
$ npm run dev
```

## 💻 Built With
- [<img src="https://img.shields.io/badge/javascript-%23F7DF1E.svg?&style=for-the-badge&logo=javascript&logoColor=black" />](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />](https://react.dev/)
- [<img src="https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />](https://nodejs.org/)
- [<img src="https://github.com/user-attachments/assets/63dab2fd-6095-46a1-88f6-9a4dc97e2edb" height="27.99" />](https://microsoft.github.io/monaco-editor/)
- [<img src="https://github.com/user-attachments/assets/b1ee7389-af66-475b-b100-90e4115459ca" height="27.99" />](https://github.com/pegjs/pegjs)

## 📸 Demonstration
<img width="1504" alt="Verse Online Editor Demo" src="https://github.com/user-attachments/assets/e0d26a71-b2e4-49ea-ac8e-92bee20c308a" />
