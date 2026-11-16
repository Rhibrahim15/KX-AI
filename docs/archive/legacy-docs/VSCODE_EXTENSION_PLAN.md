# VSCode Extension Architecture Plan

**Status**: 📋 Planned for Phase D  
**Target**: Make KX AI available as a VSCode extension

---

## 🎯 Vision

Turn KX AI into a VSCode extension that allows you to:
- Select files/folders in explorer → analyze with AI
- Highlight code → get AI suggestions
- Ask questions → get contextual answers from your codebase
- Generate code → insert directly into editor
- Upload documents → build RAG knowledge from your project

---

## 📐 Architecture

```
├── vscode-extension/
│   ├── src/
│   │   ├── extension.ts          # VSCode extension entry point
│   │   ├── webview.ts            # UI panel in VSCode
│   │   ├── commands/
│   │   │   ├── analyze.ts        # Analyze selected file
│   │   │   ├── suggest.ts        # Get suggestions
│   │   │   ├── chat.ts           # Chat interface
│   │   │   └── upload.ts         # Upload to AI memory
│   │   ├── providers/
│   │   │   └── kxai-provider.ts  # Connection to KX AI backend
│   │   └── utils/
│   │       ├── file-handler.ts   # File operations
│   │       └── context-builder.ts # Build context from selection
│   ├── webview-ui/              # React UI for panel
│   ├── package.json
│   ├── tsconfig.json
│   └── vscode.d.ts              # VSCode API definitions
│
└── vscode-ext-instructions.md   # Packaging instructions
```

---

## 🔌 How It Integrates

### 1. **File Analysis**
```typescript
// User right-clicks file → "Analyze with KX AI"
const fileContent = fs.readFileSync(selectedFile)
const analysis = await kxaiClient.analyze({
  content: fileContent,
  language: 'typescript',
  taskType: 'code-review'
})
vscode.window.showInformationMessage(analysis)
```

### 2. **Code Suggestions**
```typescript
// User selects code → "Get AI Suggestion"
const selected = editor.selection
const code = editor.document.getText(selected)
const suggestion = await kxaiClient.suggest({ code })
// Insert suggestion at cursor
```

### 3. **Chat Interface**
```typescript
// Sidebar panel with chat
// Can ask questions about current file/folder
// Context: current file, selected text, folder structure
```

### 4. **Directory Upload**
```typescript
// User selects folder → "Upload to KX AI Memory"
// Recursively indexes all files
// Builds RAG knowledge base from codebase
// Enables contextual queries on your own code
```

---

## 🛠️ Implementation Plan (Phase D)

### D1: Extension Scaffolding
- [ ] Create VSCode extension using Yeoman generator
- [ ] Implement extension activation hooks
- [ ] Create basic command palette commands
- [ ] Build webview panel infrastructure

### D2: Core Commands
- [ ] Implement file/folder analysis
- [ ] Add code suggestion feature
- [ ] Build chat interface
- [ ] Add document/file upload capability

### D3: Backend Integration
- [ ] Connect to KX AI server
- [ ] Handle authentication (API key)
- [ ] Stream responses
- [ ] Cache results

### D4: Advanced Features
- [ ] Syntax highlighting for code blocks
- [ ] Diff view for suggestions
- [ ] History/bookmarks
- [ ] Settings panel (model selection, temperature, etc.)

---

## 📦 Packaging

Once built:
1. Package as `.vsix` file
2. Publish to VSCode Marketplace
3. Users can install with: `code --install-extension kxai-*.vsix`

---

## 🔮 Future: VSCode Settings Integration

```json
{
  "kxai.apiKey": "your-key",
  "kxai.serverUrl": "http://localhost:7860",
  "kxai.defaultTaskType": "code-review",
  "kxai.autoAnalyzeOnSave": false,
  "kxai.ragPath": "./kxai-memory"
}
```

---

## 💡 Use Cases After Implementation

1. **Code Review**: Select file → "Review this code" → AI analyzes and suggests improvements
2. **Documentation**: Select function → "Generate JSDoc" → AI creates docs
3. **Refactoring**: Select code → "Suggest refactoring" → AI recommends patterns
4. **Testing**: Select function → "Generate tests" → AI creates test cases
5. **Learning**: "Explain this" → AI explains code in your context
6. **Project Context**: Upload project → "Answer questions about my codebase" → AI uses RAG

---

## 📝 Notes

- VSCode extension uses TypeScript (same language as current codebase)
- Can reuse existing API client code
- Extension will connect to running KX AI server
- Users need API key to authenticate
- RAG knowledge base stored locally in VSCode workspace

**Estimated effort**: ~20-30 hours for full implementation with UI

---

## 🚀 Timeline

- **Phase A-C**: Build core AI capabilities (provider system, memory, tools)
- **Phase D**: Implement VSCode extension alongside CLI and bots
- **Post-release**: Community extensions (Vim, NeoVim, Sublime, etc.)

