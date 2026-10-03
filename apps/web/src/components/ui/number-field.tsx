"use client";

import { cn } from "@/utils/ui";
import { clamp } from "@/utils/math";
import { useRef, useState, useLayoutEffect, useEffect, type ComponentProps } from "react";
import { useFocusLock } from "@/hooks/use-focus-lock";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowTurnBackwardIcon, PlusSignIcon, MinusSignIcon } from "@hugeicons/core-free-icons";

const SUFFIX_GAP_PX = 6;

const DRAG_SENSITIVITIES = {
	default: 1,
	slow: 0.5,
} as const;

type DragSensitivity = "default" | "slow";

type ScrubRange = {
	from: number;
	to: number;
	pixelsPerUnit: number;
};

type ScrubClamp = {
	min?: number;
	max?: number;
};

function clampScrubValue({
	value,
	min,
	max,
}: {
	value: number;
	min?: number;
	max?: number;
}): number {
	if (min != null && max != null) return clamp({ value, min, max });
	if (min != null) return Math.max(min, value);
	if (max != null) return Math.min(max, value);
	return value;
}

function getActiveRange({
	value,
	direction,
	ranges,
}: {
	value: number;
	direction: number;
	ranges: readonly ScrubRange[];
}): ScrubRange | undefined {
	return ranges.find((range) =>
		direction > 0
			? value >= range.from && value < range.to
			: value > range.from && value <= range.to,
	);
}

function scrubAcrossRanges({
	startValue,
	pixelDelta,
	ranges,
	min,
	max,
}: {
	startValue: number;
	pixelDelta: number;
	ranges: readonly ScrubRange[];
	min?: number;
	max?: number;
}): number {
	let currentValue = clampScrubValue({ value: startValue, min, max });
	let remainingPixels = pixelDelta;

	while (remainingPixels !== 0) {
		const direction = Math.sign(remainingPixels);

		const range = getActiveRange({ value: currentValue, direction, ranges });
		if (!range) break;

		const boundary = direction > 0 ? range.to : range.from;
		const pixelsToBoundary =
			Math.abs(boundary - currentValue) * range.pixelsPerUnit;

		if (Math.abs(remainingPixels) <= pixelsToBoundary) {
			currentValue += remainingPixels / range.pixelsPerUnit;
			break;
		}

		currentValue = boundary;
		remainingPixels -= direction * pixelsToBoundary;
	}

	return clampScrubValue({ value: currentValue, min, max });
}

interface NumberFieldProps
	extends Omit<ComponentProps<"input">, "size" | "type"> {
	icon?: React.ReactNode;
	suffix?: string;
	suffixClassName?: string;
	dragSensitivity?: DragSensitivity;
	scrubRanges?: readonly ScrubRange[];
	scrubClamp?: ScrubClamp;
	onScrub?: (value: number) => void;
	onScrubEnd?: () => void;
	allowExpressions?: boolean;
	onReset?: () => void;
	isDefault?: boolean;
	step?: number;
}

function NumberField({
	className,
	icon,
	suffix,
	suffixClassName,
	disabled,
	dragSensitivity = "default",
	scrubRanges,
	scrubClamp,
	onScrub,
	onScrubEnd,
	value,
	allowExpressions = true,
	onKeyDown,
	onFocus,
	onBlur,
	onMouseDown,
	onReset,
	isDefault = false,
	step,
	ref,
	...props
}: NumberFieldProps & { ref?: React.Ref<HTMLInputElement> }) {
	const iconRef = useRef<HTMLButtonElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const ghostRef = useRef<HTMLSpanElement>(null);
	const startValueRef = useRef(0);
	const cumulativeDeltaRef = useRef(0);
	const [isInputFocused, setIsInputFocused] = useState(false);
	const [suffixLeft, setSuffixLeft] = useState(0);
	const ghostValue = Array.isArray(value) ? value.join(", ") : String(value ?? "");

	useLayoutEffect(() => {
		if (!suffix) {
			setSuffixLeft(0);
			return;
		}
		if (!ghostRef.current || !inputRef.current) return;
		if (ghostRef.current.textContent !== ghostValue) {
			ghostRef.current.textContent = ghostValue;
		}
		const paddingLeft =
			parseFloat(getComputedStyle(inputRef.current).paddingLeft) || 0;
		setSuffixLeft(paddingLeft + ghostRef.current.offsetWidth);
	}, [ghostValue, suffix]);

	const { containerRef: wrapperRef } = useFocusLock<HTMLDivElement>({
		isActive: isInputFocused,
		onDismiss: () => inputRef.current?.blur(),
		cursor: "text",
		allowSelector: "input, textarea, [contenteditable]",
	});

	const applyStepChange = (direction: number, multiplier = 1) => {
		if (!onScrub || disabled) return;
		const parsed = parseFloat(String(value ?? "0"));
		const current = Number.isNaN(parsed) ? 0 : parsed;
		const nextValue = current + direction * (step ?? 1) * multiplier;
		const clamped = clampScrubValue({
			value: nextValue,
			min: scrubClamp?.min,
			max: scrubClamp?.max,
		});
		onScrub(clamped);
		onScrubEnd?.();
	};

	useEffect(() => {
		const input = inputRef.current;
		if (!input || !isInputFocused) return;

		let commitTimeout: ReturnType<typeof setTimeout>;

		const handleWheel = (event: WheelEvent) => {
			event.preventDefault();
			const direction = event.deltaY > 0 ? -1 : 1;
			let multiplier = 1;
			if (event.shiftKey) multiplier = 10;
			if (event.altKey) multiplier = 0.1;

			const parsed = parseFloat(String(value ?? "0"));
			const current = Number.isNaN(parsed) ? 0 : parsed;
			const nextValue = current + direction * (step ?? 1) * multiplier;
			const clamped = clampScrubValue({
				value: nextValue,
				min: scrubClamp?.min,
				max: scrubClamp?.max,
			});
			onScrub?.(clamped);

			clearTimeout(commitTimeout);
			commitTimeout = setTimeout(() => {
				onScrubEnd?.();
			}, 300);
		};

		input.addEventListener("wheel", handleWheel, { passive: false });
		return () => {
			input.removeEventListener("wheel", handleWheel);
			clearTimeout(commitTimeout);
		};
	}, [isInputFocused, value, step, scrubClamp, onScrub, onScrubEnd, disabled]);

	const handleIconPointerDown = (event: React.PointerEvent) => {
		if (!onScrub || disabled || event.button !== 0) return;
		const parsed = parseFloat(String(value ?? "0"));
		startValueRef.current = Number.isNaN(parsed) ? 0 : parsed;
		cumulativeDeltaRef.current = 0;
		let hasReceivedFirstMove = false;
		iconRef.current?.requestPointerLock();

		const handlePointerMove = (moveEvent: PointerEvent) => {
			// first movementX after pointer lock often contains a bogus warp delta
			if (!hasReceivedFirstMove) {
				hasReceivedFirstMove = true;
				return;
			}
			cumulativeDeltaRef.current += moveEvent.movementX;
			const newValue = scrubRanges
				? scrubAcrossRanges({
						startValue: startValueRef.current,
						pixelDelta: cumulativeDeltaRef.current,
						ranges: scrubRanges,
						min: scrubClamp?.min,
						max: scrubClamp?.max,
					})
				: startValueRef.current +
					cumulativeDeltaRef.current * DRAG_SENSITIVITIES[dragSensitivity];
			onScrub(newValue);
		};

		const handlePointerUp = () => {
			document.removeEventListener("pointermove", handlePointerMove);
			document.removeEventListener("pointerup", handlePointerUp);
			document.exitPointerLock();
			onScrubEnd?.();
		};

		document.addEventListener("pointermove", handlePointerMove);
		document.addEventListener("pointerup", handlePointerUp);
	};

	const canScrub = Boolean(icon && onScrub);

	const inputNode = (
		<input
			type={allowExpressions ? "text" : "number"}
			inputMode={allowExpressions ? "decimal" : undefined}
			ref={inputRef}
			disabled={disabled}
			value={value}
			className="text-sm leading-none bg-transparent outline-none min-w-0 flex-1 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
			onMouseDown={(event) => {
				const inputElement = event.currentTarget;
				const shouldPreventNativeCaretPlacement =
					event.button === 0 && document.activeElement !== inputElement;
				if (shouldPreventNativeCaretPlacement) {
					event.preventDefault();
					inputElement.focus();
					inputElement.select();
				}
				onMouseDown?.(event);
			}}
			onFocus={(event) => {
				setIsInputFocused(true);
				event.currentTarget.select();
				onFocus?.(event);
			}}
			onKeyDown={(event) => {
				if (event.key === "ArrowUp" || event.key === "ArrowDown") {
					event.preventDefault();
					const direction = event.key === "ArrowUp" ? 1 : -1;
					let multiplier = 1;
					if (event.shiftKey) multiplier = 10;
					if (event.altKey) multiplier = 0.1;
					applyStepChange(direction, multiplier);
					onScrubEnd?.(); // Commits immediately on key press
				}
				const shouldBlurInput = event.key === "Enter" || event.key === "Escape";
				if (shouldBlurInput) event.currentTarget.blur();
				onKeyDown?.(event);
			}}
			onBlur={(event) => {
				setIsInputFocused(false);
				onBlur?.(event);
			}}
			{...props}
		/>
	);

	return (
		<div className="flex items-center gap-1.5 shrink-0">
			<div
				ref={wrapperRef}
				className={cn(
					"border-border bg-accent flex h-7 min-w-0 items-center rounded-md border text-sm outline-none cursor-text disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-within:border-primary focus-within:ring-0 focus-within:ring-primary/10 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
					disabled && "pointer-events-none cursor-not-allowed opacity-50",
					className,
				)}
			>
			{icon &&
				(canScrub ? (
					<button
						ref={iconRef}
						type="button"
						aria-label="Drag to adjust value"
						disabled={disabled}
						className="text-muted-foreground [&_svg]:size-3.5! shrink-0 select-none pl-2.5 text-sm leading-none cursor-ew-resize"
						onMouseDown={(event) => event.preventDefault()}
						onPointerDown={handleIconPointerDown}
					>
						{icon}
					</button>
				) : (
					<span className="text-muted-foreground [&_svg]:size-3.5! shrink-0 select-none pl-2.5 text-sm leading-none">
						{icon}
					</span>
				))}
			<span
				className={cn(
					"relative flex flex-1 min-w-0 items-center",
					icon ? "px-1.5" : "pl-2.5",
					onReset ? "pr-0" : "pr-2.5",
				)}
			>
				{inputNode}
				{suffix && (
					<>
						{/* Ghost mirrors value text to measure width for suffix positioning */}
						<span
							ref={ghostRef}
							className="invisible absolute text-sm leading-none whitespace-pre pointer-events-none"
							aria-hidden="true"
						>
							{ghostValue}
						</span>
						<span
							className={cn(
								"absolute top-1/2 -translate-y-1/2 select-none pointer-events-none text-sm leading-none",
								suffixClassName,
							)}
							style={{ left: suffixLeft + SUFFIX_GAP_PX }}
						>
							{suffix}
						</span>
					</>
				)}
			</span>
		</div>

			<div className="border-border bg-accent flex h-7 shrink-0 items-center overflow-hidden rounded-md border">
				<button
					type="button"
					aria-label="Decrease"
					className="flex h-full w-6 items-center justify-center border-r border-border/50 text-muted-foreground hover:bg-accent-hover hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-50 cursor-pointer transition-colors"
					onClick={() => applyStepChange(-1)}
					disabled={disabled}
				>
					<HugeiconsIcon icon={MinusSignIcon} className="size-3!" />
				</button>
				<button
					type="button"
					aria-label="Increase"
					className="flex h-full w-6 items-center justify-center text-muted-foreground hover:bg-accent-hover hover:text-foreground active:scale-95 disabled:pointer-events-none disabled:opacity-50 cursor-pointer transition-colors"
					onClick={() => applyStepChange(1)}
					disabled={disabled}
				>
					<HugeiconsIcon icon={PlusSignIcon} className="size-3!" />
				</button>
			</div>

			{onReset && !isDefault && (
				<Button
					variant="ghost"
					size="icon"
					aria-label="Reset to default"
					className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
					onClick={onReset}
				>
					<HugeiconsIcon icon={ArrowTurnBackwardIcon} className="size-3.5!" />
				</Button>
			)}
		</div>
	);
}

export { NumberField };
