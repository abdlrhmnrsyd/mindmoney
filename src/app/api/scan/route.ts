import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
    if (!apiKey) {
        return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("receipt") as File;

        if (!file) {
            return NextResponse.json({ error: "No receipt image provided" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const base64Data = Buffer.from(bytes).toString("base64");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are an OCR and financial extraction expert. Analyze the attached receipt image.
Extract the final total amount spent (as a pure number, no currency symbols, no commas, just raw number) and determine the most appropriate category from this list:
"Food & Dining", "Transportation", "Shopping", "Entertainment", "Bills & Utilities", "Health", "Other".
Return ONLY a valid JSON object with exact keys "amount" (number) and "category" (string). Do not return markdown blocks or any other text.`;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: file.type
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        // Clean any potential markdown from the response just in case
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const data = JSON.parse(cleanedText);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Scan API Error:", error);
        return NextResponse.json({ error: "Failed to process receipt" }, { status: 500 });
    }
}
