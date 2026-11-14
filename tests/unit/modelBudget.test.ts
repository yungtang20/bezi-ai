import { describe, expect, it } from 'vitest';
import { ModelCallBudget } from '../../src/ai/modelBudget';

describe('model-call budget (#47)', () => {
  const limits = { maxCallsPerClientPerWindow: 2, maxGlobalCallsPerWindow: 3, maxActivePerClient: 1, maxActiveGlobal: 2, windowMs: 60_000 };

  it('blocks concurrent calls per client and releases only the active slot', () => {
    const budget = new ModelCallBudget(limits);
    const release = budget.tryAcquire('client-a', 100);
    expect(release).toBeTypeOf('function');
    expect(budget.tryAcquire('client-a', 100)).toBeNull();
    release?.();
    release?.(); // repeated release must not make active negative
    expect(budget.tryAcquire('client-a', 100)).toBeTypeOf('function');
    expect(budget.tryAcquire('client-a', 100)).toBeNull(); // two calls exhausted
  });

  it('enforces a global call cap across clients and resets only at the next time window', () => {
    const budget = new ModelCallBudget(limits);
    budget.tryAcquire('a', 100)?.();
    budget.tryAcquire('a', 100)?.();
    budget.tryAcquire('b', 100)?.();
    expect(budget.tryAcquire('b', 100)).toBeNull(); // global cap of 3
    expect(budget.tryAcquire('b', 60_101)).toBeTypeOf('function');
  });

  it('requires release before a client starts another simultaneous call', () => {
    const budget = new ModelCallBudget(limits);
    const releaseA = budget.tryAcquire('a', 100);
    const releaseB = budget.tryAcquire('b', 100);
    expect(releaseA).not.toBeNull();
    expect(releaseB).not.toBeNull();
    expect(budget.tryAcquire('c', 100)).toBeNull(); // global concurrency reached
    releaseA?.();
    expect(budget.tryAcquire('c', 100)).toBeTypeOf('function');
  });
});
