use ttf_parser::Face;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FontInfo {
    pub family: String,
    pub postscript_name: String,
    pub weight: u16,
    pub italic: bool,
}

pub fn parse_font_info(data: &[u8]) -> Option<FontInfo> {
    let face = Face::parse(data, 0).ok()?;
    
    let mut family = None;
    let mut postscript_name = None;

    for name in face.names() {
        if name.name_id == 1 && family.is_none() && name.is_unicode() {
            family = name.to_string();
        }
        if name.name_id == 6 && postscript_name.is_none() && name.is_unicode() {
            postscript_name = name.to_string();
        }
    }

    Some(FontInfo {
        family: family.unwrap_or_else(|| "Unknown".to_string()),
        postscript_name: postscript_name.unwrap_or_else(|| "Unknown".to_string()),
        weight: face.weight().to_number(),
        italic: face.is_italic(),
    })
}

pub fn match_font(
    target_family: &str,
    target_weight: u16,
    target_italic: bool,
    available_fonts: &[FontInfo],
) -> Option<FontInfo> {
    // Simple matching logic
    available_fonts
        .iter()
        .min_by_key(|font| {
            let family_score = if font.family.eq_ignore_ascii_case(target_family) { 0 } else { 10000 };
            let italic_score = if font.italic == target_italic { 0 } else { 1000 };
            let weight_diff = (font.weight as i32 - target_weight as i32).abs();
            
            family_score + italic_score + weight_diff
        })
        .filter(|font| font.family.eq_ignore_ascii_case(target_family))
        .cloned()
}
