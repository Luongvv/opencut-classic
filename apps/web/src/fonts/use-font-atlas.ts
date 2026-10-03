import { useState, useMemo, useCallback, useEffect } from "react";
import {
	getCachedFontAtlas,
	loadFontAtlas,
	clearFontAtlasCache,
} from "@/fonts/google-fonts";
import type { FontAtlas } from "@/fonts/types";
import { SYSTEM_FONTS } from "@/fonts/system-fonts";

type Status = "idle" | "loading" | "error";

export function useFontAtlas({ open }: { open: boolean }) {
	const [atlas, setAtlas] = useState<FontAtlas | null>(() =>
		getCachedFontAtlas(),
	);
	const [systemFonts, setSystemFonts] = useState<string[]>([]);
	const [status, setStatus] = useState<Status>(() =>
		getCachedFontAtlas() ? "idle" : "loading",
	);

	useEffect(() => {
		if (!open) return;

		let isMounted = true;
		if (!atlas) {
			setStatus("loading");
			loadFontAtlas().then((data) => {
				if (!isMounted) return;
				if (data) {
					setAtlas(data);
					setStatus(prev => prev === "loading" ? "idle" : prev);
				} else {
					setStatus("error");
				}
			});
		}

		if (systemFonts.length === 0) {
			fetch("/api/fonts/system")
				.then((r) => r.json())
				.then((data) => {
					if (!isMounted) return;
					if (data.fonts) {
						setSystemFonts(data.fonts.map((f: any) => f.family));
					}
				})
				.catch(() => {});
		}

		return () => {
			isMounted = false;
		};
	}, [open, atlas, systemFonts.length]);

	const retry = useCallback(() => {
		clearFontAtlasCache();
		setStatus("loading");
		loadFontAtlas().then((data) => {
			if (data) {
				setAtlas(data);
				setStatus("idle");
			} else {
				setStatus("error");
			}
		});
	}, []);

	const fontNames = useMemo(() => {
		if (!atlas) return [];
		const names = new Set([
			...Object.keys(atlas.fonts),
			...SYSTEM_FONTS,
			...systemFonts,
		]);
		return Array.from(names).sort();
	}, [atlas, systemFonts]);

	return { atlas, status, fontNames, retry };
}
