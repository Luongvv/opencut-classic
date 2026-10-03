import type {
	TProject,
	TProjectMetadata,
	TProjectSettings,
} from "@/project/types";
import type {
	TScene,
	SceneTracks,
	VideoTrack,
	TextTrack,
	AudioTrack,
	GraphicTrack,
	TextElement,
	GraphicElement,
	LibraryAudioElement,
} from "@/timeline/types";
import { generateUUID } from "@/utils/id";
import {
	mediaTimeFromSeconds,
	ZERO_MEDIA_TIME,
	type MediaTime,
} from "@/wasm";
import { CURRENT_PROJECT_VERSION } from "@/services/storage/migrations";
import { DEFAULTS } from "@/timeline/defaults";
import { STORYTELLING_TOKENS } from "./tokens";
import { registerStorytellingGraphics } from "./graphics";
import type { StorytellingTemplateOptions } from "./types";

/**
 * Helper to build a styled Storytelling Text Element (Dual-Font or Subtitle)
 */
function createStorytellingTextElement({
	name,
	content,
	fontFamily,
	fontWeight,
	fontSize,
	color,
	positionX = 0,
	positionY,
	startTimeSeconds,
	durationSeconds,
	letterSpacing = 0,
	backgroundColor,
}: {
	name: string;
	content: string;
	fontFamily: string;
	fontWeight: "normal" | "bold";
	fontSize: number;
	color: string;
	positionX?: number;
	positionY: number;
	startTimeSeconds: number;
	durationSeconds: number;
	letterSpacing?: number;
	backgroundColor?: string;
}): TextElement {
	const startTime = mediaTimeFromSeconds({ seconds: startTimeSeconds });
	const duration = mediaTimeFromSeconds({ seconds: durationSeconds });

	return {
		id: generateUUID(),
		type: "text",
		name,
		duration,
		startTime,
		trimStart: ZERO_MEDIA_TIME,
		trimEnd: ZERO_MEDIA_TIME,
		sourceDuration: duration,
		hidden: false,
		params: {
			content,
			fontSize,
			fontFamily,
			color,
			textAlign: "center",
			fontWeight,
			fontStyle: "normal",
			textDecoration: "none",
			letterSpacing,
			lineHeight: 1.15,
			"background.enabled": Boolean(backgroundColor),
			"background.color": backgroundColor ?? "#000000",
			"background.cornerRadius": 16,
			"background.paddingX": 24,
			"background.paddingY": 12,
			"background.offsetX": 0,
			"background.offsetY": 0,
			"transform.positionX": positionX,
			"transform.positionY": positionY,
			"transform.scaleX": 1,
			"transform.scaleY": 1,
			"transform.rotate": 0,
			opacity: 1,
			blendMode: "normal",
		},
	};
}

/**
 * Helper to build a Library Audio Element (BGM or SFX)
 */
function createStorytellingAudioElement({
	name,
	sourceUrl,
	startTimeSeconds,
	durationSeconds,
	volume = 1,
}: {
	name: string;
	sourceUrl: string;
	startTimeSeconds: number;
	durationSeconds: number;
	volume?: number;
}): LibraryAudioElement {
	const startTime = mediaTimeFromSeconds({ seconds: startTimeSeconds });
	const duration = mediaTimeFromSeconds({ seconds: durationSeconds });

	return {
		id: generateUUID(),
		type: "audio",
		sourceType: "library",
		sourceUrl,
		name,
		duration,
		startTime,
		trimStart: ZERO_MEDIA_TIME,
		trimEnd: ZERO_MEDIA_TIME,
		sourceDuration: duration,
		params: {
			...DEFAULTS.element,
			volume,
		} as any,
	};
}

/**
 * Builds the complete multi-track Scene for Storytelling Smart Cut (9:16)
 */
export function buildStorytellingSmartCutScene(
	options?: StorytellingTemplateOptions,
): TScene {
	registerStorytellingGraphics();

	const totalDurationSeconds = 10.5;
	const totalDuration = mediaTimeFromSeconds({ seconds: totalDurationSeconds });

	// Track 1: Main Video (A-Roll Talking Head)
	const mainTrack: VideoTrack = {
		id: generateUUID(),
		name: "A-Roll (Talking Head)",
		type: "video",
		elements: [],
		muted: false,
		hidden: false,
	};

	// Track 2: Overlay B-Roll Video/Image
	const bRollTrack: VideoTrack = {
		id: generateUUID(),
		name: "B-Roll Cutaway (9:16 / 16:9)",
		type: "video",
		elements: [],
		muted: false,
		hidden: false,
	};

	// Track 3: Top-Halo Headlines (Dual-Font: Dancing Script + Montserrat 900)
	const topHaloHeadlinesTrack: TextTrack = {
		id: generateUUID(),
		name: "Top-Halo Headlines (Dual-Font)",
		type: "text",
		hidden: false,
		elements: [
			// Shot 1: Hook Headline
			createStorytellingTextElement({
				name: "Hook Prefix",
				content: "đi làm là",
				fontFamily: STORYTELLING_TOKENS.fonts.script,
				fontWeight: "bold",
				fontSize: 14,
				color: STORYTELLING_TOKENS.colors.pureWhite,
				positionY: STORYTELLING_TOKENS.layout.scriptLeadInRelativeY,
				startTimeSeconds: 0.1,
				durationSeconds: 3.2,
			}),
			createStorytellingTextElement({
				name: "Hook Keyword",
				content: "CÓ NGAY LÌ XÌ",
				fontFamily: STORYTELLING_TOKENS.fonts.display,
				fontWeight: "bold",
				fontSize: 22,
				color: STORYTELLING_TOKENS.colors.amberOrange,
				positionY: STORYTELLING_TOKENS.layout.topHaloRelativeY,
				startTimeSeconds: 0.25,
				durationSeconds: 3.1,
				letterSpacing: 2,
			}),

			// Shot 2: Core Proof Headline
			createStorytellingTextElement({
				name: "Proof Prefix",
				content: "môi trường",
				fontFamily: STORYTELLING_TOKENS.fonts.script,
				fontWeight: "bold",
				fontSize: 14,
				color: STORYTELLING_TOKENS.colors.pureWhite,
				positionY: STORYTELLING_TOKENS.layout.scriptLeadInRelativeY,
				startTimeSeconds: 3.6,
				durationSeconds: 3.2,
			}),
			createStorytellingTextElement({
				name: "Proof Keyword",
				content: "MÁY LẠNH 24/7",
				fontFamily: STORYTELLING_TOKENS.fonts.display,
				fontWeight: "bold",
				fontSize: 22,
				color: STORYTELLING_TOKENS.colors.amberOrange,
				positionY: STORYTELLING_TOKENS.layout.topHaloRelativeY,
				startTimeSeconds: 3.75,
				durationSeconds: 3.1,
				letterSpacing: 2,
			}),

			// Shot 3: Outro CTA Headline
			createStorytellingTextElement({
				name: "CTA Prefix",
				content: "nhắn tin ngay",
				fontFamily: STORYTELLING_TOKENS.fonts.script,
				fontWeight: "bold",
				fontSize: 14,
				color: STORYTELLING_TOKENS.colors.pureWhite,
				positionY: STORYTELLING_TOKENS.layout.scriptLeadInRelativeY,
				startTimeSeconds: 7.1,
				durationSeconds: 3.2,
			}),
			createStorytellingTextElement({
				name: "CTA Keyword",
				content: "NHẬN VIỆC LIỀN TAY",
				fontFamily: STORYTELLING_TOKENS.fonts.display,
				fontWeight: "bold",
				fontSize: 22,
				color: STORYTELLING_TOKENS.colors.amberOrange,
				positionY: STORYTELLING_TOKENS.layout.topHaloRelativeY,
				startTimeSeconds: 7.25,
				durationSeconds: 3.1,
				letterSpacing: 2,
			}),
		],
	};

	// Track 4: Single-Font Micro-Captions (Montserrat 900 at bottom 270px)
	const microCaptionsTrack: TextTrack = {
		id: generateUUID(),
		name: "Micro-Captions (Montserrat 900)",
		type: "text",
		hidden: false,
		elements: [
			createStorytellingTextElement({
				name: "Sub 1 - Lead",
				content: "Đi làm là",
				fontFamily: STORYTELLING_TOKENS.fonts.subtitles,
				fontWeight: "bold",
				fontSize: 12,
				color: STORYTELLING_TOKENS.colors.pureWhite,
				positionY: STORYTELLING_TOKENS.layout.subtitleRelativeY,
				startTimeSeconds: 0.15,
				durationSeconds: 1.4,
			}),
			createStorytellingTextElement({
				name: "Sub 2 - Punch",
				content: "CÓ NGAY LÌ XÌ",
				fontFamily: STORYTELLING_TOKENS.fonts.subtitles,
				fontWeight: "bold",
				fontSize: 14,
				color: STORYTELLING_TOKENS.colors.amberOrange,
				positionY: STORYTELLING_TOKENS.layout.subtitleRelativeY,
				startTimeSeconds: 1.55,
				durationSeconds: 1.8,
			}),
			createStorytellingTextElement({
				name: "Sub 3 - Lead",
				content: "Môi trường làm việc",
				fontFamily: STORYTELLING_TOKENS.fonts.subtitles,
				fontWeight: "bold",
				fontSize: 12,
				color: STORYTELLING_TOKENS.colors.pureWhite,
				positionY: STORYTELLING_TOKENS.layout.subtitleRelativeY,
				startTimeSeconds: 3.65,
				durationSeconds: 1.5,
			}),
			createStorytellingTextElement({
				name: "Sub 4 - Punch",
				content: "MÁY LẠNH 24/7",
				fontFamily: STORYTELLING_TOKENS.fonts.subtitles,
				fontWeight: "bold",
				fontSize: 14,
				color: STORYTELLING_TOKENS.colors.amberOrange,
				positionY: STORYTELLING_TOKENS.layout.subtitleRelativeY,
				startTimeSeconds: 5.15,
				durationSeconds: 1.7,
			}),
			createStorytellingTextElement({
				name: "Sub 5 - Lead",
				content: "Nhắn tin ngay cho mình",
				fontFamily: STORYTELLING_TOKENS.fonts.subtitles,
				fontWeight: "bold",
				fontSize: 12,
				color: STORYTELLING_TOKENS.colors.pureWhite,
				positionY: STORYTELLING_TOKENS.layout.subtitleRelativeY,
				startTimeSeconds: 7.15,
				durationSeconds: 1.5,
			}),
			createStorytellingTextElement({
				name: "Sub 6 - Punch",
				content: "NHẬN VIỆC LIỀN TAY",
				fontFamily: STORYTELLING_TOKENS.fonts.subtitles,
				fontWeight: "bold",
				fontSize: 14,
				color: STORYTELLING_TOKENS.colors.amberOrange,
				positionY: STORYTELLING_TOKENS.layout.subtitleRelativeY,
				startTimeSeconds: 8.65,
				durationSeconds: 1.7,
			}),
		],
	};

	// Track 5: Graphic Cards / Inset Containers
	const graphicsTrack: GraphicTrack = {
		id: generateUUID(),
		name: "Visual Cards & Top-Halo Glow",
		type: "graphic",
		hidden: false,
		elements: [
			{
				id: generateUUID(),
				type: "graphic",
				definitionId: "storytelling-top-halo-badge",
				name: "Top-Halo Ambient Glow",
				duration: totalDuration,
				startTime: ZERO_MEDIA_TIME,
				trimStart: ZERO_MEDIA_TIME,
				trimEnd: ZERO_MEDIA_TIME,
				sourceDuration: totalDuration,
				hidden: false,
				params: {
					...DEFAULTS.element,
					"transform.positionY": STORYTELLING_TOKENS.layout.topHaloRelativeY,
					"transform.scaleX": 1.2,
					"transform.scaleY": 0.5,
					opacity: 0.85,
				} as any,
			} as GraphicElement,
		],
	};

	// Audio Track 1: Voiceover / Speech
	const voiceoverTrack: AudioTrack = {
		id: generateUUID(),
		name: "Voiceover (Speech)",
		type: "audio",
		muted: false,
		elements: [],
	};

	// Audio Track 2: Background Music with Acoustic Ducking
	const bgmTrack: AudioTrack = {
		id: generateUUID(),
		name: "BGM (Indie Acoustic Guitar)",
		type: "audio",
		muted: false,
		elements: [
			createStorytellingAudioElement({
				name: "Indie Acoustic Story Loop",
				sourceUrl: options?.customAudioUrl ?? STORYTELLING_TOKENS.assets.bgMusic,
				startTimeSeconds: 0,
				durationSeconds: totalDurationSeconds,
				volume: STORYTELLING_TOKENS.assets.bgMusicVolume,
			}),
		],
	};

	// Audio Track 3: Sound Effects (SFX)
	const sfxTrack: AudioTrack = {
		id: generateUUID(),
		name: "SFX (Whoosh, Pop, Ting)",
		type: "audio",
		muted: false,
		elements: [
			createStorytellingAudioElement({
				name: "Whoosh Transition In",
				sourceUrl: STORYTELLING_TOKENS.assets.sfx.whoosh,
				startTimeSeconds: 0.05,
				durationSeconds: 0.65,
				volume: 0.45,
			}),
			createStorytellingAudioElement({
				name: "Pop Headline Punch",
				sourceUrl: STORYTELLING_TOKENS.assets.sfx.pop,
				startTimeSeconds: 0.25,
				durationSeconds: 0.4,
				volume: 0.5,
			}),
			createStorytellingAudioElement({
				name: "Whoosh Shot 2 Cut",
				sourceUrl: STORYTELLING_TOKENS.assets.sfx.whoosh,
				startTimeSeconds: 3.5,
				durationSeconds: 0.65,
				volume: 0.45,
			}),
			createStorytellingAudioElement({
				name: "Ting Stat Highlight",
				sourceUrl: STORYTELLING_TOKENS.assets.sfx.ting,
				startTimeSeconds: 3.75,
				durationSeconds: 0.5,
				volume: 0.48,
			}),
			createStorytellingAudioElement({
				name: "Whoosh Shot 3 CTA",
				sourceUrl: STORYTELLING_TOKENS.assets.sfx.whoosh,
				startTimeSeconds: 7.0,
				durationSeconds: 0.65,
				volume: 0.45,
			}),
			createStorytellingAudioElement({
				name: "Thud Final Hit",
				sourceUrl: STORYTELLING_TOKENS.assets.sfx.thud,
				startTimeSeconds: 7.25,
				durationSeconds: 0.5,
				volume: 0.55,
			}),
		],
	};

	const tracks: SceneTracks = {
		// Overlay tracks ordered top-to-bottom
		overlay: [
			topHaloHeadlinesTrack,
			microCaptionsTrack,
			graphicsTrack,
			bRollTrack,
		],
		main: mainTrack,
		audio: [voiceoverTrack, bgmTrack, sfxTrack],
	};

	return {
		id: generateUUID(),
		name: "Storytelling Smart Cut Scene",
		isMain: true,
		tracks,
		bookmarks: [
			{
				time: ZERO_MEDIA_TIME,
				note: "Phase 1: Hook (0s - 3.5s)",
				color: STORYTELLING_TOKENS.colors.amberOrange,
			},
			{
				time: mediaTimeFromSeconds({ seconds: 3.5 }),
				note: "Phase 2: Core Proof (3.5s - 7.0s)",
				color: STORYTELLING_TOKENS.colors.amberOrange,
			},
			{
				time: mediaTimeFromSeconds({ seconds: 7.0 }),
				note: "Phase 3: Outro CTA (7.0s - 10.5s)",
				color: STORYTELLING_TOKENS.colors.amberOrange,
			},
		],
		createdAt: new Date(),
		updatedAt: new Date(),
	};
}

/**
 * Builds a complete OpenCut TProject initialized with Storytelling Smart Cut template
 */
export function buildStorytellingSmartCutProject(
	options?: StorytellingTemplateOptions,
): TProject {
	const scene = buildStorytellingSmartCutScene(options);

	const metadata: TProjectMetadata = {
		id: generateUUID(),
		name: options?.projectName ?? "Storytelling Smart Cut (9:16)",
		duration: mediaTimeFromSeconds({ seconds: 10.5 }),
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const settings: TProjectSettings = {
		fps: STORYTELLING_TOKENS.canvas.fps,
		canvasSize: {
			width: STORYTELLING_TOKENS.canvas.width,
			height: STORYTELLING_TOKENS.canvas.height,
		},
		canvasSizeMode: "preset",
		lastCustomCanvasSize: null,
		originalCanvasSize: null,
		background: {
			type: "color",
			color: STORYTELLING_TOKENS.colors.studioCanvas,
		},
	};

	return {
		metadata,
		scenes: [scene],
		currentSceneId: scene.id,
		settings,
		version: CURRENT_PROJECT_VERSION,
		timelineViewState: {
			zoomLevel: 1.2,
			scrollLeft: 0,
			playheadTime: ZERO_MEDIA_TIME,
		},
	};
}
