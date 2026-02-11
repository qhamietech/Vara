import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: "No image found" }, { status: 400 });
    }

    const buffer = await image.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');
    
    // Using your moved .env.local key
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    
    // Using v1beta and the specific Gemini 3 identifier
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
    console.log("API Key found:", apiKey ? "YES (first 4 chars: " + apiKey.substring(0,4) + ")" : "NO");
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: "Analyze this clothing item and return ONLY a JSON object: { \"warmth\": number, \"colorFamily\": \"Neutrals\" | \"Cool\" | \"Warm\", \"category\": string, \"occasion\": string, \"description\": string }" },
            {
              inlineData: {
                mimeType: image.type,
                data: base64Image
              }
            }
          ]
        }]
      })
    });

    const data = await response.json();

    // Check for API errors
    if (data.error) {
      console.error("Google API Error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: data.error.code || 500 });
    }

    // Extract the text content from the direct API response structure
    const responseText = data.candidates[0].content.parts[0].text;
    console.log("Raw AI Response:", responseText);

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : null;

    if (!jsonString) {
      return NextResponse.json({ error: "AI failed to generate valid JSON" }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(jsonString));

  } catch (error: any) {
    console.error("Direct Fetch Error:", error);
    return NextResponse.json({ error: "Connection failed", details: error.message }, { status: 500 });
  }
}