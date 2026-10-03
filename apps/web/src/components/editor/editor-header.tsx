"use client";

import { Button } from "../ui/button";
import { useEffect, useRef, useState } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";
import { RenameProjectDialog } from "@/project/components/rename-project-dialog";
import { DeleteProjectDialog } from "@/project/components/delete-project-dialog";
import { useRouter } from "next/navigation";
import { FaDiscord } from "react-icons/fa6";
import { Download, HardDrive } from "lucide-react";
import { ExportButton } from "./export-button";
import { FeedbackPopover } from "@/feedback/components/feedback-popover";
import { ThemeToggle } from "../theme-toggle";
import { DEFAULT_LOGO_URL } from "@/site/brand";
import { SOCIAL_LINKS } from "@/site/social";
import { toast } from "sonner";
import { useEditor } from "@/editor/use-editor";
import { CommandIcon, Logout05Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShortcutsDialog } from "@/actions/components/shortcuts-dialog";
import Image from "next/image";
import { cn } from "@/utils/ui";

function AutoSaveStatusBadge() {
	const editor = useEditor();
	const diskSave = useEditor((e) => e.save.getDiskSaveStatus());

	const handleManualSync = async () => {
		toast.info("Đang đồng bộ ra ổ đĩa máy tính...");
		await editor.save.syncDiskNow();
	};

	if (diskSave.status === "saving") {
		return (
			<div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2 py-1 rounded bg-muted/40 animate-pulse select-none">
				<span className="size-2 rounded-full bg-amber-500" />
				<span className="hidden sm:inline">Đang lưu máy...</span>
			</div>
		);
	}

	if (diskSave.status === "error") {
		return (
			<button
				type="button"
				onClick={handleManualSync}
				title={`Lỗi lưu: ${diskSave.error || "Không thể ghi file"}\nClick để thử lưu lại`}
				className="flex items-center gap-1 text-xs text-destructive px-2 py-1 rounded hover:bg-destructive/10 cursor-pointer"
			>
				<span>⚠️ Thử lưu lại</span>
			</button>
		);
	}

	if (diskSave.lastSavedAt) {
		const timeStr = diskSave.lastSavedAt.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
		return (
			<button
				type="button"
				onClick={handleManualSync}
				title={`Đã tự động lưu vào:\n${diskSave.filePath || "~/OpenCut_Projects/"}\n(Click để đồng bộ lại ngay bây giờ)`}
				className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted/60 transition-colors cursor-pointer select-none"
			>
				<HardDrive className="size-3.5 text-emerald-500" />
				<span className="hidden sm:inline font-medium">Đã lưu máy</span>
				<span className="text-[11px] font-mono opacity-80">{timeStr}</span>
			</button>
		);
	}

	return null;
}

export function EditorHeader() {
	const editor = useEditor();

	useEffect(() => {
		const handleKeyDown = (e: globalThis.KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
				e.preventDefault();
				void editor.save.flush();
				void editor.save.syncDiskNow();
				toast.success("Đã kích hoạt lưu ra ổ đĩa máy tính!");
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [editor]);

	return (
		<header className="bg-background flex h-[3.4rem] items-center justify-between px-3 pt-0.5">
			<div className="flex items-center gap-2">
				<ProjectDropdown />
				<EditableProjectName />
				<AutoSaveStatusBadge />
			</div>
			<nav className="flex items-center gap-2">
				<FeedbackPopover />
				<ExportButton />
				<ThemeToggle />
			</nav>
		</header>
	);
}

function ProjectDropdown() {
	const [openDialog, setOpenDialog] = useState<
		"delete" | "rename" | "shortcuts" | null
	>(null);
	const [isExiting, setIsExiting] = useState(false);
	const router = useRouter();
	const editor = useEditor();
	const activeProject = useEditor((e) => e.project.getActiveOrNull());

	const handleExit = async () => {
		if (isExiting) return;
		setIsExiting(true);

		try {
			await editor.project.prepareExit();
			editor.project.closeProject();
		} catch (error) {
			console.error("Failed to prepare project exit:", error);
		} finally {
			editor.project.closeProject();
			router.push("/projects");
		}
	};

	const handleSaveProjectName = async (newName: string) => {
		if (
			activeProject &&
			newName.trim() &&
			newName !== activeProject.metadata.name
		) {
			try {
				await editor.project.renameProject({
					id: activeProject.metadata.id,
					name: newName.trim(),
				});
			} catch (error) {
				toast.error("Failed to rename project", {
					description:
						error instanceof Error ? error.message : "Please try again",
				});
			} finally {
				setOpenDialog(null);
			}
		}
	};

	const handleDeleteProject = async () => {
		if (activeProject) {
			try {
				await editor.project.deleteProjects({
					ids: [activeProject.metadata.id],
				});
				router.push("/projects");
			} catch (error) {
				toast.error("Failed to delete project", {
					description:
						error instanceof Error ? error.message : "Please try again",
				});
			} finally {
				setOpenDialog(null);
			}
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="p-1 rounded-sm size-8">
						<Image
							src={DEFAULT_LOGO_URL}
							alt="Project thumbnail"
							width={32}
							height={32}
							className="invert dark:invert-0 size-5"
						/>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="z-100 w-44">
					<DropdownMenuItem
						onClick={handleExit}
						disabled={isExiting}
						icon={<HugeiconsIcon icon={Logout05Icon} />}
					>
						Exit project
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={() => editor.project.downloadProjectJson()}
						icon={<Download className="size-4" />}
					>
						Lưu tệp ra máy (.json)
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={async () => {
							toast.info("Đang đồng bộ ra E:\\Lương\\OpenCut_Projects...");
							await editor.save.syncDiskNow();
							toast.success("Đã đồng bộ ra ổ đĩa máy tính thành công!");
						}}
						icon={<HardDrive className="size-4" />}
					>
						Đồng bộ ra ổ E:
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={() => setOpenDialog("shortcuts")}
						icon={<HugeiconsIcon icon={CommandIcon} />}
					>
						Shortcuts
					</DropdownMenuItem>

					<DropdownMenuSeparator />

					<DropdownMenuItem asChild icon={<FaDiscord className="size-4!" />}>
						<Link
							href={SOCIAL_LINKS.discord}
							target="_blank"
							rel="noopener noreferrer"
						>
							Discord
						</Link>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<RenameProjectDialog
				isOpen={openDialog === "rename"}
				onOpenChange={(isOpen) => setOpenDialog(isOpen ? "rename" : null)}
				onConfirm={(newName) => handleSaveProjectName(newName)}
				projectName={activeProject?.metadata.name || ""}
			/>
			<DeleteProjectDialog
				isOpen={openDialog === "delete"}
				onOpenChange={(isOpen) => setOpenDialog(isOpen ? "delete" : null)}
				onConfirm={handleDeleteProject}
				projectNames={[activeProject?.metadata.name || ""]}
			/>
			<ShortcutsDialog
				isOpen={openDialog === "shortcuts"}
				onOpenChange={(isOpen) => setOpenDialog(isOpen ? "shortcuts" : null)}
			/>
		</>
	);
}

function EditableProjectName() {
	const editor = useEditor();
	const activeProject = useEditor((e) => e.project.getActiveOrNull());
	const [isEditing, setIsEditing] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const originalNameRef = useRef("");

	const projectName = activeProject?.metadata.name || "";

	const startEditing = () => {
		if (isEditing) return;
		originalNameRef.current = projectName;
		setIsEditing(true);

		requestAnimationFrame(() => {
			inputRef.current?.select();
		});
	};

	const saveEdit = async () => {
		if (!inputRef.current || !activeProject) return;
		const newName = inputRef.current.value.trim();
		setIsEditing(false);

		if (!newName) {
			inputRef.current.value = originalNameRef.current;
			return;
		}

		if (newName !== originalNameRef.current) {
			try {
				await editor.project.renameProject({
					id: activeProject.metadata.id,
					name: newName,
				});
			} catch (error) {
				toast.error("Failed to rename project", {
					description:
						error instanceof Error ? error.message : "Please try again",
				});
			}
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Enter") {
			event.preventDefault();
			inputRef.current?.blur();
		} else if (event.key === "Escape") {
			event.preventDefault();
			if (inputRef.current) {
				inputRef.current.value = originalNameRef.current;
				inputRef.current.setSelectionRange(0, 0);
			}
			setIsEditing(false);
			inputRef.current?.blur();
		}
	};

	if (!activeProject) return null;

	return (
		<input
			key={activeProject.metadata.id}
			ref={inputRef}
			type="text"
			defaultValue={projectName}
			readOnly={!isEditing}
			onClick={startEditing}
			onBlur={saveEdit}
			onKeyDown={handleKeyDown}
			style={{ fieldSizing: "content" }}
			className={cn(
				"text-[0.9rem] h-8 px-2 py-1 rounded-sm bg-transparent outline-none cursor-pointer hover:bg-accent hover:text-accent-foreground",
				isEditing && "ring-1 ring-ring cursor-text hover:bg-transparent",
			)}
		/>
	);
}
