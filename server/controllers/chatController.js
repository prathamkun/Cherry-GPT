import Chat from "../models/Chat.js";

// CREATE NEW CHAT
export const createChat = async (req, res) => {
    try {
        const chat = await Chat.create({
            userId: req.user._id,
            userName: req.user.name,
            name: "New Chat",
            messages: []
        });

        res.json({
            success: true,
            chat
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};

// GET ALL CHATS OF USER
export const getChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            userId: req.user._id
        }).sort({ updatedAt: -1 });

        res.json({
            success: true,
            chats
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};

// DELETE CHAT
export const deleteChat = async (req, res) => {
    try {
        const { chatId } = req.body;

        await Chat.deleteOne({
            _id: chatId,
            userId: req.user._id
        });

        res.json({
            success: true,
            message: "Chat deleted"
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};
