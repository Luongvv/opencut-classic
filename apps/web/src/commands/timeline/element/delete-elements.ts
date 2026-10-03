import { Command, type CommandResult } from "@/commands/base-command";
import type { SceneTracks } from "@/timeline";
import { EditorCore } from "@/core";
import type { TimelineTrack } from "@/timeline";
import { computeRippleAdjustments, applyRippleAdjustments } from "@/ripple";
import type { EditorSelectionSnapshot } from "@/selection/editor-selection";

function removeTrackElements<TTrack extends TimelineTrack>({
	track,
	elements,
}: {
	track: TTrack;
	elements: { trackId: string; elementId: string }[];
}): TTrack {
	const nextElements = track.elements.filter(
		(element) =>
			!elements.some(
				(target) =>
					target.trackId === track.id && target.elementId === element.id,
			),
	);

	return { ...track, elements: nextElements } as TTrack;
}

export class DeleteElementsCommand extends Command {
	private savedState: SceneTracks | null = null;
	private savedSelection: EditorSelectionSnapshot | null = null;
	private readonly elements: { trackId: string; elementId: string }[];
	private readonly ripple: boolean;

	constructor({
		elements,
		ripple = false,
	}: {
		elements: { trackId: string; elementId: string }[];
		ripple?: boolean;
	}) {
		super();
		this.elements = elements;
		this.ripple = ripple;
	}

	execute(): CommandResult | undefined {
		const editor = EditorCore.getInstance();
		this.savedState = editor.scenes.getActiveScene().tracks;
		this.savedSelection = editor.selection.getSnapshot();

		const deletedTracks: SceneTracks = {
			overlay: this.savedState.overlay.map((track) =>
				removeTrackElements({ track, elements: this.elements }),
			),
			main: removeTrackElements({
				track: this.savedState.main,
				elements: this.elements,
			}),
			audio: this.savedState.audio.map((track) =>
				removeTrackElements({ track, elements: this.elements }),
			),
		};

		// Check if any deleted element was on main track
		const hasMainTrackDeletion = this.elements.some(
			(el) => el.trackId === this.savedState?.main.id,
		);

		let finalTracks = deletedTracks;

		if (this.ripple || hasMainTrackDeletion) {
			const adjustments = computeRippleAdjustments({
				beforeTracks: this.savedState,
				afterTracks: deletedTracks,
			});

			// Only main track deletions should trigger timeline ripple.
			// Secondary track deletions (Text/Sticker/Audio) must NEVER shift their own tracks!
			const mainTrackAdjustments = adjustments.filter(
				(adj) => adj.trackId === this.savedState?.main.id,
			);

			if (mainTrackAdjustments.length > 0) {
				const allAdjustments = [...mainTrackAdjustments];

				// Propagate main track shift to overlay and audio tracks
				for (const adj of mainTrackAdjustments) {
					for (const overlayTrack of this.savedState.overlay) {
						allAdjustments.push({
							trackId: overlayTrack.id,
							afterTime: adj.afterTime,
							shiftAmount: adj.shiftAmount,
						});
					}
					for (const audioTrack of this.savedState.audio) {
						allAdjustments.push({
							trackId: audioTrack.id,
							afterTime: adj.afterTime,
							shiftAmount: adj.shiftAmount,
						});
					}
				}

				finalTracks = applyRippleAdjustments({
					tracks: deletedTracks,
					adjustments: allAdjustments,
				});
			}
		}

		editor.timeline.updateTracks(finalTracks);

		return {
			selection: {
				selectedElements: [],
				selectedKeyframes: [],
				keyframeSelectionAnchor: null,
				selectedMaskPoints: null,
			},
		};
	}

	undo(): void {
		if (this.savedState) {
			const editor = EditorCore.getInstance();
			editor.timeline.updateTracks(this.savedState);
			if (this.savedSelection) {
				editor.selection.restoreSnapshot({ snapshot: this.savedSelection });
			}
		}
	}
}
