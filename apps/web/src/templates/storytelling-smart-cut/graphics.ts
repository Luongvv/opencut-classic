import type { GraphicDefinition } from "@/graphics/types";
import { graphicsRegistry } from "@/graphics/registry";
import { STORYTELLING_TOKENS } from "./tokens";

/**
 * 16:9 Landscape Card with Amber Orange border (#FF9900)
 * Designed specifically for horizontal B-Roll overlays and quote callouts
 */
export const storytellingCardInsetGraphic: GraphicDefinition = {
	id: "storytelling-card-inset",
	name: "Storytelling 16:9 Card Inset",
	keywords: ["card", "inset", "storytelling", "amber", "broll"],
	params: [
		{
			key: "fill",
			label: "Background",
			type: "color",
			default: STORYTELLING_TOKENS.colors.cardBackground,
		},
		{
			key: "borderColor",
			label: "Border Color",
			type: "color",
			default: STORYTELLING_TOKENS.colors.cardBorder,
		},
		{
			key: "borderWidth",
			label: "Border Width",
			type: "number",
			default: 4,
			min: 0,
			max: 16,
			step: 1,
		},
		{
			key: "cornerRadius",
			label: "Corner Radius",
			type: "number",
			default: 24,
			min: 0,
			max: 60,
			step: 1,
		},
	],
	render({ ctx, params, width, height }) {
		const fill = String(params.fill ?? STORYTELLING_TOKENS.colors.cardBackground);
		const borderColor = String(params.borderColor ?? STORYTELLING_TOKENS.colors.cardBorder);
		const borderWidth = Math.max(0, Number(params.borderWidth ?? 4));
		const cornerRadius = Math.max(0, Number(params.cornerRadius ?? 24));

		ctx.clearRect(0, 0, width, height);

		const inset = borderWidth / 2;
		const drawWidth = Math.max(1, width - inset * 2);
		const drawHeight = Math.max(1, height - inset * 2);

		ctx.save();
		// Subtle warm drop shadow
		ctx.shadowColor = STORYTELLING_TOKENS.colors.warmGlowShadow;
		ctx.shadowBlur = 18;
		ctx.shadowOffsetY = 6;

		// Card body
		const path = new Path2D();
		path.roundRect(inset, inset, drawWidth, drawHeight, cornerRadius);
		ctx.fillStyle = fill;
		ctx.fill(path);

		// Border
		if (borderWidth > 0) {
			ctx.lineWidth = borderWidth;
			ctx.strokeStyle = borderColor;
			ctx.stroke(path);
		}
		ctx.restore();
	},
};

/**
 * Top-Halo Glowing Backdrop Pill for Dual-Font Headlines
 */
export const storytellingTopHaloBadgeGraphic: GraphicDefinition = {
	id: "storytelling-top-halo-badge",
	name: "Storytelling Top-Halo Glow",
	keywords: ["halo", "badge", "headline", "glow", "storytelling"],
	params: [
		{
			key: "glowIntensity",
			label: "Glow Intensity",
			type: "number",
			default: 28,
			min: 0,
			max: 60,
			step: 1,
		},
		{
			key: "accentColor",
			label: "Glow Color",
			type: "color",
			default: STORYTELLING_TOKENS.colors.amberOrange,
		},
	],
	render({ ctx, params, width, height }) {
		const glowIntensity = Math.max(0, Number(params.glowIntensity ?? 28));
		const accentColor = String(params.accentColor ?? STORYTELLING_TOKENS.colors.amberOrange);

		ctx.clearRect(0, 0, width, height);

		ctx.save();
		const centerX = width / 2;
		const centerY = height / 2;
		const radius = Math.min(width, height) / 2;

		const gradient = ctx.createRadialGradient(
			centerX,
			centerY,
			radius * 0.15,
			centerX,
			centerY,
			radius,
		);
		gradient.addColorStop(0, "rgba(255, 153, 0, 0.42)");
		gradient.addColorStop(0.5, "rgba(255, 153, 0, 0.15)");
		gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

		ctx.fillStyle = gradient;
		ctx.shadowColor = accentColor;
		ctx.shadowBlur = glowIntensity;
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
};

/**
 * Polaroid Warm White Photo Frame with Neon Tape
 */
export const storytellingPolaroidGraphic: GraphicDefinition = {
	id: "storytelling-polaroid-frame",
	name: "Storytelling Polaroid Frame",
	keywords: ["polaroid", "photo", "tape", "storytelling"],
	params: [
		{
			key: "frameColor",
			label: "Frame Color",
			type: "color",
			default: STORYTELLING_TOKENS.colors.polaroidWhite,
		},
		{
			key: "tapeColor",
			label: "Tape Color",
			type: "color",
			default: STORYTELLING_TOKENS.colors.neonTape,
		},
	],
	render({ ctx, params, width, height }) {
		const frameColor = String(params.frameColor ?? STORYTELLING_TOKENS.colors.polaroidWhite);
		const tapeColor = String(params.tapeColor ?? STORYTELLING_TOKENS.colors.neonTape);

		ctx.clearRect(0, 0, width, height);

		ctx.save();
		// Polaroid Body with drop shadow
		ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
		ctx.shadowBlur = 20;
		ctx.shadowOffsetY = 8;

		const bodyPath = new Path2D();
		bodyPath.roundRect(10, 16, width - 20, height - 26, 8);
		ctx.fillStyle = frameColor;
		ctx.fill(bodyPath);

		// Inner photo window cut-out
		ctx.shadowColor = "transparent";
		const photoMargin = 22;
		const photoWidth = width - 20 - photoMargin * 2;
		const photoHeight = (height - 26) * 0.72;
		ctx.fillStyle = "#121316";
		ctx.fillRect(10 + photoMargin, 16 + photoMargin, photoWidth, photoHeight);

		// Neon tape on top
		const tapeWidth = width * 0.32;
		const tapeHeight = 22;
		const tapeX = (width - tapeWidth) / 2;
		const tapeY = 6;

		ctx.save();
		ctx.translate(width / 2, tapeY + tapeHeight / 2);
		ctx.rotate((-2 * Math.PI) / 180);
		ctx.fillStyle = tapeColor;
		ctx.fillRect(-tapeWidth / 2, -tapeHeight / 2, tapeWidth, tapeHeight);
		ctx.restore();

		ctx.restore();
	},
};

const STORYTELLING_GRAPHICS = [
	storytellingCardInsetGraphic,
	storytellingTopHaloBadgeGraphic,
	storytellingPolaroidGraphic,
];

/**
 * Safely registers Storytelling Smart Cut graphics into OpenCut registry
 */
export function registerStorytellingGraphics(): void {
	for (const definition of STORYTELLING_GRAPHICS) {
		if (!graphicsRegistry.has(definition.id)) {
			graphicsRegistry.register({
				key: definition.id,
				definition,
			});
		}
	}
}
