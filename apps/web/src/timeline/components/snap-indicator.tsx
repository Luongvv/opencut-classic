"use client";

import { useEffect, useRef, useState } from "react";
import { useSnapIndicatorPosition } from "@/timeline/hooks/use-snap-indicator-position";
import type { SnapPoint } from "@/timeline/snapping";
import { TIMELINE_LAYERS } from "./layers";
import { TIMELINE_TRACK_LABELS_COLUMN_WIDTH_PX } from "./layout";
import { HugeiconsIcon } from "@hugeicons/react";
import { MagnetIcon } from "@hugeicons/core-free-icons";

interface SnapIndicatorProps {
	snapPoint: SnapPoint | null;
	zoomLevel: number;
	isVisible: boolean;
	timelineRef: React.RefObject<HTMLDivElement | null>;
	tracksScrollRef: React.RefObject<HTMLDivElement | null>;
}

export function SnapIndicator({
	snapPoint,
	zoomLevel,
	isVisible,
	timelineRef,
	tracksScrollRef,
}: SnapIndicatorProps) {
	const [activeSnapState, setActiveSnapState] = useState<{
		point: SnapPoint;
		active: boolean;
	} | null>(null);

	const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (isVisible && snapPoint) {
			if (fadeTimeoutRef.current) {
				clearTimeout(fadeTimeoutRef.current);
				fadeTimeoutRef.current = null;
			}
			setActiveSnapState({ point: snapPoint, active: true });
		} else {
			setActiveSnapState((prev) => {
				if (!prev || !prev.active) return prev;
				return { ...prev, active: false };
			});

			if (fadeTimeoutRef.current) {
				clearTimeout(fadeTimeoutRef.current);
			}
			fadeTimeoutRef.current = setTimeout(() => {
				setActiveSnapState(null);
			}, 500);
		}

		return () => {
			if (fadeTimeoutRef.current) {
				clearTimeout(fadeTimeoutRef.current);
			}
		};
	}, [isVisible, snapPoint]);

	const targetSnapPoint = activeSnapState?.point ?? null;

	const { leftPosition, topPosition, height } = useSnapIndicatorPosition({
		snapPoint: targetSnapPoint,
		zoomLevel,
		timelineRef,
		tracksScrollRef,
	});

	if (
		!activeSnapState ||
		!targetSnapPoint ||
		leftPosition < TIMELINE_TRACK_LABELS_COLUMN_WIDTH_PX
	) {
		return null;
	}

	const isCurrentlyActive = activeSnapState.active;

	return (
		<div
			className="pointer-events-none absolute transition-all duration-400 ease-out"
			style={{
				left: `${leftPosition - 8}px`,
				top: topPosition,
				height: `${height}px`,
				width: "16px",
				zIndex: TIMELINE_LAYERS.snapIndicator,
				opacity: isCurrentlyActive ? 1 : 0,
				transform: isCurrentlyActive ? "scaleX(1)" : "scaleX(0.7)",
			}}
		>
			<div className="relative flex size-full items-center justify-center">
				{/* Sleek soft aura glow */}
				<div
					className={`absolute inset-y-0 w-2.5 rounded-full bg-cyan-400/20 blur-[3px] transition-opacity duration-300 dark:bg-cyan-300/25 ${
						isCurrentlyActive ? "opacity-100" : "opacity-0"
					}`}
				/>

				{/* High-intensity glow core beam */}
				<div
					className={`absolute inset-y-0 w-1 bg-cyan-400/35 blur-[1px] transition-opacity duration-300 dark:bg-cyan-300/40 ${
						isCurrentlyActive ? "opacity-100" : "opacity-0"
					}`}
				/>

				{/* Refined central magnetic line with neon glow shadow */}
				<div className="h-full w-[1.5px] rounded-full bg-cyan-400 shadow-[0_0_5px_#38bdf8,0_0_10px_#0284c7] dark:bg-cyan-300" />

				{/* Compact Top Magnetic Lock Badge */}
				<div
					className={`absolute top-2 flex items-center gap-0.5 rounded-full border border-cyan-300/50 bg-cyan-950/90 px-1 py-0.5 text-[8px] font-semibold text-cyan-200 shadow-[0_0_8px_rgba(56,189,248,0.7)] backdrop-blur-xs transition-all duration-300 ${
						isCurrentlyActive ? "scale-100 opacity-100" : "scale-75 opacity-0"
					}`}
				>
					<HugeiconsIcon
						icon={MagnetIcon}
						className="size-2 animate-pulse text-cyan-300"
					/>
					<span className="leading-none">DÍNH</span>
				</div>

				{/* Bottom connection dot */}
				<div
					className={`absolute bottom-2 size-1.5 rounded-full border border-cyan-200 bg-cyan-400 shadow-[0_0_5px_#38bdf8] transition-all duration-300 ${
						isCurrentlyActive ? "scale-100 opacity-100" : "scale-50 opacity-0"
					}`}
				/>
			</div>
		</div>
	);
}
