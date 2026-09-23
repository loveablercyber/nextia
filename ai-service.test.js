import { describe, expect, it } from 'vitest';
import { normalizeStructuredValue, validateStructuredValue } from './ai-service.js';

describe('AI structured output', () => {
  const schema = {
    type: 'object',
    required: ['message', 'speak'],
    properties: {
      message: { type: 'string' },
      speak: { type: 'boolean' },
    },
  };

  it.each([
    ['true', true],
    [' TRUE ', true],
    ['false', false],
    [' False ', false],
  ])('normalizes a boolean literal %j returned by a provider', (providerValue, expected) => {
    const result = normalizeStructuredValue({ message: 'Olá', speak: providerValue }, schema);

    expect(result).toEqual({ message: 'Olá', speak: expected });
    expect(() => validateStructuredValue(result, schema)).not.toThrow();
  });

  it('keeps unsupported values invalid instead of coercing them', () => {
    const result = normalizeStructuredValue({ message: 'Olá', speak: 'sim' }, schema);

    expect(() => validateStructuredValue(result, schema)).toThrow('result.speak deve ser booleano.');
  });
});
