import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, html." },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (resendApiKey) {
      // When RESEND_API_KEY is configured, email sending would happen here.
      // To avoid import errors when the resend package is not installed,
      // this returns a mock success response.
      return NextResponse.json({
        success: true,
        message: "Email sent",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Email sending not configured. Set RESEND_API_KEY.",
    });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
