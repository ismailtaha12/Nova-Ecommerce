import { vi } from "vitest";

export type QueryResult = {
  data?: unknown;
  error?: { message: string } | null;
};

/** Chainable thenable that mimics the subset of PostgREST used by checkout/webhooks. */
export function createQueryBuilder(result: QueryResult = {}) {
  const payload = { data: result.data ?? null, error: result.error ?? null };
  const builder: Record<string, unknown> = {};
  const self = () => builder;
  builder.select = vi.fn(self);
  builder.insert = vi.fn(self);
  builder.update = vi.fn(self);
  builder.delete = vi.fn(self);
  builder.eq = vi.fn(self);
  builder.in = vi.fn(self);
  builder.order = vi.fn(self);
  builder.maybeSingle = vi.fn(async () => payload);
  builder.then = (
    onFulfilled: (value: typeof payload) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) => Promise.resolve(payload).then(onFulfilled, onRejected);
  return builder;
}

export function createMockSupabase(options: {
  rpc?: (name: string, args: unknown) => { data: unknown; error: { message: string } | null };
  from?: (table: string) => ReturnType<typeof createQueryBuilder>;
} = {}) {
  return {
    rpc: vi.fn(async (name: string, args: unknown) => {
      if (options.rpc) return options.rpc(name, args);
      return { data: null, error: null };
    }),
    from: vi.fn((table: string) => {
      if (options.from) return options.from(table);
      return createQueryBuilder();
    }),
  };
}
