import { NextResponse } from "next/server";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function getTargetProjectsDir(): string {
	if (process.env.OPENCUT_PROJECTS_DIR) {
		return process.env.OPENCUT_PROJECTS_DIR;
	}
	const defaultPath = path.join(os.homedir(), "OpenCut_Projects");
	try {
		if (!fs.existsSync(defaultPath)) {
			fs.mkdirSync(defaultPath, { recursive: true });
		}
		return defaultPath;
	} catch {
		// Fallback to project-relative directory
		const fallback = path.resolve(process.cwd(), "..", "..", "saved-projects");
		if (!fs.existsSync(fallback)) {
			fs.mkdirSync(fallback, { recursive: true });
		}
		return fallback;
	}
}

function sanitizeFileName(name: string): string {
	return (name || "untitled")
		.replace(/[/\\?%*:|"<>]/g, "_")
		.replace(/\s+/g, "_")
		.trim();
}

/**
 * POST /api/projects/local-sync
 * Tự động ghi dự án ra ổ đĩa máy tính
 */
export async function POST(req: Request) {
	try {
		const body = await req.json();
		const { project } = body;

		if (!project || !project.metadata || !project.metadata.id) {
			return NextResponse.json(
				{ error: "Invalid project payload: missing metadata.id" },
				{ status: 400 },
			);
		}

		const projectsDir = getTargetProjectsDir();
		const safeName = sanitizeFileName(project.metadata.name);
		const shortId = project.metadata.id.slice(0, 8);
		const fileName = `${safeName}_${shortId}.opencut.json`;
		const filePath = path.join(projectsDir, fileName);

		// Ghi file JSON có format đẹp
		const jsonContent = JSON.stringify(project, null, 2);
		fs.writeFileSync(filePath, jsonContent, "utf-8");

		// Dọn dẹp các bản lưu cũ nếu người dùng vừa đổi tên dự án
		try {
			const files = fs.readdirSync(projectsDir);
			for (const file of files) {
				if (file.endsWith(`_${shortId}.opencut.json`) && file !== fileName) {
					fs.unlinkSync(path.join(projectsDir, file));
				}
			}
		} catch (cleanupErr) {
			console.warn("Could not clean up old project file:", cleanupErr);
		}

		return NextResponse.json({
			success: true,
			fileName,
			filePath,
			projectsDir,
			savedAt: new Date().toISOString(),
		});
	} catch (error) {
		console.error("[local-sync POST] Error saving project:", error);
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Internal Server Error",
			},
			{ status: 500 },
		);
	}
}

/**
 * GET /api/projects/local-sync
 * Liệt kê danh sách các dự án đang lưu trên ổ đĩa máy tính
 */
export async function GET() {
	try {
		const projectsDir = getTargetProjectsDir();
		if (!fs.existsSync(projectsDir)) {
			return NextResponse.json({
				success: true,
				projectsDir,
				projects: [],
			});
		}

		const fileNames = fs.readdirSync(projectsDir);
		const projectFiles = fileNames.filter(
			(file) => file.endsWith(".opencut.json") || file.endsWith(".json"),
		);

		const projects = [];
		for (const file of projectFiles) {
			const fullPath = path.join(projectsDir, file);
			try {
				const stat = fs.statSync(fullPath);
				const content = fs.readFileSync(fullPath, "utf-8");
				const parsed = JSON.parse(content);

				projects.push({
					fileName: file,
					filePath: fullPath,
					fileSize: stat.size,
					id: parsed.metadata?.id || null,
					name: parsed.metadata?.name || file,
					duration: parsed.metadata?.duration || null,
					updatedAt: parsed.metadata?.updatedAt || stat.mtime.toISOString(),
					createdAt: parsed.metadata?.createdAt || stat.birthtime.toISOString(),
				});
			} catch (parseErr) {
				console.warn(`Could not read project file ${file}:`, parseErr);
			}
		}

		// Sắp xếp file mới nhất lên đầu
		projects.sort(
			(a, b) =>
				new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
		);

		return NextResponse.json({
			success: true,
			projectsDir,
			projects,
		});
	} catch (error) {
		console.error("[local-sync GET] Error listing projects:", error);
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Internal Server Error",
			},
			{ status: 500 },
		);
	}
}
