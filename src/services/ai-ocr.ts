import type { ExtractedData, Provider } from "../types";

const PROMPT = `You are an expert OCR system specialized in extracting data from documents, mark sheets, result sheets, invoices, tables, and any structured data.

Analyze this image and extract ALL information you can find. Return the data as a valid JSON object with this structure:

{
  "metadata": {
    "field_name": "value"
  },
  "tableHeaders": ["Column1", "Column2", "Column3"],
  "tableData": [
    {"Column1": "value1", "Column2": "value2", "Column3": "value3"}
  ],
  "summary": {
    "field_name": "value"
  },
  "remarks": {
    "field_name": "value"
  }
}

IMPORTANT:
- "metadata" should contain any header information like student name, ID, class, school name, date, term, etc.
- "tableHeaders" should be an array of ALL column headers exactly as they appear in the document
- "tableData" should be an array of objects where each object represents a row, with keys matching the tableHeaders
- "summary" should contain any totals, averages, percentages, positions, or aggregate data
- "remarks" should contain any comments, notes, or remarks sections
- Extract EXACTLY what you see - do not assume or add columns that don't exist
- Preserve the original column names from the document
- If a field is not visible/present, omit it from the response
- Handle handwritten text carefully
- Return ONLY valid JSON, no additional text or markdown`;

async function extractWithGroq(
  base64Image: string,
  mimeType: string,
  apiKey: string
): Promise<ExtractedData> {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PROMPT },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 8192,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API Error: ${error}`);
  }

  const result = await response.json();
  const textContent = result.choices?.[0]?.message?.content;

  if (!textContent) {
    throw new Error("No response from AI");
  }

  return parseResponse(textContent);
}

async function extractWithGemini(
  base64Image: string,
  mimeType: string,
  apiKey: string
): Promise<ExtractedData> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: PROMPT },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API Error: ${error}`);
  }

  const result = await response.json();
  const textContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textContent) {
    throw new Error("No response from AI");
  }

  return parseResponse(textContent);
}

function parseResponse(textContent: string): ExtractedData {
  let jsonStr = textContent;
  const jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }

  try {
    const parsed = JSON.parse(jsonStr.trim());
    if (!parsed.tableHeaders) parsed.tableHeaders = [];
    if (!parsed.tableData) parsed.tableData = [];
    return parsed;
  } catch {
    console.error("Failed to parse AI response:", textContent);
    throw new Error("Failed to parse extracted data");
  }
}

export async function extractData(
  file: File,
  apiKey: string,
  provider: Provider
): Promise<ExtractedData> {
  const arrayBuffer = await file.arrayBuffer();
  const base64Image = btoa(
    new Uint8Array(arrayBuffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );
  const mimeType = file.type || "image/jpeg";

  if (provider === "groq") {
    return extractWithGroq(base64Image, mimeType, apiKey);
  }
  return extractWithGemini(base64Image, mimeType, apiKey);
}
