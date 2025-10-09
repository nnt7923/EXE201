
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Get API key from environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function getAiSuggestion(prompt) {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const fullPrompt = `
    You are a travel expert in Vietnam.
    A user is asking for itinerary suggestions with the following criteria:
    - Location: ${prompt.location}
    - Duration: ${prompt.duration} days
    - Budget: ${prompt.budget}
    - Interests: ${prompt.interests.join(", ")}

    Please provide a suggested itinerary with a title and a list of activities.
    Each activity should have a name, description, and estimated time (e.g., "Morning", "Afternoon", "Evening").
    Return the response as a JSON object with the following structure:
    {
      "title": "Your suggested title",
      "activities": [
        {
          "name": "Activity Name",
          "description": "Activity Description",
          "time": "e.g., Morning, Afternoon, Evening"
        }
      ]
    }
  `;

  const result = await model.generateContent(fullPrompt);
  const response = await result.response;
  const text = await response.text();

  // Clean the response to get only the JSON part
  const jsonResponse = text.replace(/```json/g, "").replace(/```/g, "");

  try {
    return JSON.parse(jsonResponse);
  } catch (error) {
    console.error("Error parsing AI response:", error);
    throw new Error("Could not parse AI suggestion.");
  }
}

module.exports = { getAiSuggestion };
