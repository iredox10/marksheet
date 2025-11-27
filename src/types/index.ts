export interface ExtractedData {
  metadata?: Record<string, string>;
  tableHeaders: string[];
  tableData: Record<string, string | number>[];
  summary?: Record<string, string | number>;
  remarks?: Record<string, string>;
}

export interface ServerConfig {
  defaultProvider: "gemini" | "groq";
  hasGeminiKey: boolean;
  hasGroqKey: boolean;
}

export type Provider = "gemini" | "groq";
