# Publishing CMP to npm

## Prerequisites

1. Create a GitHub repository for CMP
2. Set up npm account
3. Ensure you have proper licensing

## Publishing Steps

### 1. Prepare the Package

```bash
# Build the package
npm run build

# Test the CLI works
node dist/cli.js --help
```

### 2. Update Package Info

Edit `package.json` with your actual repository:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/cmp-context-memory.git"
  },
  "homepage": "https://github.com/YOUR_USERNAME/cmp-context-memory#readme",
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/cmp-context-memory/issues"
  }
}
```

### 3. Publish to npm

```bash
# Login to npm
npm login

# Dry run first
npm publish --dry-run

# Publish for real
npm publish
```

## Usage Across Projects

### Global Installation (Recommended)

```bash
# Install globally
npm install -g cmp-context-memory

# Use from any project
cmp analyze
cmp save
```

### Project-Specific Installation

```bash
# Add to any project's package.json
npm install --save-dev cmp-context-memory

# Use via npx
npx cmp analyze
npx cmp save

# Or add npm scripts
{
  "scripts": {
    "freeze": "cmp save",
    "analyze": "cmp analyze"
  }
}
```

### CI/CD Integration

```yaml
# GitHub Actions example
- name: Freeze project state
  run: npx cmp-context-memory save --output .cmp/ci-state.xml
```

## Version Management

```bash
# Patch version
npm version patch
npm publish

# Minor version
npm version minor
npm publish

# Major version
npm version major
npm publish
```

## Distribution Options

1. **npm Package**: `npm install cmp-context-memory`
2. **GitHub Release**: Download pre-built binaries
3. **Direct Clone**: `git clone` and build locally
4. **npx**: `npx cmp-context-memory` (no installation needed)
