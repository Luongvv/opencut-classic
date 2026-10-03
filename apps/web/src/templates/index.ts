import type { TProject } from "@/project/types";
import {
	buildStorytellingSmartCutProject,
	STORYTELLING_TOKENS,
	type StorytellingTemplateOptions,
} from "./storytelling-smart-cut";

export interface VideoTemplateDefinition {
	id: string;
	name: string;
	description: string;
	aspectRatio: "9:16" | "16:9" | "1:1";
	canvasSize: { width: number; height: number };
	tags: string[];
	badge?: string;
	createProject: (options?: { projectName?: string }) => TProject;
}

export const TEMPLATES_REGISTRY: Record<string, VideoTemplateDefinition> = {
	"creator/storytelling-smart-cut": {
		id: "creator/storytelling-smart-cut",
		name: "Storytelling Smart Cut (9:16)",
		description:
			"Video người nói kể chuyện & chia sẻ trải nghiệm: Nhịp cắt 3-4s, chữ Vàng Cam #FF9900 Dual-Font trên đầu, Single-Font Micro-Captions, nhạc Acoustic Ducking và 13 SFX.",
		aspectRatio: "9:16",
		canvasSize: {
			width: STORYTELLING_TOKENS.canvas.width,
			height: STORYTELLING_TOKENS.canvas.height,
		},
		tags: ["9:16", "Storytelling", "TikTok/Reels", "Dual-Font", "Amber Orange"],
		badge: "Chuyên biệt",
		createProject: (options) =>
			buildStorytellingSmartCutProject({
				projectName: options?.projectName ?? "Storytelling Smart Cut (9:16)",
			}),
	},
};

export function getAllTemplates(): VideoTemplateDefinition[] {
	return Object.values(TEMPLATES_REGISTRY);
}

export function getTemplateById(
	id: string,
): VideoTemplateDefinition | undefined {
	return TEMPLATES_REGISTRY[id];
}

export * from "./storytelling-smart-cut";
