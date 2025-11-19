import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export type MessageRecord = {
  id: number;
  session_id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  created_at: string;
};

const dbFile = path.join(process.cwd(), 'data', 'chat.sqlite');
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

const db = new Database(dbFile);

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

export function getMessages(sessionId: string) {
  const stmt = db.prepare<MessageRecord>(
    'SELECT id, session_id, role, content, created_at FROM messages WHERE session_id = ? ORDER BY id ASC'
  );
  return stmt.all(sessionId);
}

export function addMessage(sessionId: string, role: 'system' | 'user' | 'assistant', content: string) {
  const stmt = db.prepare(
    'INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)'
  );
  const info = stmt.run(sessionId, role, content);
  return info.lastInsertRowid as number;
}

export function clearConversation(sessionId: string) {
  const stmt = db.prepare('DELETE FROM messages WHERE session_id = ?');
  stmt.run(sessionId);
}
