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

db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS list_tasks (
    listId TEXT,
    taskId TEXT,
    FOREIGN KEY (listId) REFERENCES lists (id),
    FOREIGN KEY (taskId) REFERENCES tasks (id),
    PRIMARY KEY (listId, taskId)
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
    return new Promise<{ listId: string }[]>((resolve, reject) => {
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

export async function getUsersIdByListId(listId: string) {
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

export async function getUsersByListId(listId: string) {
    return new Promise<{ userId: string, username: string }[]>((resolve, reject) => {
        db.all(
            `
            SELECT users.id, users.username AS name
            FROM users
            JOIN user_lists ON users.id = user_lists.userId
            WHERE user_lists.listId = ?
          `,
            [listId],
            (err: any, rows: any[]) => {
                if (err) {
                    console.log(err);
                    reject(new Error('Error retrieving users'));
                    return;
                }
                console.log({ rows })
                const mappedRows = rows.map(({ id, name }) => ({ userId: id, username: name }))
                resolve(mappedRows);
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

type Task = { id: string, text: string }
export async function getListDetails(listId: string) {
    return new Promise<{ id: string; name: string; tasks: Task[], sharedWith: { userId: string, username: string }[] } | null>((resolve, reject) => {
        db.get('SELECT * FROM lists WHERE id = ?', [listId], async (err: any, row: any) => {
            if (err) {
                console.log(err);
                reject(new Error('Error retrieving list details'));
                return;
            }

            if (!row) {
                resolve(null);
                return;
            }

            const list: { id: string; name: string } = {
                id: row.id,
                name: row.name,
            };

            const tasks = await getTasksByListId(listId);
            const sharedWith = await getUsersByListId(listId);

            resolve({ ...list, tasks, sharedWith });
        });
    });
}


export async function createTask(listId: string, taskId: string, text: string) {
    return new Promise<Task>((resolve, reject) => {
        const query = 'INSERT INTO tasks (id, text) VALUES (?, ?)';

        db.run(query, [taskId, text], async (err) => {
            if (err) {
                console.error(err);
                reject(new Error('Error creating task'));
                return;
            }

            await associateTaskWithList(listId, taskId);

            const newTask = {
                id: taskId,
                text,
            };

            resolve(newTask);
        });
    });
}

export async function associateTaskWithList(listId: string, taskId: string) {
    return new Promise<void>((resolve, reject) => {
        const query = 'INSERT INTO list_tasks (listId, taskId) VALUES (?, ?)';

        db.run(query, [listId, taskId], (err) => {
            if (err) {
                console.error(err);
                reject(new Error('Error associating task with list'));
                return;
            }

            resolve();
        });
    });
}

export async function getTasksByListId(listId: string) {
    return new Promise<Task[]>((resolve, reject) => {
        db.all(
            'SELECT tasks.id, tasks.text FROM tasks JOIN list_tasks ON tasks.id = list_tasks.taskId WHERE list_tasks.listId = ?',
            [listId],
            (err: any, rows: any[]) => {
                if (err) {
                    console.log(err);
                    reject(new Error('Error retrieving tasks'));
                    return;
                }

                const tasks = rows.map((row: any) => ({
                    id: row.id,
                    text: row.text,
                }));

                resolve(tasks);
            }
        );
    });
}


export default db;
