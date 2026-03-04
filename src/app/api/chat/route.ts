import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
    if (!apiKey) {
        return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 });
    }

    try {
        const { message, contextObj } = await req.json();
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `You are MindMoney AI, a helpful, enthusiastic, and concise AI financial assistant built into the MindMoney app.
Here is a summary of the user's recent financial context (transactions, totals, etc):
${JSON.stringify(contextObj, null, 2)}

Please answer the user's question directly and concisely. Keep responses short (1-3 paragraphs max) unless they ask for a detailed breakdown. Provide financial advice when appropriate. Be friendly and motivating!

User's Question: ${message}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        return NextResponse.json({ reply: responseText });
    } catch (error) {
        console.error("Chat API Error:", error);
        return NextResponse.json({ error: "Failed to process chat request." }, { status: 500 });
    }
}
