"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEditor } from "@/editor/use-editor";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { MagicWand05Icon, Video01Icon } from "@hugeicons/core-free-icons";
import { buildStorytellingSmartCutProject } from "./builder";
import { STORYTELLING_TOKENS } from "./tokens";

export function StorytellingTemplateButton({
	className,
	variant = "outline",
}: {
	className?: string;
	variant?: "outline" | "default";
}) {
	const editor = useEditor();
	const router = useRouter();
	const [isCreating, setIsCreating] = useState(false);

	const handleCreateFromTemplate = async () => {
		if (isCreating) return;
		setIsCreating(true);

		try {
			const project = buildStorytellingSmartCutProject({
				projectName: "Storytelling Smart Cut (9:16)",
			});

			const projectId = await editor.project.createProjectFromTemplate({
				project,
			});

			toast.success("Đã tạo dự án từ Storytelling Smart Cut!", {
				description: "Khung 9:16, chữ Dual-Font Vàng Cam #FF9900 và BGM Acoustic.",
			});

			router.push(`/editor/${projectId}`);
		} catch (error) {
			console.error("Failed to create project from template:", error);
			toast.error("Không thể tạo dự án từ template", {
				description:
					error instanceof Error ? error.message : "Vui lòng thử lại",
			});
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<Button
			size="lg"
			variant={variant}
			className={`border-amber-500/40 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/70 transition-all font-medium ${className ?? ""}`}
			onClick={handleCreateFromTemplate}
			disabled={isCreating}
			title="Tạo dự án mới với Template Storytelling Smart Cut (9:16)"
		>
			<HugeiconsIcon icon={MagicWand05Icon} className="size-4 mr-1.5 text-amber-500" />
			<span className="text-sm font-medium hidden sm:inline">
				{isCreating ? "Đang tạo..." : "Storytelling (9:16)"}
			</span>
			<span className="text-sm font-medium inline sm:hidden">
				{isCreating ? "..." : "9:16"}
			</span>
		</Button>
	);
}
