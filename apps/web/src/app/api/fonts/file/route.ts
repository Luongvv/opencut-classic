import { NextResponse } from "next/server";
import fs from "fs";
import { GET as fetchSystemFonts } from "../system/route";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const family = searchParams.get("family");

	if (!family) {
		return new NextResponse("Missing family", { status: 400 });
	}

	// Re-use system fonts fetcher to get cached fonts list
	const systemResponse = await fetchSystemFonts();
	const systemData = await systemResponse.json();

	if (!systemData.fonts) {
		return new NextResponse("Failed to load fonts", { status: 500 });
	}

	const font = systemData.fonts.find(
		(f: any) => f.family.toLowerCase() === family.toLowerCase()
	);

	if (!font) {
		return new NextResponse("Font not found", { status: 404 });
	}

	try {
		const stat = fs.statSync(font.path);
		const stream = fs.createReadStream(font.path) as any;

		return new NextResponse(stream, {
			headers: {
				"Content-Type": "font/ttf",
				"Content-Length": stat.size.toString(),
				"Content-Disposition": `attachment; filename="${font.family}.ttf"`,
				"Cache-Control": "public, max-age=31536000, immutable",
			},
		});
	} catch (e) {
		return new NextResponse("Error reading font file", { status: 500 });
	}
}
