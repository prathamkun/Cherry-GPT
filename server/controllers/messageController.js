import Chat from "../models/Chat.js";
import User from "../models/User.js";
import openai from "../configs/openai.js";

// TEXT MESSAGE CONTROLLER
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    if (req.user.credits < 1) {
      return res.status(403).json({
        success: false,
        message: "You don't have enough credits",
      });
    }

    // 🔥 Find or create chat
    let chat = null;

    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId });
    }

    if (!chat) {
      chat = await Chat.create({
        userId,
        userName: req.user.name,
        name: "New Chat",
        messages: [],
      });
    }

    // Save user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
      isPublished: false,
    });

    // Gemini (OpenAI-compatible) call
    const completion = await openai.chat.completions.create({
      model: "gemini-3-flash-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const replyText =
      completion?.choices?.[0]?.message?.content || "No response";

    // Save assistant message
    chat.messages.push({
      role: "assistant",
      content: replyText,
      timestamp: Date.now(),
      isImage: false,
      isPublished: false,
    });

    await chat.save();

    // Deduct credit
    await User.updateOne(
      { _id: userId },
      { $inc: { credits: -1 } }
    );

    return res.json({
      success: true,
      chatId: chat._id,
      reply: replyText,
    });

  } catch (error) {
    console.error("MESSAGE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
