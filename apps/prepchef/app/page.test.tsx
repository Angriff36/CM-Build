import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import HomePage from './page';

describe('HomePage', () => {
  it('renders the bootstrap message for the workspace', () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain('Workspace bootstrapped.');
  });
});
