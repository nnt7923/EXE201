const { getAiSuggestion } = require('./ai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Mock the @google/generative-ai library
jest.mock('@google/generative-ai');

const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn(() => ({
  generateContent: mockGenerateContent,
}));

GoogleGenerativeAI.mockImplementation(() => ({
  getGenerativeModel: mockGetGenerativeModel,
}));

describe('getAiSuggestion', () => {
  const originalApiKey = process.env.GEMINI_API_KEY;
  const testPrompt = {
    location: 'Hòa Lạc',
    duration: 1,
    budget: 'MEDIUM',
    interests: ['Ẩm thực'],
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = 'test-api-key';
  });

  afterAll(() => {
    // Restore original environment variable
    process.env.GEMINI_API_KEY = originalApiKey;
  });

  it('should return a parsed itinerary on successful API call', async () => {
    const mockApiResponse = {
      title: 'Test Itinerary',
      activities: [
        { name: 'Test Activity', description: 'Test Description', time: 'Test Time' },
      ],
    };
    const mockResponseText = `
${JSON.stringify(mockApiResponse, null, 2)}
`;
    
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => mockResponseText,
      },
    });

    const result = await getAiSuggestion(testPrompt);

    expect(result).toEqual(mockApiResponse);
    expect(mockGetGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-2.5-flash' });
    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
  });

  it('should throw an error if GEMINI_API_KEY is not set', async () => {
    delete process.env.GEMINI_API_KEY;

    await expect(getAiSuggestion(testPrompt)).rejects.toThrow(
      'GEMINI_API_KEY chưa được cấu hình.'
    );
  });

  it('should throw a user-friendly error when the API call fails', async () => {
    const apiError = new Error('API call failed');
    mockGenerateContent.mockRejectedValue(apiError);

    await expect(getAiSuggestion(testPrompt)).rejects.toThrow(
      `Đã xảy ra lỗi khi tạo gợi ý: ${apiError.message}`
    );
  });

  it('should throw an error if the AI response is not valid JSON', async () => {
    const mockResponseText = 'This is not a JSON response.';
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => mockResponseText,
      },
    });

    await expect(getAiSuggestion(testPrompt)).rejects.toThrow(
      'Không thể phân tích cú pháp JSON từ phản hồi của AI.'
    );
  });

  it('should throw an error if the AI response has an invalid structure', async () => {
    const invalidApiResponse = { title: 'Only title' }; // Missing 'activities'
    const mockResponseText = `
${JSON.stringify(invalidApiResponse)}
`;
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => mockResponseText,
      },
    });

    await expect(getAiSuggestion(testPrompt)).rejects.toThrow(
      'Phản hồi AI không đúng định dạng cấu trúc yêu cầu.'
    );
  });

   it('should throw an error if the AI response text is empty', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => '',
      },
    });

    await expect(getAiSuggestion(testPrompt)).rejects.toThrow(
      'Phản hồi từ AI không chứa nội dung.'
    );
  });
});