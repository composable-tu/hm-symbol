from fontTools.ttLib import TTFont
import json

def extract_font_info(font_path, output_json="symbols.json"):
    """
    从 TTF 文件中提取 Glyphs (符号) 名称和对应的 Unicode 码点。
    """
    try:
        font = TTFont(font_path)
    except Exception as e:
        print(f"打开字体文件时出错: {e}")
        return

    # 1. 获取 glyphs 名称和对应的 Unicode 码点
    # 'cmap' 表将 Unicode 码点映射到 glyph 名称
    cmap = font.getBestCmap()
    
    # 2. 准备数据结构
    symbol_data = []
    
    for unicode_code, glyph_name in cmap.items():
        # 将十进制的 Unicode 码点转换为十六进制，并格式化为 U+XXXX
        unicode_hex = f"U+{unicode_code:04X}"
        # 实际的字符 (用于网页显示)
        char = chr(unicode_code)
        
        # 排除标准控制字符或非显示字符 (可选，但推荐)
        if unicode_code > 31 and unicode_code != 127:
            symbol_data.append({
                "name": glyph_name,
                "unicode_hex": unicode_hex,
                "character": char
            })

    # 3. 保存到 JSON 文件
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(symbol_data, f, ensure_ascii=False, indent=4)
    
    print(f"成功提取 {len(symbol_data)} 个符号，并保存到 {output_json}")

# 替换成您的字体文件路径
font_file = 'HMSymbolVF.ttf' 
extract_font_info(font_file)