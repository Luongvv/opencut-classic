"use client";

import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/utils/ui";
import { Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface ThemeToggleProps {
	className?: string;
	iconClassName?: string;
	onToggle?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function ThemeToggle({
	className,
	iconClassName,
	onToggle,
}: ThemeToggleProps) {
	const { theme, setTheme } = useTheme();
	// The theme is unknown during SSR; only render theme-dependent text after
	// mount so server and client markup match.
	const [isMounted, setIsMounted] = useState(false);
	useEffect(() => setIsMounted(true), []);

	const label = !isMounted
		? "Toggle theme"
		: theme === "dark"
			? "Light"
			: "Dark";

	return (
		<Button
			size="icon"
			variant="ghost"
			className={cn("size-8", className)}
			onClick={(e) => {
				setTheme(theme === "dark" ? "light" : "dark");
				onToggle?.(e);
			}}
		>
			<HugeiconsIcon
				icon={Sun03Icon}
				className={cn("!size-[1.1rem]", iconClassName)}
			/>
			<span className="sr-only">{label}</span>
		</Button>
	);
}
