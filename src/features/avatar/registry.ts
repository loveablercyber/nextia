import type { AvatarModelDefinition, AvatarModelId } from './types';

const registry: Readonly<Record<AvatarModelId, AvatarModelDefinition>> = Object.freeze({
  '22': {
    id: '22',
    label: 'Agente 22',
    modelUrl: '/live2d/models/22/model.json',
    fallbackImageUrl: '/live2d/fallbacks/22.svg',
    stateMotions: { idle: 'idle', listening: 'tap_body', thinking: 'idle', speaking: 'tap_body', success: 'thanking', happy: 'thanking', warning: 'tap_body', error: 'tap_body', sleeping: 'idle', attention: 'tap_body' },
  },
  '33': {
    id: '33',
    label: 'Agente 33',
    modelUrl: '/live2d/models/33/model.json',
    fallbackImageUrl: '/live2d/fallbacks/33.svg',
    stateMotions: { idle: 'idle', listening: 'tap_body', thinking: 'idle', speaking: 'tap_body', success: 'thanking', happy: 'thanking', warning: 'tap_body', error: 'tap_body', sleeping: 'idle', attention: 'tap_body' },
  },
});

export function getAvatarModel(id: AvatarModelId): AvatarModelDefinition {
  return registry[id];
}

export function listAvatarModels(): AvatarModelDefinition[] {
  return Object.values(registry);
}

export function isAuthorizedModelId(value: unknown): value is AvatarModelId {
  return value === '22' || value === '33';
}
