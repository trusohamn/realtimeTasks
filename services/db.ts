import { randomUUID } from 'crypto';
import sqlite3 from 'sqlite3';
const verbose = sqlite3.verbose();

// const db = new verbose.Database(':memory:');
const db = new verbose.Database('test.db');

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS lists (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS user_lists (
    userId TEXT,
    listId TEXT,
    FOREIGN KEY (userId) REFERENCES users (id),
    FOREIGN KEY (listId) REFERENCES lists (id),
    PRIMARY KEY (userId, listId)
  )
`);

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


export async function getUsersListIds(userId: string) {
    return new Promise<List[]>((resolve, reject) => {
        db.all(
            'SELECT listId FROM user_lists WHERE userId = ?',
            [userId],
            (err: any, rows: any[]) => {
                if (err) {
                    console.log(err);
                    reject(new Error('Error retrieving lists'));
                    return;
                }

                resolve(rows);
            }
        );
    });
}

export async function getUsersByListIds(listId: string) {
    return new Promise<{ userId: string }[]>((resolve, reject) => {
        db.all(
            'SELECT userId FROM user_lists WHERE listId = ?',
            [listId],
            (err: any, rows: any[]) => {
                if (err) {
                    console.log(err);
                    reject(new Error('Error retrieving users'));
                    return;
                }

                resolve(rows);
            }
        );
    });
}


type List = { id: string, name: string }
export async function createList(name: string) {
    return new Promise<List>((resolve, reject) => {
        const listId = randomUUID();
        const query = 'INSERT INTO lists (id, name) VALUES (?, ?)';

        db.run(query, [listId, name], function (err) {
            if (err) {
                console.error(err);
                reject(new Error('Error creating list'));
                return;
            }

            const newList = {
                id: listId,
                name,
            };

            resolve(newList);
        });
    });
}

export async function associateListWithUser(userId: string, listId: string) {
    return new Promise<void>((resolve, reject) => {
        const query = 'INSERT INTO user_lists (userId, listId) VALUES (?, ?)';

        db.run(query, [userId, listId], function (err) {
            if (err) {
                console.error(err);
                reject(new Error('Error associating list with user'));
                return;
            }

            resolve();
        });
    });
}

type User = { id: string, username: string }
export async function getUserByUsername(username: string) {
    return new Promise<User | null>((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err: any, row: any) => {
            if (err) {
                console.log(err);
                reject(new Error('Error retrieving user'));
                return;
            }

            if (!row) {
                resolve(null);
                return;
            }

            const user: User = {
                id: row.id,
                username: row.username,
            };

            resolve(user);
        });
    });
}




export default db;
