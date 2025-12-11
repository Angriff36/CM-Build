# @caterkingapp/ui

Shared design tokens, Tailwind configuration, and UI primitives for CaterKing.

## Usage

Import tokens:

```ts
import { PALETTE, CSS_VARIABLES } from '@caterkingapp/ui';
```

Extend Tailwind config in apps:

```ts
// tailwind.config.ts
import uiConfig from '@caterkingapp/ui/tailwind.config';

export default {
  presets: [uiConfig],
  // ...
};
```
