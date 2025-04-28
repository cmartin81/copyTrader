import mitt, { Emitter } from "mitt";

export enum Status {
  stopped = 'stopped',
  starting = 'starting',
  running = 'running',
}
export type Events = {
  order: {
    sourceSymbolId: string,
    orderSize: number,
  }
}

export abstract class AbstractMasterAccount {
  public status: Status = Status.stopped
  private emitter: Emitter<Events>
  config: any
  // abstract getEventStream(): any
  // abstract get name(): string
  // abstract get isRunning(): boolean
  abstract start(): Promise<boolean>
  // abstract stop(): void

  constructor() {
    this.emitter = mitt<Events>();
  }

  subscribe(event: keyof Events, handler: (data: Events[typeof event]) => void) {
    this.emitter.on(event, handler);
  }

  protected emit(event: keyof Events, data: Events[typeof event]) {
    if (this.status !== Status.running) {
      return
    }
    this.emitter.emit(event, data);
  }

  unsubscribe(event: keyof Events, handler: (data: Events[typeof event]) => void) {
    this.emitter.off(event, handler);
  }

  setStatus(status: Status) {
    this.status = status
  }
}
