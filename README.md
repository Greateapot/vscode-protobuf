# Protobuf for Visual Studio Code

Protocol Buffers language support for Visual Studio Code powered by the **Protols** Language Server Protocol (LSP).

This extension combines a lightweight TextMate grammar with semantic highlighting provided by the language server, giving accurate syntax coloring and IDE features for `.proto` files.

## Features

### Language Support

- Semantic syntax highlighting
- TextMate fallback highlighting
- Bracket matching
- Automatic bracket and quote closing
- Smart indentation
- Code folding
- Comment toggling
- Protocol Buffers snippets

### Language Server Features

The extension communicates with **Protols**, an implementation of the Language Server Protocol for Protocol Buffers.

Current functionality includes:

- Diagnostics
- Hover
- Go to Definition
- Find References
- Rename Symbol
- Document Symbols
- Workspace Symbols
- Code Completion
- Document Formatting
- Range Formatting
- Semantic Tokens

## Requirements

The extension requires a compatible [**Protols**](https://github.com/Greateapot/protols) executable available in your system. Ensure `protols` is available in your `PATH`.

## Semantic Highlighting

Unlike traditional TextMate grammars, semantic highlighting is provided by the language server using the LSP Semantic Tokens protocol.

This allows accurate highlighting of language constructs such as:

- packages
- messages
- enums
- services
- RPC methods
- fields
- options
- built-in types
- constants
- comments
- operators
- strings
- numbers

TextMate highlighting is intentionally minimal and is only used for syntax that cannot currently be represented through semantic tokens, including punctuation and boolean literals.

## Sources

This project builds upon several open-source projects.

### Protols

The language server is based on the original [**Protols**](https://github.com/coder3101/protols) project by **coder3101**.

The version used by this extension is based on a modified [**Protols**](https://github.com/Greateapot/protols) with additional semantic highlighting support.

### tree-sitter-proto

Semantic highlighting queries, parser improvements and language metadata are based on the [official Tree-sitter grammar](https://github.com/coder3101/tree-sitter-proto).

### vscode-proto3

Several snippets were adapted from the [**vscode-proto3**](https://github.com/zxh0/vscode-proto3) extension.

## License

This project is licensed under the MIT License.

See the `LICENSE` file for details.
