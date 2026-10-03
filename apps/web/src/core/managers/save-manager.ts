import type { EditorCore } from "@/core";

type SaveManagerOptions = {
	debounceMs?: number;
};

export class SaveManager {
	private debounceMs: number;
	private isPaused = false;
	private isSaving = false;
	private hasPendingSave = false;
	private saveTimer: ReturnType<typeof setTimeout> | null = null;
	private unsubscribeHandlers: Array<() => void> = [];

	private diskSaveStatus: "idle" | "saving" | "saved" | "error" = "idle";
	private lastSavedToDiskAt: Date | null = null;
	private lastSavedDiskPath: string | null = null;
	private diskErrorMessage: string | null = null;
	private listeners = new Set<() => void>();

	constructor({
		editor,
		debounceMs = 800,
	}: {
		editor: EditorCore;
	} & SaveManagerOptions) {
		this.editor = editor;
		this.debounceMs = debounceMs;
	}

	private editor: EditorCore;

	subscribe(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	private notify(): void {
		for (const listener of this.listeners) {
			try {
				listener();
			} catch (e) {
				console.error("SaveManager listener error:", e);
			}
		}
	}

	getDiskSaveStatus(): {
		status: "idle" | "saving" | "saved" | "error";
		lastSavedAt: Date | null;
		filePath: string | null;
		error: string | null;
	} {
		return {
			status: this.diskSaveStatus,
			lastSavedAt: this.lastSavedToDiskAt,
			filePath: this.lastSavedDiskPath,
			error: this.diskErrorMessage,
		};
	}

	start(): void {
		if (this.unsubscribeHandlers.length > 0) return;

		this.unsubscribeHandlers = [
			this.editor.scenes.subscribe(() => {
				this.markDirty();
			}),
			this.editor.timeline.subscribe(() => {
				this.markDirty();
			}),
		];
	}

	stop(): void {
		for (const unsubscribe of this.unsubscribeHandlers) {
			unsubscribe();
		}
		this.unsubscribeHandlers = [];
		this.clearTimer();
	}

	pause(): void {
		this.isPaused = true;
	}

	resume(): void {
		this.isPaused = false;
		if (this.hasPendingSave) {
			this.queueSave();
		}
	}

	markDirty({ force = false }: { force?: boolean } = {}): void {
		if (this.isPaused && !force) return;
		this.hasPendingSave = true;
		this.queueSave();
	}

	async flush(): Promise<void> {
		this.hasPendingSave = true;
		await this.saveNow();
	}

	getIsDirty(): boolean {
		return this.hasPendingSave || this.isSaving;
	}

	private queueSave(): void {
		if (this.isSaving) return;
		if (this.saveTimer) {
			clearTimeout(this.saveTimer);
		}
		this.saveTimer = setTimeout(() => {
			void this.saveNow();
		}, this.debounceMs);
	}

	async syncDiskNow(): Promise<void> {
		const active = this.editor.project.getActive();
		if (!active) return;

		this.diskSaveStatus = "saving";
		this.notify();

		try {
			const syncRes = await this.editor.project.syncProjectToLocalDisk(active);
			if (syncRes.success) {
				this.diskSaveStatus = "saved";
				this.lastSavedToDiskAt = new Date();
				this.lastSavedDiskPath = syncRes.filePath ?? null;
				this.diskErrorMessage = null;
			} else {
				this.diskSaveStatus = "error";
				this.diskErrorMessage = syncRes.error ?? "Failed to sync";
			}
		} catch (err) {
			this.diskSaveStatus = "error";
			this.diskErrorMessage = err instanceof Error ? err.message : "Sync error";
		} finally {
			this.notify();
		}
	}

	private async saveNow(): Promise<void> {
		if (this.isSaving) return;
		if (!this.hasPendingSave) return;

		const activeProject = this.editor.project.getActiveOrNull();
		if (!activeProject) return;
		if (this.editor.project.getIsLoading()) return;
		if (this.editor.project.getMigrationState().isMigrating) return;

		this.isSaving = true;
		this.hasPendingSave = false;
		this.clearTimer();

		try {
			await this.editor.project.saveCurrentProject();

			// Tự động đồng bộ ra ổ đĩa máy tính
			this.diskSaveStatus = "saving";
			this.notify();

			const latestActive = this.editor.project.getActiveOrNull();
			if (latestActive) {
				const syncRes = await this.editor.project.syncProjectToLocalDisk(latestActive);
				if (syncRes.success) {
					this.diskSaveStatus = "saved";
					this.lastSavedToDiskAt = new Date();
					this.lastSavedDiskPath = syncRes.filePath ?? null;
					this.diskErrorMessage = null;
				} else {
					this.diskSaveStatus = "error";
					this.diskErrorMessage = syncRes.error ?? "Sync to disk failed";
				}
				this.notify();
			}
		} catch (error) {
			console.error("SaveManager save error:", error);
			this.diskSaveStatus = "error";
			this.diskErrorMessage = error instanceof Error ? error.message : "Save error";
			this.notify();
		} finally {
			this.isSaving = false;
			if (this.hasPendingSave) {
				this.queueSave();
			}
		}
	}

	private clearTimer(): void {
		if (!this.saveTimer) return;
		clearTimeout(this.saveTimer);
		this.saveTimer = null;
	}
}
