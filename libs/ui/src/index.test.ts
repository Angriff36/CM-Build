import { describe, expect, it } from 'vitest';
import { PALETTE, CSS_VARIABLES } from './index';

describe('UI Tokens', () => {
  it('exposes the palette', () => {
    expect(PALETTE.ink[950]).toBeDefined();
  });

  it('exposes css variables', () => {
    expect(CSS_VARIABLES['--ck-color-ink-950']).toBeDefined();
  });
});
