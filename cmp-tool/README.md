# Context Memory Protocol (CMP)

**State Freezing for AI Agent Development**

CMP implements the "State Freezing" technique described in the AI Agents subreddit, solving the "Intelligence Decay" problem where AI agents lose effectiveness over time due to context pollution.

## The Problem

Traditional chat-based memory causes "Intelligence Decay":
- Chat history floods the model with noise (errors, back-and-forth, failed attempts)
- Recent conversation prioritizes over initial instructions
- RAG retrieves fragments, not holistic state
- Summarization optimizes for narrative, not rules

## The Solution: State Freezing

CMP uses "State-Based Memory" instead of "History-Based Memory":

1. **Snapshot**: Analyze current session and extract "Decision State" (Active Plan + Architectural Constraints)
2. **Compress**: Save as dense, token-optimized XML block
3. **Wipe & Inject**: Clear chat history and auto-inject XML block into new sessions

Result: Agent "wakes up" with zero history but full intelligence, treating rules as **axioms** rather than memories.

## Quick Start

### Installation

#### Option 1: Install Globally (Recommended for CLI Usage)

```bash
# Install globally via npm
npm install -g cmp-context-memory

# Now you can use `cmp` from anywhere
cmp --help
```

#### Option 2: Use via npx (No Installation Required)

```bash
# Run directly without installing
npx cmp-context-memory --help

# Or use the short alias
npx cmp --help
```

#### Option 3: Add to Your Project

```bash
# Add as a dev dependency
npm install --save-dev cmp-context-memory

# Add scripts to package.json
{
  "scripts": {
    "cmp:save": "cmp save",
    "cmp:analyze": "cmp analyze",
    "cmp:load": "cmp load"
  }
}
```

### Basic Usage

```bash
# Analyze your current project
cmp analyze

# Freeze project state (creates state.xml + system-prompt.txt)
cmp save

# Load frozen state for new chat sessions
cmp load

# Initialize CMP config in current directory
cmp init
```

## Workflow

### 1. Freeze State (when context gets noisy)

```bash
pnpm cmp save
```

This creates:
- `state.xml` - Compressed project state
- `system-prompt.txt` - Ready-to-paste system prompt

### 2. Start Fresh Session

1. Open a new chat
2. Copy content from `system-prompt.txt`
3. Paste as system prompt
4. Continue development with full context

### 3. Repeat as Needed

Freeze state every 30-45 minutes or when you notice:
- Agent hallucinating imports
- Forgetting architectural decisions
- Violating established constraints

## What Gets Captured

### Architectural Decisions (Axioms)
- Technology stack choices (Next.js, Prisma, Tailwind)
- Framework configurations
- Design system decisions

### Negative Constraints
- Known bugs/issues (TODO, FIXME)
- Forbidden patterns
- Critical limitations

### Active Plans
- Current development goals
- Outstanding tasks
- Project milestones

### File Structure
- Component locations
- Configuration files
- API endpoints

## Configuration

Create `cmp.config.json` in your project root:

```json
{
  "outputDir": "./.cmp",
  "compressionLevel": "standard",
  "includePatterns": ["**/*.{ts,tsx,js,jsx,json,md}"],
  "excludePatterns": ["**/node_modules/**", "**/dist/**"],
  "maxFileSize": 1048576,
  "autoSave": false
}
```

## Advanced Usage

### Programmatic API

```typescript
import { CMP } from '@platforms/cmp';

const cmp = new CMP(config, workspaceRoot);

// Freeze current state
const stateXml = await cmp.freezeState();

// Generate system prompt
const prompt = cmp.generateSystemPrompt(stateXml);
```

### Custom State Analyzers

Extend `StateAnalyzer` to capture domain-specific decisions:

```typescript
class CustomStateAnalyzer extends StateAnalyzer {
  async extractDomainDecisions(): Promise<ArchitecturalDecision[]> {
    // Your custom logic here
  }
}
```

## Why This Works

**Before (History-Based)**:
```
Model sees: 50 messages of debugging + 2 initial instructions
Result: Prioritizes recent debugging noise
```

**After (State-Based)**:
```
Model sees: 1 compressed XML block of pure signal
Result: Treats architectural decisions as mathematical axioms
```

## Programmatic Usage

You can also use CMP programmatically in your Node.js applications:

```typescript
import { CMP } from 'cmp-context-memory';

async function freezeProjectState() {
  const cmp = new CMP({
    outputDir: './.cmp',
    compressionLevel: 'standard',
    includePatterns: ['**/*.{ts,tsx,js,jsx,json}'],
    excludePatterns: ['**/node_modules/**'],
    maxFileSize: 1024 * 1024,
    autoSave: false
  }, process.cwd());

  // Freeze current state
  const stateXml = await cmp.freezeState();

  // Generate system prompt for AI
  const systemPrompt = cmp.generateSystemPrompt(stateXml);

  console.log('State frozen!', systemPrompt);
}
```

## Integration with Development Workflow

### VS Code Tasks

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "CMP: Freeze State",
      "type": "shell",
      "command": "npx",
      "args": ["cmp-context-memory", "save"],
      "group": "build"
    }
  ]
}
```

### Git Hooks

Add to `.git/hooks/pre-commit`:

```bash
#!/bin/sh
# Auto-freeze state before commits
npx cmp-context-memory save --output .cmp/pre-commit-state.xml
```

## Comparison with Alternatives

| Method | Memory Type | Token Efficiency | Context Quality | Maintenance |
|--------|-------------|------------------|-----------------|-------------|
| Chat History | History | Poor | Noisy | High |
| RAG | Fragments | Medium | Incomplete | High |
| Summarization | Narrative | Medium | Story-focused | Medium |
| **CMP State Freezing** | **Axioms** | **Excellent** | **Pure signal** | **Low** |

## Contributing

This implements the concepts from [the AI Agents subreddit discussion](https://www.reddit.com/r/AI_Agents/s/CVFsP3qzje) on Intelligence Decay and State Freezing.

## License

MIT
