import { randomUUID } from 'crypto';
import sqlite3 from 'sqlite3';
const verbose = sqlite3.verbose();

const db = new verbose.Database(':memory:');

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL
  )
`, (err) => {
    if (err) {
        console.error('Error creating users table:', err.message);
    } else {
        console.log('Users table created successfully');
    }
});

db.run(`
  CREATE TABLE IF NOT EXISTS lists (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (userId) REFERENCES users (id)
  )
` , (err) => {
    if (err) {
        console.error('Error creating users table:', err.message);
    } else {
        console.log('Lists table created successfully');
    }
});

export async function createUser(username: string) {
    return new Promise((resolve, reject) => {
        const id = randomUUID();
        const query = 'INSERT INTO users (id, username) VALUES (?, ?)';

        db.run(query, [id, username], function (err) {
            if (err) {
                console.log(err)
                reject(new Error('Error creating user'));
                return;
            }

            const newUser = {
                id,
                username,
            };

            resolve(newUser);
        });
    });
}

export async function getUsersList(userId: string) {
    return new Promise((resolve, reject) => {
        db.run('SELECT * FROM lists WHERE userId = ?', [userId], (err: any, rows: unknown) => {
            if (err) {
                console.log(err)
                reject(new Error('Error retrieving lists'));
                return;
            }

            resolve(rows);
        });
    });
}

export default db;
