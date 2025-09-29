# SDD Implementation Verification (VS Code Extension)

SDD Implementation Verification is a VS Code extension that integrates the Seam-Driven Development methodology into the editor. It helps developers verify whether AI-generated code matches claimed behavior and enforces contract-driven development.

Features:
- Analyze Selected Function: AI-powered analysis of selected functions for SDD compliance and implementation gaps.
- Generate Contract from Selection: Create TypeScript seam contracts from a selected UI component or requirements.
- Validate Contract File: Validate existing `.contract.ts` files for SDD compliance and implementation matches.
- Implementation Verification Panel: Single webview panel with Analysis, Contracts, Verification, and Logs tabs.
- Status bar updates and quick actions for workflow visibility.

Installation:
- Build and package: `npm run package:standalone` (creates a minimal VSIX)
- Install: `code --install-extension path/to/sdd-implementation-verification-0.1.0.vsix` or `code-insiders --install-extension ...`

Configuration:
- Configure `sdd.grokApiKey` in VS Code settings for AI features.

Development:
- Build: `npm run compile` then `npm run bundle`
- Package: `npm run package:standalone`

License: MIT
