import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const upstreamHashes = {
  '22/22.v2.moc': '732fa2ce7b61485222a235c00aa43d0f3de4a1a862920f729fa29dc82295a80b',
  '22/textures/base.png': '54eea3ab02c7401fd85bda2162682a57abab1d2f88c8c03aed80f20f5de55b99',
  '22/textures/outfit-01.png': '305a0336b33fb5babd2bcdae5057a5e7e10a35c4c617c93de91ebf14d61005bc',
  '22/textures/outfit-02.png': '0a2ef4d0b01ae3a3c88edbc0d408349e70fc532014b3c333c835bfa30d74d21c',
  '22/textures/outfit-03.png': '723a57faaf18b76cf65ff1fa5b4be064da4ed1c8562c1ef98e080d09d2b0a804',
  '33/33.v2.moc': 'b16e38bacf8b22f4121c081d7f110a64cf700427a815c2478036738898488859',
  '33/textures/base.png': '9470430dac6a21027df393736429005b417193d0841de1a0b74c24e7d139f99b',
  '33/textures/outfit-01.png': '1d28de9fadb544961b31896d616632cfd082a1ba371193b417a3993e11013d0d',
  '33/textures/outfit-02.png': 'abc3576a3b95f6e7500bfdab01b814156f5307a802cd3b7c2a709df381481c5a',
  '33/textures/outfit-03.png': '4e1d6723a595590a531fd3106882dd3e2b98973e91c60f42601d3706edf54f1c',
};

function sha256(file) { return createHash('sha256').update(readFileSync(resolve(`public/live2d/models/${file}`))).digest('hex'); }

describe('local Live2D assets', () => {
  for (const id of ['22', '33']) {
    it(`validates model ${id} references`, () => {
      const directory = resolve(`public/live2d/models/${id}`);
      const model = JSON.parse(readFileSync(resolve(directory, 'model.json'), 'utf8'));
      expect(existsSync(resolve(directory, model.model))).toBe(true);
      expect(model.hit_areas_custom).toEqual({
        head_x: [-0.35, 0.6],
        head_y: [0.19, -0.2],
        body_x: [-0.3, -0.25],
        body_y: [0.3, -0.9],
      });
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
  it('uses byte-identical upstream model binaries and default.v2 textures', () => {
    Object.entries(upstreamHashes).forEach(([file, expected]) => expect(sha256(file), file).toBe(expected));
  });
});
