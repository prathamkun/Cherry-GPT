export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required"
      });
    }

    if (req.user.credits < 1) {
      return res.status(403).json({
        success: false,
        message: "You don't have enough credits"
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
        messages: []
      });
    }

    // Push user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false
    });

    const { choices } = await openai.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [{ role: "user", content: prompt }]
    });

    const reply = {
      ...choices[0].message,
      timestamp: Date.now(),
      isImage: false
    };

    chat.messages.push(reply);

    await chat.save();
    await User.updateOne(
      { _id: userId },
      { $inc: { credits: -1 } }
    );

    return res.json({
      success: true,
      chatId: chat._id,
      reply
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
