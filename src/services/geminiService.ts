
const API_KEY = "AIzaSyDmYenUZpMg1c-qfj3TFF3-iVrOZmgeSHk";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export interface GeminiResponse {
  text: string;
  error?: string;
}

export interface GenerateLessonParams {
  subject: string;
  level: string;
  topic: string;
  additionalContext?: string;
}

export interface GenerateAssessmentParams {
  topic: string;
  difficulty: string;
  questionCount: number;
  type: string; // e.g., 'multiple-choice', 'essay', 'matching'
}

export const generateLesson = async (params: GenerateLessonParams): Promise<GeminiResponse> => {
  const { subject, level, topic, additionalContext } = params;
  
  const prompt = `
    Create a detailed lesson plan on ${topic} for a ${level} ${subject} course.
    
    Include the following sections:
    1. Learning Objectives
    2. Key Concepts
    3. Introduction
    4. Main Content with important points and examples
    5. Activities for Students
    6. Assessment Questions
    7. Additional Resources
    
    Additional Context: ${additionalContext || "None provided"}
    
    Format the output in markdown.
  `;
  
  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return { text: "", error: data.error.message || "Error generating content" };
    }
    
    const generatedText = data.candidates[0].content.parts[0].text;
    return { text: generatedText };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return { text: "", error: "Failed to communicate with the AI service" };
  }
};

export const generateAssessment = async (params: GenerateAssessmentParams): Promise<GeminiResponse> => {
  const { topic, difficulty, questionCount, type } = params;
  
  const prompt = `
    Create a ${difficulty} level assessment on "${topic}" with ${questionCount} ${type} questions.
    
    For each question:
    1. Provide the question
    2. If multiple-choice, include 4 options with the correct answer marked
    3. Include an explanation for the correct answer
    
    Format the output in markdown.
  `;
  
  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return { text: "", error: data.error.message || "Error generating content" };
    }
    
    const generatedText = data.candidates[0].content.parts[0].text;
    return { text: generatedText };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return { text: "", error: "Failed to communicate with the AI service" };
  }
};

export const enhanceContent = async (originalText: string, instructions: string): Promise<GeminiResponse> => {
  const prompt = `
    Enhance the following educational content based on these instructions: ${instructions}
    
    Original content:
    ${originalText}
    
    Format the output in markdown.
  `;
  
  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return { text: "", error: data.error.message || "Error generating content" };
    }
    
    const generatedText = data.candidates[0].content.parts[0].text;
    return { text: generatedText };
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return { text: "", error: "Failed to communicate with the AI service" };
  }
};
