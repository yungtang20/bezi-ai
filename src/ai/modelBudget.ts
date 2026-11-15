// One-instance model invocation budget. A reservation is taken for EVERY provider call
// (including a schema-correction retry), then released on completion or error.
// This is a cost *proxy*, not a currency/token usage ledger.
export interface ModelBudgetLimits {
  maxCallsPerClientPerWindow: number;
  maxGlobalCallsPerWindow: number;
  maxActivePerClient: number;
  maxActiveGlobal: number;
  windowMs?: number;
}

interface ClientLedger {
  calls: number;
  resetAt: number;
  active: number;
}

export class ModelCallBudget {
  private readonly clients = new Map<string, ClientLedger>();
  private readonly global: ClientLedger = { calls: 0, resetAt: 0, active: 0 };

  constructor(private readonly limits: ModelBudgetLimits) {}

  tryAcquire(clientId: string, now = Date.now()): (() => void) | null {
    const windowMs = this.limits.windowMs ?? 60_000;
    let client = this.clients.get(clientId);
    if (!client) {
      client = { calls: 0, resetAt: now + windowMs, active: 0 };
      this.clients.set(clientId, client);
    } else if (now >= client.resetAt) {
      client.calls = 0;
      client.resetAt = now + windowMs;
    }
    if (now >= this.global.resetAt) {
      this.global.calls = 0;
      this.global.resetAt = now + windowMs;
    }
    if (
      client.calls >= this.limits.maxCallsPerClientPerWindow ||
      this.global.calls >= this.limits.maxGlobalCallsPerWindow ||
      client.active >= this.limits.maxActivePerClient ||
      this.global.active >= this.limits.maxActiveGlobal
    ) return null;

    client.calls++;
    this.global.calls++;
    client.active++;
    this.global.active++;

    // Bounded cleanup without dropping a client with outstanding work.
    if (this.clients.size > 10_000) {
      for (const [key, entry] of this.clients) {
        if (entry.active === 0 && now >= entry.resetAt) this.clients.delete(key);
      }
    }
    let released = false;
    return () => {
      if (released) return;
      released = true;
      client.active--;
      this.global.active--;
    };
  }
}
