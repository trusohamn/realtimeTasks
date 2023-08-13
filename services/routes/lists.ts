import express from 'express';
import { associateListWithUser, createList, getUserByUsername, getUsersListIds } from '../db.js';
import ajvModule from 'ajv';
import { extractUserId } from '../middlewares.js';
import { broadcastMessageToUser } from '../ws.js';
const Ajv = ajvModule.default;
const ajv = new Ajv();

const router = express.Router()

const listSchema = {
    type: 'object',
    properties: {
        name: { type: 'string', minLength: 1 },
    },
    required: ['name'],
};

const validateBody = ajv.compile(listSchema)

const isListDataValid = (data: any): data is { name: string } => {
    return validateBody(data) as boolean;
};


router.post('/lists', extractUserId, async (req, res) => {
    try {
        const userId = req.userId;
        if (!isListDataValid(req.body) || !userId) {
            return res.status(400).json({ error: 'Invalid input data.' });
        }

        const { name } = req.body;

        const newList = await createList(name);

        await associateListWithUser(userId!, newList.id);
        const broadcastedMessage = {
            type: 'NEW_LIST',
            data: { list: { listId: newList.id } }
        }

        broadcastMessageToUser(userId, broadcastedMessage)
        res.status(201).json(newList);
    } catch (error) {
        console.log({ error })
        res.status(500).json({ error: 'An error occurred while creating the list.' });
    }
})

router.post('/lists/:listId/share', extractUserId, async (req, res) => {
    try {
        const { listId } = req.params;
        const username = req.body.username
        const userId = req.userId;

        if (!userId) throw new Error('no userid')
        const userLists = await getUsersListIds(userId);

        if (!userLists.find(list => list.id !== listId))
            return res.status(404).json({ error: 'List not found.' });

        const sharedUser = await getUserByUsername(username);
        if (!sharedUser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        await associateListWithUser(sharedUser.id, listId);

        const broadcastedMessage = {
            type: 'NEW_LIST',
            data: { list: { listId } }
        }
        broadcastMessageToUser(sharedUser.id, broadcastedMessage)

        res.status(200).json({ message: 'List shared successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while sharing the list.' });
    }
});

export default router;




