# @codemachine/ui

Shared design tokens, Tailwind configuration, and UI primitives for CaterKing.

## Usage

Import tokens:

```ts
import { PALETTE, CSS_VARIABLES } from '@codemachine/ui';
```

Extend Tailwind config in apps:

```ts
// tailwind.config.ts
import uiConfig from '@codemachine/ui/tailwind.config';

export default {
  presets: [uiConfig],
  // ...
};
```
