declare module 'better-sqlite3' {
  interface RunResult {
    changes: number;
    lastInsertRowid: number | bigint;
  }

  interface Statement<TRow = unknown> {
    run(...params: unknown[]): RunResult;
    all(...params: unknown[]): TRow[];
    get(...params: unknown[]): TRow;
  }

  interface Database {
    prepare<TRow = unknown>(source: string): Statement<TRow>;
    exec(source: string): this;
  }

  interface DatabaseConstructor {
    new (filename: string, options?: Record<string, unknown>): Database;
  }

  const Database: DatabaseConstructor;
  export default Database;
}
