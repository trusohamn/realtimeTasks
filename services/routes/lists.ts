import express from 'express';
import { associateListWithUser, createList, createUser } from '../db.js';
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
            data: { list: newList }
        }

        broadcastMessageToUser(userId, broadcastedMessage)
        res.status(201).json(newList);
    } catch (error) {
        console.log({ error })
        res.status(500).json({ error: 'An error occurred while creating the list.' });
    }
})

export default router;




