import { getDB } from '../config/db.js';



// Login User
export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    const db = getDB();

    try {
        const user = await db.collection('users').findOne({ username, password });
        if (user) {
            res.json({
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    username: user.username,
                },
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const registerUser = async (req, res) => {

}

export const getAllUsers = async (req, res) => {

}

export const getUserById = async (req, res) => {

}

export const updateUser = async (req, res) => {

}

export const deleteUser = async (req, res) => {

}



