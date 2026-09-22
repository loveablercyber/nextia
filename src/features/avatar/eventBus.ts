import type { AvatarEvent } from './types';

type Listener = (event: AvatarEvent) => void;

class AvatarEventBus {
  private listeners = new Set<Listener>();

  emit(event: AvatarEvent) {
    this.listeners.forEach((listener) => listener(event));
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
}

export const avatarEventBus = new AvatarEventBus();
