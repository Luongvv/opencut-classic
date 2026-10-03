/**
 * CLI Tool: Generate OpenCut Storytelling Project
 * Usage:
 *   bun scripts/generate-storytelling-project.ts [--name "Tên dự án"] [--out "du-an.json"]
 */
import { writeFileSync } from "fs";
import { resolve } from "path";

// 120,000 ticks per second (OpenCut time standard)
const TICKS_PER_SECOND = 120000;
const toTicks = (seconds: number) => Math.round(seconds * TICKS_PER_SECOND);

function generateUUID(): string {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

const args = process.argv.slice(2);
let projectName = "Storytelling Smart Cut (9:16)";
let outFile = "storytelling-project.json";

for (let i = 0; i < args.length; i++) {
	if (args[i] === "--name" && args[i + 1]) {
		projectName = args[i + 1];
		i++;
	} else if (args[i] === "--out" && args[i + 1]) {
		outFile = args[i + 1];
		i++;
	}
}

const totalDurationSec = 10.5;
const totalDurationTicks = toTicks(totalDurationSec);

const project = {
	metadata: {
		id: generateUUID(),
		name: projectName,
		duration: totalDurationTicks,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
	settings: {
		fps: { numerator: 30, denominator: 1 },
		canvasSize: { width: 1080, height: 1920 },
		canvasSizeMode: "preset",
		lastCustomCanvasSize: null,
		originalCanvasSize: null,
		background: {
			type: "color",
			color: "#060709", // Studio Canvas Dark
		},
	},
	scenes: [
		{
			id: generateUUID(),
			name: "Storytelling Smart Cut Scene",
			isMain: true,
			tracks: {
				overlay: [
					// Track 1: Top-Halo Dual-Font Headlines
					{
						id: generateUUID(),
						name: "Top-Halo Headlines (Dual-Font)",
						type: "text",
						hidden: false,
						elements: [
							{
								id: generateUUID(),
								type: "text",
								name: "Hook Lead-in",
								startTime: toTicks(0.1),
								duration: toTicks(3.2),
								trimStart: 0,
								trimEnd: 0,
								hidden: false,
								params: {
									content: "đi làm là",
									fontFamily: "Dancing Script",
									fontSize: 14,
									fontWeight: "bold",
									color: "#FFFFFF",
									textAlign: "center",
									"transform.positionY": -870,
								},
							},
							{
								id: generateUUID(),
								type: "text",
								name: "Hook Keyword",
								startTime: toTicks(0.25),
								duration: toTicks(3.1),
								trimStart: 0,
								trimEnd: 0,
								hidden: false,
								params: {
									content: "CÓ NGAY LÌ XÌ",
									fontFamily: "Montserrat",
									fontSize: 22,
									fontWeight: "bold",
									color: "#FF9900", // Amber Orange
									textAlign: "center",
									letterSpacing: 2,
									"transform.positionY": -810,
								},
							},
							{
								id: generateUUID(),
								type: "text",
								name: "Proof Lead-in",
								startTime: toTicks(3.6),
								duration: toTicks(3.2),
								trimStart: 0,
								trimEnd: 0,
								hidden: false,
								params: {
									content: "môi trường",
									fontFamily: "Dancing Script",
									fontSize: 14,
									fontWeight: "bold",
									color: "#FFFFFF",
									textAlign: "center",
									"transform.positionY": -870,
								},
							},
							{
								id: generateUUID(),
								type: "text",
								name: "Proof Keyword",
								startTime: toTicks(3.75),
								duration: toTicks(3.1),
								trimStart: 0,
								trimEnd: 0,
								hidden: false,
								params: {
									content: "MÁY LẠNH 24/7",
									fontFamily: "Montserrat",
									fontSize: 22,
									fontWeight: "bold",
									color: "#FF9900",
									textAlign: "center",
									letterSpacing: 2,
									"transform.positionY": -810,
								},
							},
							{
								id: generateUUID(),
								type: "text",
								name: "CTA Lead-in",
								startTime: toTicks(7.1),
								duration: toTicks(3.2),
								trimStart: 0,
								trimEnd: 0,
								hidden: false,
								params: {
									content: "nhắn tin ngay",
									fontFamily: "Dancing Script",
									fontSize: 14,
									fontWeight: "bold",
									color: "#FFFFFF",
									textAlign: "center",
									"transform.positionY": -870,
								},
							},
							{
								id: generateUUID(),
								type: "text",
								name: "CTA Keyword",
								startTime: toTicks(7.25),
								duration: toTicks(3.1),
								trimStart: 0,
								trimEnd: 0,
								hidden: false,
								params: {
									content: "NHẬN VIỆC LIỀN TAY",
									fontFamily: "Montserrat",
									fontSize: 22,
									fontWeight: "bold",
									color: "#FF9900",
									textAlign: "center",
									letterSpacing: 2,
									"transform.positionY": -810,
								},
							},
						],
					},
					// Track 2: Micro-Captions (Single-Font Montserrat 900)
					{
						id: generateUUID(),
						name: "Micro-Captions (Montserrat 900)",
						type: "text",
						hidden: false,
						elements: [
							{
								id: generateUUID(),
								type: "text",
								name: "Cap 1",
								startTime: toTicks(0.15),
								duration: toTicks(1.4),
								trimStart: 0,
								trimEnd: 0,
								hidden: false,
								params: {
									content: "Đi làm là",
									fontFamily: "Montserrat",
									fontSize: 12,
									fontWeight: "bold",
									color: "#FFFFFF",
									textAlign: "center",
									"transform.positionY": 690,
								},
							},
							{
								id: generateUUID(),
								type: "text",
								name: "Cap 2 (Highlight)",
								startTime: toTicks(1.55),
								duration: toTicks(1.8),
								trimStart: 0,
								trimEnd: 0,
								hidden: false,
								params: {
									content: "CÓ NGAY LÌ XÌ",
									fontFamily: "Montserrat",
									fontSize: 14,
									fontWeight: "bold",
									color: "#FF9900", // Amber Orange
									textAlign: "center",
									"transform.positionY": 690,
								},
							},
							{
								id: generateUUID(),
								type: "text",
								name: "Cap 3",
								startTime: toTicks(3.65),
								duration: toTicks(1.5),
								trimStart: 0,
								trimEnd: 0,
								hidden: false,
								params: {
									content: "Môi trường làm việc",
									fontFamily: "Montserrat",
									fontSize: 12,
									fontWeight: "bold",
									color: "#FFFFFF",
									textAlign: "center",
									"transform.positionY": 690,
								},
							},
							{
								id: generateUUID(),
								type: "text",
								name: "Cap 4 (Highlight)",
								startTime: toTicks(5.15),
								duration: toTicks(1.7),
								trimStart: 0,
								trimEnd: 0,
								hidden: false,
								params: {
									content: "MÁY LẠNH 24/7",
									fontFamily: "Montserrat",
									fontSize: 14,
									fontWeight: "bold",
									color: "#FF9900",
									textAlign: "center",
									"transform.positionY": 690,
								},
							},
							{
								id: generateUUID(),
								type: "text",
								name: "Cap 5",
								startTime: toTicks(7.15),
								duration: toTicks(1.5),
								trimStart: 0,
								trimEnd: 0,
								hidden: false,
								params: {
									content: "Nhắn tin ngay cho mình",
									fontFamily: "Montserrat",
									fontSize: 12,
									fontWeight: "bold",
									color: "#FFFFFF",
									textAlign: "center",
									"transform.positionY": 690,
								},
							},
							{
								id: generateUUID(),
								type: "text",
								name: "Cap 6 (Highlight)",
								startTime: toTicks(8.65),
								duration: toTicks(1.7),
								trimStart: 0,
								trimEnd: 0,
								hidden: false,
								params: {
									content: "NHẬN VIỆC LIỀN TAY",
									fontFamily: "Montserrat",
									fontSize: 14,
									fontWeight: "bold",
									color: "#FF9900",
									textAlign: "center",
									"transform.positionY": 690,
								},
							},
						],
					},
					// Track 3: Visual Cards
					{
						id: generateUUID(),
						name: "Visual Cards & Ambient Glow",
						type: "graphic",
						hidden: false,
						elements: [
							{
								id: generateUUID(),
								type: "graphic",
								definitionId: "storytelling-top-halo-badge",
								name: "Top-Halo Glow",
								startTime: 0,
								duration: totalDurationTicks,
								trimStart: 0,
								trimEnd: 0,
								hidden: false,
								params: {
									"transform.positionY": -820,
									"transform.scaleX": 1.2,
									"transform.scaleY": 0.5,
									opacity: 0.85,
								},
							},
						],
					},
					// Track 4: B-Roll Cutaway
					{
						id: generateUUID(),
						name: "B-Roll Cutaway (9:16 / 16:9)",
						type: "video",
						hidden: false,
						muted: false,
						elements: [],
					},
				],
				main: {
					id: generateUUID(),
					name: "A-Roll (Talking Head)",
					type: "video",
					muted: false,
					hidden: false,
					elements: [],
				},
				audio: [
					// Audio 1: Voiceover
					{
						id: generateUUID(),
						name: "Voiceover (Speech)",
						type: "audio",
						muted: false,
						elements: [],
					},
					// Audio 2: BGM
					{
						id: generateUUID(),
						name: "BGM (Indie Acoustic Guitar)",
						type: "audio",
						muted: false,
						elements: [
							{
								id: generateUUID(),
								type: "audio",
								sourceType: "library",
								sourceUrl: "/templates/storytelling-smart-cut/music/indie-acoustic-story.mp3",
								name: "Indie Acoustic Story Loop",
								startTime: 0,
								duration: totalDurationTicks,
								trimStart: 0,
								trimEnd: 0,
								params: { volume: 0.08 },
							},
						],
					},
					// Audio 3: SFX
					{
						id: generateUUID(),
						name: "SFX (Whoosh, Pop, Ting)",
						type: "audio",
						muted: false,
						elements: [
							{
								id: generateUUID(),
								type: "audio",
								sourceType: "library",
								sourceUrl: "/templates/storytelling-smart-cut/sfx/whoosh.mp3",
								name: "Whoosh Transition In",
								startTime: toTicks(0.05),
								duration: toTicks(0.65),
								trimStart: 0,
								trimEnd: 0,
								params: { volume: 0.45 },
							},
							{
								id: generateUUID(),
								type: "audio",
								sourceType: "library",
								sourceUrl: "/templates/storytelling-smart-cut/sfx/pop.mp3",
								name: "Pop Headline Punch",
								startTime: toTicks(0.25),
								duration: toTicks(0.4),
								trimStart: 0,
								trimEnd: 0,
								params: { volume: 0.5 },
							},
							{
								id: generateUUID(),
								type: "audio",
								sourceType: "library",
								sourceUrl: "/templates/storytelling-smart-cut/sfx/whoosh.mp3",
								name: "Whoosh Shot 2 Cut",
								startTime: toTicks(3.5),
								duration: toTicks(0.65),
								trimStart: 0,
								trimEnd: 0,
								params: { volume: 0.45 },
							},
							{
								id: generateUUID(),
								type: "audio",
								sourceType: "library",
								sourceUrl: "/templates/storytelling-smart-cut/sfx/ting.mp3",
								name: "Ting Stat Highlight",
								startTime: toTicks(3.75),
								duration: toTicks(0.5),
								trimStart: 0,
								trimEnd: 0,
								params: { volume: 0.48 },
							},
							{
								id: generateUUID(),
								type: "audio",
								sourceType: "library",
								sourceUrl: "/templates/storytelling-smart-cut/sfx/whoosh.mp3",
								name: "Whoosh Shot 3 CTA",
								startTime: toTicks(7.0),
								duration: toTicks(0.65),
								trimStart: 0,
								trimEnd: 0,
								params: { volume: 0.45 },
							},
							{
								id: generateUUID(),
								type: "audio",
								sourceType: "library",
								sourceUrl: "/templates/storytelling-smart-cut/sfx/thud.mp3",
								name: "Thud Final Hit",
								startTime: toTicks(7.25),
								duration: toTicks(0.5),
								trimStart: 0,
								trimEnd: 0,
								params: { volume: 0.55 },
							},
						],
					},
				],
			},
			bookmarks: [
				{ time: 0, note: "Phase 1: Hook (0s - 3.5s)", color: "#FF9900" },
				{ time: toTicks(3.5), note: "Phase 2: Core Proof (3.5s - 7.0s)", color: "#FF9900" },
				{ time: toTicks(7.0), note: "Phase 3: Outro CTA (7.0s - 10.5s)", color: "#FF9900" },
			],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
	],
	currentSceneId: "",
	version: 31,
};

project.currentSceneId = project.scenes[0].id;

const outputPath = resolve(process.cwd(), outFile);
writeFileSync(outputPath, JSON.stringify(project, null, 2), "utf-8");

console.log("\n========================================================");
console.log("   TẠO DỰ ÁN STORYTELLING SMART CUT THÀNH CÔNG!");
console.log("========================================================");
console.log(`- Tên dự án:    ${projectName}`);
console.log(`- Tỷ lệ khung:   9:16 (1080x1920 @ 30fps)`);
console.log(`- Thời lượng:   ${totalDurationSec}s (${totalDurationTicks} ticks)`);
console.log(`- Hệ thống:     8 Track phân lớp (Top-Halo, Captions, Glow, B-Roll, A-Roll, Voice, BGM, SFX)`);
console.log(`- File xuất ra: ${outputPath}`);
console.log("========================================================\n");
