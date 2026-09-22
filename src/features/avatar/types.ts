export type AvatarModelId = '22' | '33';
export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'success' | 'happy' | 'warning' | 'error' | 'sleeping' | 'attention';
export type AvatarEventType = 'AI_STARTED' | 'AI_THINKING' | 'AI_RESPONSE_STARTED' | 'AI_RESPONSE_FINISHED' | 'AI_ERROR' | 'TOOL_STARTED' | 'TOOL_SUCCESS' | 'TOOL_ERROR' | 'NOTIFICATION' | 'USER_INTERACTION' | 'USER_IDLE';

export interface AvatarEvent {
  type: AvatarEventType;
  detail?: Record<string, unknown>;
}

export interface AvatarModelDefinition {
  id: AvatarModelId;
  label: string;
  modelUrl: string;
  fallbackImageUrl: string;
  stateMotions: Partial<Record<AvatarState, 'idle' | 'tap_body' | 'thanking'>>;
}
