import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationId, role } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const pythonResponse = await fetch("http://127.0.0.1:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: message,
        role: role || "employee",
        conversationId: conversationId || null,
      }),
    });

    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text();
      return NextResponse.json(
        { error: "Python API error", details: errorText },
        { status: 500 }
      );
    }

    const data = await pythonResponse.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("CHAT_API_ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}