const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const OpenAI = require('openai');

router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ reply: 'Message is required.' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // Fallback if no API key is provided
      return res.json({ 
        reply: "Hello! I am ChatGPT. 🤖\n\nIt looks like my creator hasn't added an `OPENAI_API_KEY` to the `.env` file yet, so I'm running in offline mode. I can still tell you that TaskFlow is an amazing app!" 
      });
    }

    const openai = new OpenAI({ apiKey: apiKey });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: `You are ChatGPT, integrated into a project management application called TaskFlow. You help users manage their projects and tasks. Be professional but friendly. The user asking is named ${req.user.name}.` 
        },
        { 
          role: "user", 
          content: message 
        }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ reply: 'Sorry, I encountered an error while processing your request. Please try again later.' });
  }
});

module.exports = router;
