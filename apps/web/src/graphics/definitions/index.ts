import { graphicsRegistry } from "../registry";
import { ellipseGraphicDefinition } from "./ellipse";
import { polygonGraphicDefinition } from "./polygon";
import { rectangleGraphicDefinition } from "./rectangle";
import { starGraphicDefinition } from "./star";
// Imported directly (not via "@/templates") to avoid pulling the template
// builder into the graphics module and creating an import cycle.
import { registerStorytellingGraphics } from "@/templates/storytelling-smart-cut/graphics";

const defaultGraphicDefinitions = [
	rectangleGraphicDefinition,
	ellipseGraphicDefinition,
	polygonGraphicDefinition,
	starGraphicDefinition,
];

export function registerDefaultGraphics(): void {
	for (const definition of defaultGraphicDefinitions) {
		if (graphicsRegistry.has(definition.id)) {
			continue;
		}
		graphicsRegistry.register({
			key: definition.id,
			definition,
		});
	}
	// Template graphics must be resolvable whenever a saved project is opened,
	// not only at the moment the template project is created.
	registerStorytellingGraphics();
}

export {
	ellipseGraphicDefinition,
	polygonGraphicDefinition,
	rectangleGraphicDefinition,
	starGraphicDefinition,
};
export { STROKE_ALIGN_PARAM } from "./shared";
