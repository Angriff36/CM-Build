import '@testing-library/jest-dom';
import { expect, vi } from 'vitest';

// Make expect available globally
(globalThis as any).expect = expect;
(globalThis as any).vi = vi;
