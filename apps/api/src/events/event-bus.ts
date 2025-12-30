import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'node:events';

@Injectable()
export class EventBusService extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }
}
