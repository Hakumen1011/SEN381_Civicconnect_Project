import type { RequestStatus } from '../modules/requests/request.types.js';
import type { Transaction } from './transaction.js';


export interface DomainEvents {
  RequestSubmitted: { requestId: string; reference: string; requesterId: string; occurredAt: string };
  RequestAssigned: {
    requestId: string;
    reference: string;
    requesterId: string;
    assigneeId: string;
    assignedById: string;
    occurredAt: string;
  };
  RequestStatusChanged: {
    requestId: string;
    reference: string;
    requesterId: string;
    fromStatus: RequestStatus;
    toStatus: RequestStatus;
    changedById: string;
    note?: string;
    occurredAt: string;
  };
}

export type EventName = keyof DomainEvents;
export type EventHandler<E extends EventName> = (
  payload: DomainEvents[E],
  tx: Transaction,
) => void | Promise<void>;


export class EventBus {
  private readonly handlers = new Map<EventName, EventHandler<EventName>[]>();

  subscribe<E extends EventName>(event: E, handler: EventHandler<E>): void {
    const list = this.handlers.get(event) ?? [];
    list.push(handler as unknown as EventHandler<EventName>);
    this.handlers.set(event, list);
  }

  async publish<E extends EventName>(event: E, payload: DomainEvents[E], tx: Transaction): Promise<void> {
    for (const handler of this.handlers.get(event) ?? []) {
      // Handlers run one after another; if one throws, the surrounding transaction is rolled back.
      await handler(payload as DomainEvents[EventName], tx);
    }
  }
}
