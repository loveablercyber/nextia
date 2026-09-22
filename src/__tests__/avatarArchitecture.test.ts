import { describe, expect, it } from 'vitest';
import { avatarEventBus } from '../features/avatar/eventBus';
import { listAvatarModels } from '../features/avatar/registry';
import { avatarStateController } from '../features/avatar/stateController';

describe('avatar architecture', () => {
  it('registers only local 22 and 33 assets', () => {
    const models = listAvatarModels();
    expect(models.map((model) => model.id)).toEqual(['22', '33']);
    models.forEach((model) => {
      expect(model.modelUrl.startsWith('/live2d/')).toBe(true);
      expect(model.fallbackImageUrl.startsWith('/live2d/')).toBe(true);
      expect(model.modelUrl).not.toMatch(/^https?:/);
    });
  });

  it('maps events to abstract avatar states', () => {
    avatarEventBus.emit({ type: 'AI_THINKING' }); expect(avatarStateController.getState()).toBe('thinking');
    avatarEventBus.emit({ type: 'TOOL_SUCCESS' }); expect(avatarStateController.getState()).toBe('success');
    avatarEventBus.emit({ type: 'AI_ERROR' }); expect(avatarStateController.getState()).toBe('error');
  });
});
