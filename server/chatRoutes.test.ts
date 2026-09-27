// Stack AI page (Ripen spec, Build 2): the relay's config and token guard.
import { describe, expect, it } from 'vitest';
import { STACKAI_API_BASE_DEFAULT, stackAiApiBase, tokenIsWellFormed } from './chatRoutes.js';

describe('stackAiApiBase', () => {
  it('defaults to the local engine', () => {
    expect(stackAiApiBase({})).toBe(STACKAI_API_BASE_DEFAULT);
    expect(STACKAI_API_BASE_DEFAULT).toBe('http://127.0.0.1:8790');
  });
  it('reads the config setting and strips a trailing slash', () => {
    expect(stackAiApiBase({ STACKAI_API_BASE: 'https://stackai.example.test/' })).toBe('https://stackai.example.test');
  });
});

describe('tokenIsWellFormed', () => {
  it('accepts url-safe tokens and rejects anything that could escape the path', () => {
    expect(tokenIsWellFormed('AbC123_-xyz789')).toBe(true);
    expect(tokenIsWellFormed('../etc')).toBe(false);
    expect(tokenIsWellFormed('')).toBe(false);
    expect(tokenIsWellFormed('a b')).toBe(false);
  });
});
