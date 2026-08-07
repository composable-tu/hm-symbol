// fontkit 未提供 TypeScript 类型声明,此处仅声明用到的 API
declare module "fontkit" {
  export interface Glyph {
    name: string;
  }

  export interface Font {
    characterSet: Iterable<number>;
    glyphForCodePoint(codePoint: number): Glyph;
  }

  export function openSync(filePath: string): Font;
}
