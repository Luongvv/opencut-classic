# Storytelling Smart Cut Template for OpenCut (9:16)

> **Template Dựng Video Kể Chuyện & Chia Sẻ Hành Trình Chuyên Biệt Cho OpenCut**
> Kế thừa toàn diện các nguyên lý cốt lõi từ `news-media-showcase/creator/storytelling-smart-cut`:
> - Canvas chuẩn 9:16 (`1080x1920 @ 30fps`), nền Studio Canvas tối (`#060709`).
> - Hệ thống chữ **Kinetic Dual-Font**: Font viết tay mềm mại (`Dancing Script 700`) cho lời dẫn + Font in hoa nét đậm (`Montserrat 900 Black`) cho từ khóa đắt giá mang màu **Vàng Cam (`#FF9900`)**.
> - **Top-Halo Headline**: Đặt độc quyền trên đầu người nói (`y = 140px`), giữ trọn vẹn vùng an toàn khuôn mặt (`faceSafeZone`).
> - **Single-Font Micro-Captions**: Phụ đề dưới đáy (`bottom = 270px`, `y = 1650px`) dùng duy nhất font `Montserrat 900`, highlight từ khóa bằng màu Vàng Cam.
> - **Âm thanh chuẩn**: BGM Acoustic Indie Guitar nhẹ nhàng kèm cơ chế Audio Ducking + 13 hiệu ứng âm thanh SFX (`whoosh`, `pop`, `ting`, `thud`, `cash`...).
> - **Đồ họa Render Native**: 3 định dạng đồ họa HTML5 Canvas đăng ký trực tiếp vào `graphicsRegistry` của OpenCut (`storytelling-card-inset`, `storytelling-top-halo-badge`, `storytelling-polaroid-frame`).

---

## 1. Cấu Trúc Timeline Đa Lớp (Scene Tracks)

Khi tạo dự án từ template này, OpenCut sẽ tự động thiết lập hệ thống track chuẩn:

```
[Top-Halo Headlines]  ──► Text Track: Dual-Font (Dancing Script + Montserrat 900, Vàng Cam #FF9900)
[Micro-Captions]      ──► Text Track: Single-Font Montserrat 900, highlight từ ngữ quan trọng
[Visual Cards & Glow] ──► Graphic Track: Thẻ B-Roll 16:9 bo viền Vàng Cam + Vầng sáng Halo
[B-Roll Cutaway]      ──► Video Track: Dành riêng cho video/ảnh minh họa (9:16 full hoặc 16:9 card)
─────────────────────────────────────────────────────────────────────────────────────────────
[A-Roll (Main)]       ──► Video Track: Video người nói (Talking Head) cắt nhịp nhanh 3-4s/shot
─────────────────────────────────────────────────────────────────────────────────────────────
[Voiceover]           ──► Audio Track: Giọng nói nhân vật (Speech)
[BGM Acoustic]        ──► Audio Track: Nhạc nền Guitar Indie Acoustic (/templates/.../music/)
[SFX]                 ──► Audio Track: Hiệu ứng âm thanh Whoosh, Pop, Ting, Thud tại các điểm cắt
```

---

## 2. Danh Mục Tài Nguyên Vật Lý Đã Tích Hợp

Toàn bộ tài nguyên được đặt cục bộ trong `public/templates/storytelling-smart-cut/`:

- **Nhạc nền BGM**: `music/indie-acoustic-story.mp3` (Loop Guitar Acoustic không bản quyền).
- **13 Hiệu ứng SFX**:
  - `sfx/whoosh.mp3`, `sfx/swoosh.mp3`: Chuyển cảnh & chuyển động chữ.
  - `sfx/pop.mp3`: Chữ in hoa bật lên.
  - `sfx/ting.mp3`, `sfx/ding.mp3`: Điểm nhấn số liệu.
  - `sfx/thud.mp3`, `sfx/boom.mp3`: Nhịp bass kết thúc câu.
  - `sfx/cash.mp3`: Âm thanh tiền tệ/thu nhập.
  - `sfx/error.mp3`, `sfx/click.mp3`, `sfx/switch.mp3`, `sfx/shutter.mp3`, `sfx/whip.mp3`.
- **Bộ Icon 3D PNG**: Túi tiền, ngọn lửa, tên lửa, tích xanh, cảnh báo đỏ, mục tiêu, tia sét.
- **Bộ Logo thương hiệu**: Bản dọc chuẩn màu, bản ngang, bản trắng.

---

## 3. Cách Sử Dụng Trong Code

### Cách 1: Tạo dự án mới từ Template (TypeScript API)
```typescript
import { buildStorytellingSmartCutProject } from "@/templates/storytelling-smart-cut";

// Tạo TProject hoàn chỉnh chuẩn OpenCut
const project = buildStorytellingSmartCutProject({
    projectName: "Hành Trình Khởi Nghiệp Của Tôi",
});

// Lưu vào OpenCut StorageService và mở trên editor
await editor.project.createProjectFromTemplate({ project });
```

### Cách 2: Chuyển đổi từ `spec.json` của AI (AI Bridge Adapter)
```typescript
import { convertAISpecToOpenCutProject } from "@/templates/storytelling-smart-cut";

// spec được sinh tự động từ script analyze-storytelling-smart-cut.mjs
const openCutProject = convertAISpecToOpenCutProject({
    spec: aiGeneratedSpecJson,
    projectName: "Video Tuyển Dụng AI",
});

await editor.project.createProjectFromTemplate({ project: openCutProject });
```

### Cách 3: Giao diện người dùng (UI)
- Trên trang danh sách dự án (`/projects`), người dùng chỉ cần click nút **"Storytelling (9:16)"** màu cam nổi bật ngay cạnh nút "New project".
- Hệ thống sẽ tự động tạo dự án, nạp cấu trúc 8 track, gán sẵn mốc bookmark phân cảnh, và chuyển thẳng vào Studio để xem trước và tinh chỉnh!
