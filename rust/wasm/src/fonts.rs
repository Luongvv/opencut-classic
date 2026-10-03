use fonts::{match_font, parse_font_info, FontInfo};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct WasmFontInfo {
    #[wasm_bindgen(skip)]
    pub inner: FontInfo,
}

#[wasm_bindgen]
impl WasmFontInfo {
    #[wasm_bindgen(getter)]
    pub fn family(&self) -> String {
        self.inner.family.clone()
    }

    #[wasm_bindgen(getter = postscriptName)]
    pub fn postscript_name(&self) -> String {
        self.inner.postscript_name.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn weight(&self) -> u16 {
        self.inner.weight
    }

    #[wasm_bindgen(getter)]
    pub fn italic(&self) -> bool {
        self.inner.italic
    }
}

#[wasm_bindgen]
pub fn wasm_parse_font_info(data: &[u8]) -> Option<WasmFontInfo> {
    parse_font_info(data).map(|inner| WasmFontInfo { inner })
}

#[wasm_bindgen]
pub fn wasm_match_font(
    target_family: &str,
    target_weight: u16,
    target_italic: bool,
    available_fonts_js: JsValue,
) -> Option<WasmFontInfo> {
    let available_fonts: Vec<FontInfo> = serde_wasm_bindgen::from_value(available_fonts_js).ok()?;
    match_font(
        target_family,
        target_weight,
        target_italic,
        &available_fonts,
    )
    .map(|inner| WasmFontInfo { inner })
}
