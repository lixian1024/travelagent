import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Save to a local JSON file (you can later integrate with a database or email service)
    const submissionsDir = join(process.cwd(), "submissions");
    await mkdir(submissionsDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `trip-${timestamp}.json`;
    const filepath = join(submissionsDir, filename);

    await writeFile(
      filepath,
      JSON.stringify(
        {
          ...data,
          submittedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );

    console.log(`New trip submission saved: ${filename}`);
    console.log(JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save submission:", error);
    return NextResponse.json(
      { error: "Failed to save submission" },
      { status: 500 }
    );
  }
}
