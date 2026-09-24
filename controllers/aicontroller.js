const { ApiError } = require("../middleware/errorHandler");

// POST /api/ai/suggest-tasks - project description se AI tasks suggest karega
async function suggestTasks(req, res, next) {
  try {
    const { description } = req.body;

    if (!description) {
      return next(new ApiError(400, "Project description zaroori hai"));
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              'You are a helpful project management assistant. Given a project description, suggest 5-6 concise, actionable task titles for building it. Respond with ONLY a JSON array of strings, no other text. Example: ["Design database schema", "Build authentication", "Create UI mockups"]',
          },
          {
            role: "user",
            content: `Project description: ${description}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return next(new ApiError(500, "AI service abhi available nahi hai, thodi der baad try karo"));
    }

    const data = await response.json();
    const aiText = data.choices[0].message.content;

    let suggestedTasks;
    try {
      const jsonMatch = aiText.match(/\[[\s\S]*\]/);
      suggestedTasks = JSON.parse(jsonMatch ? jsonMatch[0] : aiText);
    } catch (parseError) {
      return next(new ApiError(500, "AI response samajhne mein dikkat aayi, dobara try karo"));
    }

    res.status(200).json({ success: true, data: suggestedTasks });
  } catch (error) {
    next(error);
  }
}

module.exports = { suggestTasks };