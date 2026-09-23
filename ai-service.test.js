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

  it.each(['sim', null, 1, { enabled: true }])('fails closed for an unknown visual-agent speak value %j', (providerValue) => {
    const result = normalizeStructuredValue({ message: 'Olá', speak: providerValue }, schema, { booleanFallback: false });

    expect(result).toEqual({ message: 'Olá', speak: false });
    expect(() => validateStructuredValue(result, schema)).not.toThrow();
  });

  it('marks schema violations as retryable so the next configured model can answer', () => {
    expect.assertions(2);
    try {
      validateStructuredValue({ message: 'Olá', speak: 'sim' }, schema);
    } catch (error) {
      expect(error).toMatchObject({ code: 'AI_SCHEMA_INVALID', retryable: true });
      expect(error).toBeInstanceOf(Error);
    }
  });
});
