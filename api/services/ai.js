const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Generates an itinerary suggestion using the Google Gemini API (@google/genai).
 *
 * @param {object} prompt The user's prompt containing location, duration, budget, and interests.
 * @returns {Promise<object>} A promise that resolves to the parsed AI-generated itinerary.
 * @throws {Error} Throws an error if the API key is missing, the API call fails, or the response is invalid.
 */
async function getAiSuggestion(prompt) {
  console.log("Starting AI suggestion generation with input:", JSON.stringify(prompt, null, 2));

  if (!process.env.GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY in environment variables");
    throw new Error("GEMINI_API_KEY chưa được cấu hình.");
  }

  try {
    console.log("Initializing Gemini API client with @google/genai...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use a known stable and capable model.
    const modelName = "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    const getBudgetText = (budget) => {
      const budgetMap = { LOW: 'tiết kiệm', MEDIUM: 'vừa phải', HIGH: 'cao cấp' };
      return budgetMap[budget] || 'vừa phải';
    };

    const getInterestsText = (interests) => {
      const interestMap = {
        'Food': 'ẩm thực', 'Ẩm thực': 'ẩm thực', 'Culture': 'văn hóa',
        'Văn hóa': 'văn hóa', 'Nature': 'thiên nhiên', 'Shopping': 'mua sắm',
        'Entertainment': 'giải trí'
      };
      return interests.map(i => interestMap[i] || i).join(", ");
    };

    const fullPrompt = `Bạn là một chuyên gia du lịch địa phương ở Việt Nam.
Hãy tạo một lịch trình du lịch chi tiết cho người dùng dựa trên các tiêu chí sau:
- Địa điểm: ${prompt.location}
- Thời gian: ${prompt.duration} ngày
- Ngân sách: ${getBudgetText(prompt.budget)}
- Sở thích: ${getInterestsText(prompt.interests)}

Yêu cầu quan trọng:
- Chỉ trả về một đối tượng JSON duy nhất, không có bất kỳ văn bản giải thích nào trước hoặc sau nó.
- JSON phải có cấu trúc: { "title": "string", "activities": [{ "customPlace": "string", "startTime": "string (HH:mm)", "activityType": "string (EAT, VISIT, ENTERTAINMENT, TRAVEL, or OTHER)", "notes": "string" }] }
- Dựa vào sở thích và tên của địa điểm, hãy chọn một trong các loại hoạt động sau cho trường 'activityType': EAT (cho ăn uống), VISIT (cho tham quan, văn hóa, lịch sử), ENTERTAINMENT (cho giải trí), TRAVEL (cho di chuyển), OTHER (cho các loại khác).
- Nội dung phải bằng tiếng Việt.
- Bọc toàn bộ đối tượng JSON trong cặp dấu \`\`\`json và \`\`\`.`;

    console.log(`Sending prompt to Gemini API model: ${modelName}`);

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
      console.error("AI response is empty.", response);
      throw new Error("Phản hồi từ AI không chứa nội dung.");
    }
    console.log("Raw text response received from AI.");

    // Clean and Parse JSON
    // The model is instructed to return a JSON block. We'll find it using a regex.
    const match = text.match(/```json\n([\s\S]*?)\n```/);

    if (!match || !match[1]) {
      console.error("Could not find a valid JSON block in the AI response. Raw text:", text);
      throw new Error("Phản hồi của AI không chứa khối JSON hợp lệ hoặc có định dạng sai.");
    }

    const jsonString = match[1].trim();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonString);
    } catch (error) {
      console.error("Failed to parse JSON response:", error.message);
      console.error("Raw JSON string that failed to parse:", jsonString);
      throw new Error("Không thể phân tích cú pháp JSON từ phản hồi của AI.");
    }

    // Validate Parsed JSON Structure
    if (!parsedResponse.title || !Array.isArray(parsedResponse.activities)) {
      console.error("Invalid JSON structure after parsing:", parsedResponse);
      throw new Error("Phản hồi AI không đúng định dạng cấu trúc yêu cầu.");
    }

    console.log("Successfully generated and parsed AI suggestion.");
    return parsedResponse;

  } catch (error) {
    // Log the full error for better debugging
    console.error("An error occurred in getAiSuggestion:", error);
    const errorMessage = error.message || "Lỗi không xác định";
    throw new Error(`Đã xảy ra lỗi khi tạo gợi ý: ${errorMessage}`);
  }
}

module.exports = {
  getAiSuggestion,
};