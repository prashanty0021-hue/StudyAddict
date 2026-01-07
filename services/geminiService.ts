import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { Question, Subject, TestResult, LectureSlide, AIInsight, TextbookChapter } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to generate schema for questions
const questionSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      text: { type: Type.STRING, description: "The question text." },
      options: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "An array of exactly 4 possible answers." 
      },
      correctAnswerIndex: { type: Type.INTEGER, description: "The index (0-3) of the correct answer." },
      explanation: { type: Type.STRING, description: "A brief explanation of why the answer is correct." },
      topic: { type: Type.STRING, description: "The specific sub-topic this question covers." },
      difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
      hint: { type: Type.STRING, description: "A subtle hint that guides the student without giving the answer." }
    },
    required: ["text", "options", "correctAnswerIndex", "explanation", "topic", "difficulty", "hint"]
  }
};

const lectureSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    slides: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Catchy title of the segment" },
          content: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING }, 
            description: "2-3 very short, punchy key phrases. NOT paragraphs." 
          },
          narration: { type: Type.STRING, description: "The spoken script. Casual, professional, deep-dive." },
          visualCue: { type: Type.STRING, description: "One keyword for visual style: 'Chart', 'Money', 'Factory', 'People', 'Globe', 'Law', 'Idea', 'Warning'" }
        },
        required: ["title", "content", "narration", "visualCue"]
      }
    }
  },
  required: ["slides"]
};

const insightSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    strongTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
    weakTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
    projectedBoardScore: { type: Type.INTEGER, description: "Estimated final board exam percentage based on performance" },
    timeManagement: { type: Type.STRING, enum: ["Too Fast", "Good", "Too Slow"] },
    recommendation: { type: Type.STRING, description: "A specific, actionable study plan." }
  },
  required: ["strongTopics", "weakTopics", "projectedBoardScore", "timeManagement", "recommendation"]
};

const textbookSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING },
          body: { type: Type.STRING, description: "Detailed paragraph content." }
        },
        required: ["heading", "body"]
      }
    },
    keyTerms: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["title", "sections", "keyTerms"]
};

export const generateQuestions = async (subject: Subject, topic: string | undefined, count: number, customContext?: string): Promise<Question[]> => {
  if (!apiKey) {
    console.warn("No API Key found. Returning mock questions.");
    return generateMockQuestions(subject, count);
  }

  try {
    let promptContext = `Subject: ${subject}
    ${topic ? `Chapter/Topic: ${topic}` : 'Topics: A mix of key chapters from the 2025-26 syllabus.'}`;

    if (customContext) {
      promptContext = `Subject: ${subject}. CONTEXT: ${customContext}. This is a special request.`;
    }

    const prompt = `Generate ${count} multiple-choice questions for a 12th Standard Commerce student (Maharashtra Board).
    
    ${promptContext}
    
    STRICT REQUIREMENTS:
    1. Questions MUST be based ONLY on the Maharashtra State Board 12th Textbook.
    2. Do NOT include CBSE/ICSE specific content.
    3. Ensure options are realistic and challenging.
    4. Focus on textual concepts, definitions, and case studies relevant to the syllabus.
    5. 'topic' field should be the specific chapter name the question belongs to.
    6. Provide a helpful 'hint' for every question.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        systemInstruction: "You are a strict examiner for the Maharashtra State Board HSC Commerce stream."
      }
    });

    const rawData = JSON.parse(response.text || '[]');
    
    // Add IDs to questions
    return rawData.map((q: any, index: number) => ({
      ...q,
      id: `${Date.now()}-${index}`
    }));

  } catch (error) {
    console.error("Gemini API Error:", error);
    return generateMockQuestions(subject, count);
  }
};

export const generateDeepAnalytics = async (results: TestResult[]): Promise<AIInsight> => {
  if (!apiKey || results.length === 0) {
    return {
      strongTopics: [],
      weakTopics: [],
      projectedBoardScore: 0,
      timeManagement: 'Good',
      recommendation: "Take more tests to generate data."
    };
  }

  try {
    const prompt = `Analyze these test results for a 12th Commerce Student (HSC Board).
    Results History: ${JSON.stringify(results)}
    
    Tasks:
    1. Identify strong and weak chapters based on 'topicBreakdown' or general performance.
    2. Estimate their final Board Exam Percentage (be realistic, slightly conservative).
    3. Evaluate time management (if accuracy is low and time is low = Too Fast).
    4. Provide specific advice.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: insightSchema
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Analytics Error", error);
    return {
        strongTopics: ["Economics"],
        weakTopics: ["BK"],
        projectedBoardScore: 75,
        timeManagement: 'Good',
        recommendation: "Keep practicing."
    };
  }
};

export const generateTextbookContent = async (subject: Subject, topic: string): Promise<TextbookChapter> => {
  if (!apiKey) return { title: topic, sections: [], keyTerms: [] };

  try {
    const prompt = `Generate a detailed TEXTBOOK CHAPTER SUMMARY for '${topic}' in '${subject}' (Maharashtra State Board 12th Commerce 2025-26).
    
    Format:
    - Detailed, readable paragraphs under logical headings.
    - Strict adherence to the official syllabus content.
    - Provide 5-6 Key Terms at the end.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: textbookSchema
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { 
      title: topic, 
      sections: [{ heading: "Error", body: "Could not fetch content. Check connection." }], 
      keyTerms: [] 
    };
  }
};

export const generateTeacherScript = async (subject: Subject, topic: string, language: string = 'English'): Promise<LectureSlide[]> => {
    if (!apiKey) return [];
  
    try {
      const prompt = `Create a script for a High-Quality Infotainment Style Video (like Vox or Kurzgesagt) for the topic: '${topic}' in '${subject}' (Maharashtra Board).
      Target Language: ${language}
      
      Requirements:
      1. FULL CHAPTER COVERAGE. Do not summarize briefly. Cover every key concept, law, and exception.
      2. Style: Casual, engaging, yet deeply professional. Use analogies and real-world examples.
      3. Visuals: The 'content' array should be text for screen graphics, not just bullet points.
      4. Length: This must be a comprehensive deep dive. Generate as many slides/segments as needed to cover the chapter fully (10+ segments).
      5. 'visualCue': Suggest a visual theme for the segment (e.g., 'Chart', 'Money').
      
      Output Format: JSON with 'slides' array.`;
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: lectureSchema }
      });
      return JSON.parse(response.text || '{}').slides || [];
    } catch (error) { return []; }
};

export const generatePodcastSegments = async (subject: Subject, topic: string, language: string = 'English'): Promise<LectureSlide[]> => {
    if (!apiKey) return [];
    try {
      const prompt = `Create a "NotebookLM" style Deep Dive Audio Podcast script for: '${topic}' in '${subject}'.
      Target Language: ${language}. 
      
      Style:
      - Conversational, two-host vibe (even though voiced by one).
      - Extremely detailed coverage of the entire chapter.
      - "Did you know?" moments and breaking down complex jargon.
      - Casual but educational.
      - Length: Extensive coverage. 8-12 segments.
      
      Output: JSON 'slides' (where each slide is a podcast segment).`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: lectureSchema }
      });
      return JSON.parse(response.text || '{}').slides || [];
    } catch (error) { return []; }
};

export const generateTeacherAudio = async (text: string, voiceName: string = 'Kore'): Promise<string | null> => {
    if (!apiKey) return null;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
    } catch (error) { return null; }
};

const generateMockQuestions = (subject: Subject, count: number): Question[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `mock-${i}`,
    text: `(Mock) Question ${i + 1} for ${subject}`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswerIndex: 0,
    explanation: "Mock Explanation",
    topic: "General",
    difficulty: "Medium",
    hint: "Recall the basic definition."
  }));
};