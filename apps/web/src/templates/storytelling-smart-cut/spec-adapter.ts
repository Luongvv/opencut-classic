import type { TProject, TProjectSettings } from "@/project/types";
import type {
	TScene,
	SceneTracks,
	VideoTrack,
	TextTrack,
	AudioTrack,
	GraphicTrack,
	TextElement,
	LibraryAudioElement,
	Bookmark,
} from "@/timeline/types";
import { generateUUID } from "@/utils/id";
import {
	mediaTimeFromSeconds,
	ZERO_MEDIA_TIME,
} from "@/wasm";
import { CURRENT_PROJECT_VERSION } from "@/services/storage/migrations";
import { DEFAULTS } from "@/timeline/defaults";
import { STORYTELLING_TOKENS } from "./tokens";
import { registerStorytellingGraphics } from "./graphics";

export interface AISpecInput {
	templateId?: string;
	slug?: string;
	totalFrames: number;
	video?: {
		mainVideoSrc?: string;
		bgMusic?: string;
		bgMusicVolume?: number;
		brandLogo?: string;
		brandLogoPosition?: string;
		storyHeaderTag?: string;
	};
	faceSafeZone?: { x: number; y: number; width: number; height: number };
	segments: Array<{
		id: string;
		startFrame: number;
		durationFrames: number;
		sourceStartSeconds: number;
		sourceEndSeconds: number;
		frameStyle?: string;
		aRollAngle?: string;
		transcript?: string;
		cameraZoom?: {
			mode?: string;
			startScale?: number;
			endScale?: number;
			sfx?: string;
		};
		transitionIn?: {
			type?: string;
			durationFrames?: number;
			sfx?: string;
		};
		floatingElements?: Array<{
			id?: string;
			kind?: string;
			slot?: string;
			scriptPrefix?: string;
			text?: string;
			stackLines?: string[];
			accentColor?: string;
			sfx?: string;
			startOffsetFrames?: number;
			durationFrames?: number;
		}>;
	}>;
}

/**
 * Converts an AI-generated Storytelling spec.json into an OpenCut TProject
 */
export function convertAISpecToOpenCutProject({
	spec,
	projectName,
}: {
	spec: AISpecInput;
	projectName?: string;
}): TProject {
	registerStorytellingGraphics();

	const fps = STORYTELLING_TOKENS.canvas.fps;
	const totalDuration = mediaTimeFromSeconds({
		seconds: spec.totalFrames / 30,
	});

	const mainTrack: VideoTrack = {
		id: generateUUID(),
		name: "A-Roll (Talking Head)",
		type: "video",
		elements: [],
		muted: false,
		hidden: false,
	};

	const bRollTrack: VideoTrack = {
		id: generateUUID(),
		name: "B-Roll Cutaway (9:16 / 16:9)",
		type: "video",
		elements: [],
		muted: false,
		hidden: false,
	};

	const topHaloTrack: TextTrack = {
		id: generateUUID(),
		name: "Top-Halo Headlines (Dual-Font)",
		type: "text",
		hidden: false,
		elements: [],
	};

	const subtitlesTrack: TextTrack = {
		id: generateUUID(),
		name: "Micro-Captions (Single-Font)",
		type: "text",
		hidden: false,
		elements: [],
	};

	const sfxTrack: AudioTrack = {
		id: generateUUID(),
		name: "SFX (Whoosh, Pop, Ting)",
		type: "audio",
		muted: false,
		elements: [],
	};

	const bookmarks: Bookmark[] = [];

	for (let i = 0; i < spec.segments.length; i++) {
		const seg = spec.segments[i];
		const segStartTime = mediaTimeFromSeconds({ seconds: seg.startFrame / 30 });
		const segDuration = mediaTimeFromSeconds({ seconds: seg.durationFrames / 30 });

		// Add bookmark for segment
		bookmarks.push({
			time: segStartTime,
			note: `Shot ${i + 1}: ${seg.transcript?.slice(0, 28) ?? seg.id}...`,
			color: STORYTELLING_TOKENS.colors.amberOrange,
		});

		// Add transition SFX if present
		const transitionSfx = seg.transitionIn?.sfx || seg.cameraZoom?.sfx;
		if (transitionSfx) {
			const sfxUrl =
				STORYTELLING_TOKENS.assets.sfx[
					transitionSfx as keyof typeof STORYTELLING_TOKENS.assets.sfx
				] ?? STORYTELLING_TOKENS.assets.sfx.whoosh;

			const sfxElement: LibraryAudioElement = {
				id: generateUUID(),
				type: "audio",
				sourceType: "library",
				sourceUrl: sfxUrl,
				name: `SFX ${transitionSfx}`,
				startTime: segStartTime,
				duration: mediaTimeFromSeconds({ seconds: 0.6 }),
				trimStart: ZERO_MEDIA_TIME,
				trimEnd: ZERO_MEDIA_TIME,
				sourceDuration: mediaTimeFromSeconds({ seconds: 0.6 }),
				params: {
					...DEFAULTS.element,
					volume: 0.45,
				} as any,
			};
			sfxTrack.elements.push(sfxElement);
		}

		// Floating elements -> Top-Halo headline text elements
		for (const fe of seg.floatingElements ?? []) {
			const feStartFrame = seg.startFrame + (fe.startOffsetFrames ?? 3);
			const feDurationFrames = fe.durationFrames ?? (seg.durationFrames - 8);
			const feStartTime = mediaTimeFromSeconds({ seconds: feStartFrame / 30 });
			const feDuration = mediaTimeFromSeconds({ seconds: feDurationFrames / 30 });

			// If has script prefix, add script text
			if (fe.scriptPrefix) {
				const scriptElement: TextElement = {
					id: generateUUID(),
					type: "text",
					name: `${seg.id} Script Prefix`,
					startTime: feStartTime,
					duration: feDuration,
					trimStart: ZERO_MEDIA_TIME,
					trimEnd: ZERO_MEDIA_TIME,
					sourceDuration: feDuration,
					hidden: false,
					params: {
						content: fe.scriptPrefix,
						fontSize: 14,
						fontFamily: STORYTELLING_TOKENS.fonts.script,
						color: STORYTELLING_TOKENS.colors.pureWhite,
						textAlign: "center",
						fontWeight: "bold",
						fontStyle: "normal",
						textDecoration: "none",
						letterSpacing: 0,
						lineHeight: 1.1,
						"background.enabled": false,
						"background.color": "#000000",
						"background.cornerRadius": 0,
						"background.paddingX": 0,
						"background.paddingY": 0,
						"background.offsetX": 0,
						"background.offsetY": 0,
						"transform.positionX": 0,
						"transform.positionY": STORYTELLING_TOKENS.layout.scriptLeadInRelativeY,
						"transform.scaleX": 1,
						"transform.scaleY": 1,
						"transform.rotate": -2.5,
						opacity: 1,
						blendMode: "normal",
					},
				};
				topHaloTrack.elements.push(scriptElement);
			}

			// Main headline text
			const headlineText = fe.stackLines?.join(" ") || fe.text || "";
			if (headlineText) {
				const headlineElement: TextElement = {
					id: generateUUID(),
					type: "text",
					name: `${seg.id} Headline`,
					startTime: feStartTime,
					duration: feDuration,
					trimStart: ZERO_MEDIA_TIME,
					trimEnd: ZERO_MEDIA_TIME,
					sourceDuration: feDuration,
					hidden: false,
					params: {
						content: headlineText,
						fontSize: 22,
						fontFamily: STORYTELLING_TOKENS.fonts.display,
						color: STORYTELLING_TOKENS.colors.amberOrange,
						textAlign: "center",
						fontWeight: "bold",
						fontStyle: "normal",
						textDecoration: "none",
						letterSpacing: 2,
						lineHeight: 1.15,
						"background.enabled": false,
						"background.color": "#000000",
						"background.cornerRadius": 0,
						"background.paddingX": 0,
						"background.paddingY": 0,
						"background.offsetX": 0,
						"background.offsetY": 0,
						"transform.positionX": 0,
						"transform.positionY": STORYTELLING_TOKENS.layout.topHaloRelativeY,
						"transform.scaleX": 1,
						"transform.scaleY": 1,
						"transform.rotate": 0,
						opacity: 1,
						blendMode: "normal",
					},
				};
				topHaloTrack.elements.push(headlineElement);
			}

			// Subtitle chunk from transcript
			if (seg.transcript) {
				const subElement: TextElement = {
					id: generateUUID(),
					type: "text",
					name: `${seg.id} Caption`,
					startTime: segStartTime,
					duration: segDuration,
					trimStart: ZERO_MEDIA_TIME,
					trimEnd: ZERO_MEDIA_TIME,
					sourceDuration: segDuration,
					hidden: false,
					params: {
						content: seg.transcript,
						fontSize: 13,
						fontFamily: STORYTELLING_TOKENS.fonts.subtitles,
						color: STORYTELLING_TOKENS.colors.pureWhite,
						textAlign: "center",
						fontWeight: "bold",
						fontStyle: "normal",
						textDecoration: "none",
						letterSpacing: 0.5,
						lineHeight: 1.2,
						"background.enabled": false,
						"background.color": "#000000",
						"background.cornerRadius": 0,
						"background.paddingX": 0,
						"background.paddingY": 0,
						"background.offsetX": 0,
						"background.offsetY": 0,
						"transform.positionX": 0,
						"transform.positionY": STORYTELLING_TOKENS.layout.subtitleRelativeY,
						"transform.scaleX": 1,
						"transform.scaleY": 1,
						"transform.rotate": 0,
						opacity: 1,
						blendMode: "normal",
					},
				};
				subtitlesTrack.elements.push(subElement);
			}
		}
	}

	// Audio Track: BGM
	const bgmTrack: AudioTrack = {
		id: generateUUID(),
		name: "BGM (Indie Acoustic Guitar)",
		type: "audio",
		muted: false,
		elements: [
			{
				id: generateUUID(),
				type: "audio",
				sourceType: "library",
				sourceUrl: spec.video?.bgMusic ?? STORYTELLING_TOKENS.assets.bgMusic,
				name: "Indie Acoustic Story Loop",
				startTime: ZERO_MEDIA_TIME,
				duration: totalDuration,
				trimStart: ZERO_MEDIA_TIME,
				trimEnd: ZERO_MEDIA_TIME,
				sourceDuration: totalDuration,
				params: {
					...DEFAULTS.element,
					volume: spec.video?.bgMusicVolume ?? STORYTELLING_TOKENS.assets.bgMusicVolume,
				} as any,
			},
		],
	};

	const voiceoverTrack: AudioTrack = {
		id: generateUUID(),
		name: "Voiceover (Speech)",
		type: "audio",
		muted: false,
		elements: [],
	};

	const graphicsTrack: GraphicTrack = {
		id: generateUUID(),
		name: "Visual Cards & Top-Halo Glow",
		type: "graphic",
		hidden: false,
		elements: [],
	};

	const tracks: SceneTracks = {
		overlay: [topHaloTrack, subtitlesTrack, graphicsTrack, bRollTrack],
		main: mainTrack,
		audio: [voiceoverTrack, bgmTrack, sfxTrack],
	};

	const scene: TScene = {
		id: generateUUID(),
		name: "Storytelling AI Scene",
		isMain: true,
		tracks,
		bookmarks,
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
		metadata: {
			id: generateUUID(),
			name: projectName ?? spec.slug ?? "Storytelling Smart Cut (AI)",
			duration: totalDuration,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
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
