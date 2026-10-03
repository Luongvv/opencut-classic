import type { TCanvasSize } from "@/project/types";
import type { FrameRate } from "opencut-wasm";

export const STORYTELLING_TOKENS = {
	colors: {
		/** Primary accent amber orange from news-media-showcase storytelling */
		amberOrange: "#FF9900",
		/** Crisp white text */
		pureWhite: "#FFFFFF",
		/** Dark studio canvas background */
		studioCanvas: "#060709",
		/** Card border color */
		cardBorder: "#FF9900",
		/** Semi-transparent card background */
		cardBackground: "rgba(15, 17, 23, 0.92)",
		/** Polaroid warm white frame */
		polaroidWhite: "#FAF8F5",
		/** Neon yellow tape on polaroid top */
		neonTape: "#EAFF00",
		/** Warm glow highlight shadow */
		warmGlowShadow: "rgba(255, 153, 0, 0.55)",
	},
	fonts: {
		/** Punchy ALL CAPS bold typography */
		display: "Montserrat",
		displayWeight: "900",
		/** Elegant handwriting lead-in font */
		script: "Dancing Script",
		scriptWeight: "700",
		/** Subtitle font (always Montserrat 900 for single-font readability) */
		subtitles: "Montserrat",
		subtitlesWeight: "900",
	},
	canvas: {
		width: 1080,
		height: 1920,
		fps: { numerator: 30, denominator: 1 } as FrameRate,
		aspectRatio: "9:16" as const,
	},
	layout: {
		/** Pixel coordinates relative to 1080x1920 canvas */
		topHaloY: 140, // 140px from top
		/** Center-relative Y in OpenCut coordinate system (y - 960) */
		topHaloRelativeY: -820,
		/** Script lead-in offset above main punch line */
		scriptLeadInRelativeY: -875,
		/** Center safe zone for speaker face */
		faceSafeZoneTop: 440,
		faceSafeZoneBottom: 920,
		/** Subtitle bottom margin in pixels from bottom */
		subtitleBottomMargin: 270,
		/** Center-relative Y for subtitles in OpenCut (1920 - 270 - 960 = +690) */
		subtitleRelativeY: 690,
	},
	assets: {
		/** Background Indie Acoustic Guitar music loop */
		bgMusic: "/templates/storytelling-smart-cut/music/indie-acoustic-story.mp3",
		/** Default volume for BGM */
		bgMusicVolume: 0.08,
		/** 13 Physical SFX cues */
		sfx: {
			whoosh: "/templates/storytelling-smart-cut/sfx/whoosh.mp3",
			swoosh: "/templates/storytelling-smart-cut/sfx/swoosh.mp3",
			pop: "/templates/storytelling-smart-cut/sfx/pop.mp3",
			ting: "/templates/storytelling-smart-cut/sfx/ting.mp3",
			thud: "/templates/storytelling-smart-cut/sfx/thud.mp3",
			cash: "/templates/storytelling-smart-cut/sfx/cash.mp3",
			ding: "/templates/storytelling-smart-cut/sfx/ding.mp3",
			error: "/templates/storytelling-smart-cut/sfx/error.mp3",
			click: "/templates/storytelling-smart-cut/sfx/click.mp3",
			switch: "/templates/storytelling-smart-cut/sfx/switch.mp3",
			shutter: "/templates/storytelling-smart-cut/sfx/shutter.mp3",
			boom: "/templates/storytelling-smart-cut/sfx/boom.mp3",
			whip: "/templates/storytelling-smart-cut/sfx/whip.mp3",
		},
		/** 3D Icons */
		icons: {
			money: "/templates/storytelling-smart-cut/icons/icon-tui-tien-3d.png",
			fire: "/templates/storytelling-smart-cut/icons/icon-lua-hot-3d.png",
			rocket: "/templates/storytelling-smart-cut/icons/icon-ten-lua-3d.png",
			check: "/templates/storytelling-smart-cut/icons/icon-tich-xanh-3d.png",
			warning: "/templates/storytelling-smart-cut/icons/icon-canh-bao-do.png",
			target: "/templates/storytelling-smart-cut/icons/icon-muc-tieu-3d.png",
			bolt: "/templates/storytelling-smart-cut/icons/icon-tia-set-3d.png",
		},
		/** Brand logos */
		brand: {
			default: "/templates/storytelling-smart-cut/brand/logo-gee-dung-mau.png",
			horizontal: "/templates/storytelling-smart-cut/brand/logo-gee-bang-ngang.png",
			white: "/templates/storytelling-smart-cut/brand/logo-gee-trang.png",
		},
	},
} as const;
