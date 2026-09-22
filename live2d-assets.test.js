import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('local Live2D assets', () => {
  for (const id of ['22', '33']) {
    it(`validates model ${id} references`, () => {
      const directory = resolve(`public/live2d/models/${id}`);
      const model = JSON.parse(readFileSync(resolve(directory, 'model.json'), 'utf8'));
      expect(existsSync(resolve(directory, model.model))).toBe(true);
      model.textures.forEach((file) => expect(existsSync(resolve(directory, file))).toBe(true));
      Object.values(model.motions).flat().forEach((motion) => expect(existsSync(resolve(directory, motion.file))).toBe(true));
    });
  }
  it('ships runtime and license locally without Moedog references', () => {
    expect(existsSync(resolve('public/live2d/runtime/live2d.min.js'))).toBe(true);
    expect(existsSync(resolve('public/live2d/LICENSE-GPL-2.0.txt'))).toBe(true);
    const modelFiles = ['22','33'].map((id) => readFileSync(resolve(`public/live2d/models/${id}/model.json`), 'utf8')).join('');
    expect(modelFiles.toLowerCase()).not.toContain('moedog'); expect(modelFiles).not.toMatch(/https?:\/\//);
  });
});
