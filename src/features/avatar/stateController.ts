import { avatarEventBus } from './eventBus';
import type { AvatarEventType, AvatarState } from './types';

const eventStates: Record<AvatarEventType, AvatarState> = {
  AI_STARTED: 'listening', AI_THINKING: 'thinking', AI_RESPONSE_STARTED: 'speaking', AI_RESPONSE_FINISHED: 'success', AI_ERROR: 'error',
  TOOL_STARTED: 'thinking', TOOL_SUCCESS: 'success', TOOL_ERROR: 'warning', NOTIFICATION: 'attention', USER_INTERACTION: 'attention', USER_IDLE: 'sleeping',
};

type StateListener = (state: AvatarState) => void;

class AvatarStateController {
  private state: AvatarState = 'idle';
  private listeners = new Set<StateListener>();
  private resetTimer?: number;

  constructor() {
    avatarEventBus.subscribe((event) => this.setState(eventStates[event.type]));
  }

  getState() { return this.state; }

  setState(state: AvatarState) {
    this.state = state;
    this.listeners.forEach((listener) => listener(state));
    if (this.resetTimer) window.clearTimeout(this.resetTimer);
    if (!['idle', 'sleeping', 'thinking', 'speaking'].includes(state)) {
      this.resetTimer = window.setTimeout(() => this.setState('idle'), 3500);
    }
  }

  subscribe(listener: StateListener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => { this.listeners.delete(listener); };
  }
}

export const avatarStateController = new AvatarStateController();
