import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

// Ajustar la ruta para que funcione correctamente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function openDb() {
    return open({
        filename: path.join(__dirname, "../database/database.db"),
        driver: sqlite3.Database
    });
}

async function setupDatabase() {
    const db = await openDb();
    await db.exec(`
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            precio REAL NOT NULL,
            favorito BOOLEAN DEFAULT 0
        )
    `);
}

setupDatabase();

export default openDb;
