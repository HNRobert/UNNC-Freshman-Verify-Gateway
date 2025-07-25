import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const userid = formData.get("userid") as string;
    const username = formData.get("username") as string;

    if (!userid || !username) {
      return NextResponse.json(
        { error: "Missing userid or username" },
        { status: 400 }
      );
    }

    // Create URLSearchParams for the external request
    const params = new URLSearchParams();
    params.append("userid", userid);
    params.append("username", username);

    // Make the request to the external API
    const response = await fetch("https://entry.nottingham.edu.cn/result.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (compatible; UNNC-Verify-Gateway)",
      },
      body: params,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "External API request failed" },
        { status: response.status }
      );
    }

    const content = await response.text();

    // Check if verification was successful
    const isVerified =
      content &&
      content.includes("Congratulations!") &&
      content.includes("专业录取");

    return NextResponse.json({
      success: isVerified,
      content: content,
    });
  } catch (error) {
    console.error("Verification API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
