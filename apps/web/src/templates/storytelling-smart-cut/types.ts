import type { MediaTime } from "@/wasm";
import type { TCanvasSize, TProjectSettings } from "@/project/types";

export interface StorytellingShot {
	id: string;
	title: string;
	startSeconds: number;
	durationSeconds: number;
	angle: "wide-scene" | "close-selfie";
	scriptPrefix?: string;
	headlineText?: string;
	subtitleText?: string;
}

export interface StorytellingBRollConfig {
	orientation: "portrait" | "landscape";
	layout: "full-cutaway" | "card-inset";
	sourceUrl?: string;
	startSeconds: number;
	durationSeconds: number;
	playbackRate?: number;
}

export interface StorytellingDualFontConfig {
	scriptPrefix: string;
	mainText: string;
	accentColor: string;
	startSeconds: number;
	durationSeconds: number;
}

export interface StorytellingTemplateOptions {
	projectName?: string;
	shots?: StorytellingShot[];
	customAudioUrl?: string;
	brandLogoUrl?: string;
}
