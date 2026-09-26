const { ApiError } = require("../middleware/errorHandler");

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
        model: "openai/gpt-oss-20b",
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
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      return next(new ApiError(500, `AI service error: ${errorText.slice(0, 200)}`));
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