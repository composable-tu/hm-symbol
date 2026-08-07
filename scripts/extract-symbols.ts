import { openSync as openFontSync } from "fontkit";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fontPath = join(__dirname, "..", "src", "assets", "HMSymbolVF.ttf");
const overridesPath = join(__dirname, "..", "src", "overrides.json");
const outputPath = join(__dirname, "..", "src", "symbols.json");

interface OverrideEntry {
  name: string;
  aliases?: string[];
  [key: string]: unknown;
}

interface SymbolItem {
  name: string;
  unicode_hex: string;
  character: string;
  aliases: string[];
}

/**
 * 从 TTF 文件中提取 Glyphs (符号) 名称和对应的 Unicode 码点。
 */
function extractFontInfo(fontPath: string, outputPath: string): void {
  let font;
  try {
    font = openFontSync(fontPath);
  } catch (err) {
    console.error(`打开字体文件时出错: ${(err as Error).message}`);
    process.exit(1);
  }

  // 1. 获取 glyphs 名称和对应的 Unicode 码点
  // fontkit 的 characterSet 返回字体支持的所有 Unicode 码点 (已排序去重)
  const codePoints = font.characterSet as Iterable<number>;

  // 2. 准备数据结构
  const symbolData: SymbolItem[] = [];

  for (const unicode_code of codePoints) {
    // 将十进制的 Unicode 码点转换为十六进制，并格式化为 U+XXXX
    const unicode_hex = `U+${unicode_code.toString(16).toUpperCase().padStart(4, "0")}`;
    // 实际的字符 (用于网页显示)
    const char = String.fromCodePoint(unicode_code);

    // 排除标准控制字符或非显示字符 (可选，但推荐)
    if (unicode_code > 31 && unicode_code != 127) {
      // 通过码点反查 glyph 名称
      const glyph = font.glyphForCodePoint(unicode_code);
      symbolData.push({
        name: glyph.name,
        unicode_hex: unicode_hex,
        character: char,
        aliases: [],
      });
    }
  }

  // 3. 合并 override (同 name 的其他字段覆盖自动生成的字段)
  // name 仅作匹配键，不参与覆盖；其余字段 (如 aliases) 覆盖到对应符号上
  let overrides: OverrideEntry[] = [];
  try {
    overrides = JSON.parse(readFileSync(overridesPath, "utf-8"));
  } catch (err) {
    console.warn(`未找到 overrides.json，跳过覆盖: ${(err as Error).message}`);
  }
  const overrideMap = new Map<string, OverrideEntry>();
  for (const ov of overrides) {
    overrideMap.set(ov.name, ov);
  }
  let overrideCount = 0;
  for (const item of symbolData) {
    const ov = overrideMap.get(item.name);
    if (ov) {
      const { name, ...rest } = ov;
      void name;
      Object.assign(item, rest);
      overrideCount++;
    }
  }

  // 4. 保存到 JSON 文件
  writeFileSync(outputPath, JSON.stringify(symbolData, null, 2), "utf-8");
  console.log(`成功提取 ${symbolData.length} 个符号，并保存到 ${outputPath}`);
  if (overrideCount > 0) {
    console.log(`其中 ${overrideCount} 个符号应用了 override`);
  }
}

// 替换成您的字体文件路径
extractFontInfo(fontPath, outputPath);
