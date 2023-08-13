export type MessageNewList = {
    type: "NEW_LIST";
    data: { list: { name: string; listId: string } };
    username: string;
};

export type List = {
    listId: string;
};

export type Task = {
    id: string;
    text: string;
};

export type MessageNewTask = {
    type: "NEW_TASK";
    data: { task: Task };
    listId: string;
    username: string;
};