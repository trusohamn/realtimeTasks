import express from 'express';
import { createUser } from '../db.js';
import ajvModule from 'ajv';
const Ajv = ajvModule.default;
const ajv = new Ajv();

const router = express.Router()
const userSchema = {
    type: 'object',
    properties: {
        username: { type: 'string', minLength: 1 },
    },
    required: ['username'],
};

const validateBody = ajv.compile(userSchema)

const isUserValid = (data: any): data is { username: string } => {
    return validateBody(data) as boolean;
};

router.post('/users', async (req, res) => {
    try {


        if (!isUserValid(req.body)) {
            return res.status(400).json({ error: 'Invalid input data.' });
        }

        const { username } = req.body;

        // TODO: check if existing user, if it does, return it's id
        const newUser = await createUser(username);

        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while creating the user.' });
    }
});

export default router;


