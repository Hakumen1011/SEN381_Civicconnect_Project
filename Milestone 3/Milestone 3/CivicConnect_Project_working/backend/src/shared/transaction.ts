
export interface Transaction {
  readonly kind: string;
}

/** Anything that can run work as one all-or-nothing transaction. */
export interface TransactionManager {
  transaction<T>(work: (tx: Transaction) => Promise<T> | T): Promise<T>;
}
