import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

// Since we cannot easily import WASM directly in Next.js Edge/Node without extra config,
// we will parse just the basic names using a lightweight JS parser or simple string matching.
// Wait, actually Next.js 14+ supports WASM with experimental config, or we can just send the filenames!
// Actually, sending the filenames to the browser and letting the browser fetch the files locally is not possible because of CORS/security (browser cannot access `C:\Windows\Fonts`).
// We must return the parsed list.
// For now, I will use a simple utility to extract the font name from the TTF file header, or use the filename as a fallback.

function getFontDirectories(): string[] {
	const platform = os.platform();
	if (platform === "win32") {
		return [path.join(process.env.windir || "C:\\Windows", "Fonts")];
	} else if (platform === "darwin") {
		return [
			"/Library/Fonts",
			"/System/Library/Fonts",
			path.join(os.homedir(), "Library/Fonts"),
		];
	} else {
		return [
			"/usr/share/fonts",
			"/usr/local/share/fonts",
			path.join(os.homedir(), ".fonts"),
			path.join(os.homedir(), ".local/share/fonts"),
		];
	}
}

// Minimal TrueType/OpenType name table parser to get Font Family
function extractFontFamily(buffer: Buffer): string | null {
	try {
		// Basic check for sfnt version
		const sfntVersion = buffer.readUInt32BE(0);
		if (
			sfntVersion !== 0x00010000 && // TrueType
			sfntVersion !== 0x4f54544f // 'OTTO' (CFF)
		) {
			return null;
		}

		const numTables = buffer.readUInt16BE(4);
		let nameTableOffset = 0;

		// Find 'name' table
		for (let i = 0; i < numTables; i++) {
			const offset = 12 + i * 16;
			const tag = buffer.toString("ascii", offset, offset + 4);
			if (tag === "name") {
				nameTableOffset = buffer.readUInt32BE(offset + 8);
				break;
			}
		}

		if (!nameTableOffset) return null;

		const format = buffer.readUInt16BE(nameTableOffset);
		const count = buffer.readUInt16BE(nameTableOffset + 2);
		const stringOffset = buffer.readUInt16BE(nameTableOffset + 4);

		let bestFamily: string | null = null;

		for (let i = 0; i < count; i++) {
			const recordOffset = nameTableOffset + 6 + i * 12;
			const platformID = buffer.readUInt16BE(recordOffset);
			const nameID = buffer.readUInt16BE(recordOffset + 6);
			const length = buffer.readUInt16BE(recordOffset + 8);
			const offset = buffer.readUInt16BE(recordOffset + 10);

			// nameID 1 is Font Family
			if (nameID === 1) {
				const strBuffer = buffer.subarray(
					nameTableOffset + stringOffset + offset,
					nameTableOffset + stringOffset + offset + length,
				);
				let family = "";
				if (platformID === 3 || platformID === 0) {
					// Windows (UTF-16BE) or Unicode
					for (let j = 0; j < strBuffer.length; j += 2) {
						family += String.fromCharCode(strBuffer.readUInt16BE(j));
					}
				} else {
					// Mac (MacRoman)
					family = strBuffer.toString("ascii");
				}

				// Prefer Windows/Unicode strings (they're usually more standard)
				if (platformID === 3 || platformID === 0) {
					return family.replace(/\0/g, "");
				} else {
					bestFamily = family.replace(/\0/g, "");
				}
			}
		}

		return bestFamily;
	} catch (e) {
		return null;
	}
}

interface FontInfo {
	family: string;
	path: string;
	weight: number;
	italic: boolean;
}

let cachedFonts: FontInfo[] | null = null;

export async function GET() {
	if (cachedFonts) {
		return NextResponse.json({ fonts: cachedFonts });
	}

	const directories = getFontDirectories();
	const fonts: FontInfo[] = [];
	const seenFamilies = new Set<string>();

	for (const dir of directories) {
		if (!fs.existsSync(dir)) continue;

		try {
			const files = fs.readdirSync(dir);
			for (const file of files) {
				if (!file.toLowerCase().endsWith(".ttf") && !file.toLowerCase().endsWith(".otf")) {
					continue;
				}

				const filePath = path.join(dir, file);
				try {
					// Read first 16KB to parse header
					const fd = fs.openSync(filePath, "r");
					const buffer = Buffer.alloc(16384);
					fs.readSync(fd, buffer, 0, 16384, 0);
					fs.closeSync(fd);

					const family = extractFontFamily(buffer);
					if (family && !seenFamilies.has(family)) {
						seenFamilies.add(family);
						
						// Basic weight/italic detection from filename for fallback
						const lowerFile = file.toLowerCase();
						const italic = lowerFile.includes("italic") || lowerFile.includes("it");
						let weight = 400;
						if (lowerFile.includes("bold") || lowerFile.includes("bd")) weight = 700;
						else if (lowerFile.includes("light") || lowerFile.includes("l")) weight = 300;
						else if (lowerFile.includes("black")) weight = 900;
						else if (lowerFile.includes("medium")) weight = 500;

						fonts.push({
							family,
							path: filePath,
							weight,
							italic,
						});
					}
				} catch (e) {
					// Ignore unreadable files
				}
			}
		} catch (e) {
			// Ignore directory errors
		}
	}

	fonts.sort((a, b) => a.family.localeCompare(b.family));
	cachedFonts = fonts;

	return NextResponse.json({ fonts });
}
