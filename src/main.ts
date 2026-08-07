import "./style.css";
import Fuse from "fuse.js";
import rawSymbols from "./symbols.json";

interface SymbolItem {
  name: string;
  unicode_hex: string;
  character: string;
  aliases: string[];
}

const container = document.getElementById("symbols-container") as HTMLDivElement;
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const countInfo = document.getElementById("count-info") as HTMLParagraphElement;
const toastElement = document.getElementById("toast") as HTMLDivElement;
let allSymbols: SymbolItem[] = []; // 存储所有符号的原始数组

// --- Toast 显示函数 ---
let toastTimeout: ReturnType<typeof setTimeout> | undefined;
const showToast = (message: string): void => {
  toastElement.textContent = message;
  // 清除之前的定时器
  clearTimeout(toastTimeout);

  // 显示 Toast
  toastElement.classList.add("show");

  // 1.5 秒后隐藏 Toast
  toastTimeout = setTimeout(() => {
    toastElement.classList.remove("show");
  }, 1500);
};

// --- 复制 Fallback 方法（解决浏览器安全限制导致的复制失败） ---
const fallbackCopyTextToClipboard = (text: string): boolean => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  let successful = false;
  try {
    successful = document.execCommand("copy");
  } catch (err) {
    console.error("Fallback: 无法复制", err);
  }
  document.body.removeChild(textArea);
  return successful;
};

// --- 核心复制功能 ---
function copyToClipboard(text: string): void {
  // 尝试使用现代 Clipboard API
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast("名称已复制到剪贴板!");
      })
      .catch((err: unknown) => {
        // Clipboard API 失败，尝试 Fallback 方法
        console.warn("Clipboard API 失败，尝试 Fallback 复制。", err);
        if (fallbackCopyTextToClipboard(text)) {
          showToast("名称已复制到剪贴板!");
        } else {
          // 彻底失败时给用户提示
          alert("复制失败，请手动复制: " + text);
        }
      });
  } else {
    // 浏览器不支持 Clipboard API，直接使用 Fallback
    if (fallbackCopyTextToClipboard(text)) {
      showToast("名称已复制到剪贴板!");
    } else {
      alert("复制失败，请手动复制: " + text);
    }
  }
}

// --- 渲染符号函数 ---
function renderSymbols(symbolsToRender: SymbolItem[]): void {
  container.innerHTML = ""; // 清空现有内容

  if (symbolsToRender.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: #666; margin-top: 30px;">未找到匹配的符号。</p>`;
    return;
  }

  symbolsToRender.forEach((item: SymbolItem) => {
    const div = document.createElement("div");
    div.className = "symbol-item";

    const iconSpan = document.createElement("span");
    iconSpan.className = "icon";
    iconSpan.textContent = item.character;

    const nameDiv = document.createElement("div");
    nameDiv.className = "name";
    nameDiv.textContent = item.name;

    const unicodeDiv = document.createElement("div");
    unicodeDiv.className = "unicode";
    unicodeDiv.textContent = item.unicode_hex;

    // 移除 feedbackDiv 相关的代码

    div.appendChild(iconSpan);
    div.appendChild(nameDiv);
    div.appendChild(unicodeDiv);
    // 移除 feedbackDiv 的 appendChild

    // 添加复制功能
    div.addEventListener("click", () => {
      // 直接调用 copyToClipboard
      copyToClipboard(item.name);
    });

    container.appendChild(div);
  });
}

// --- 搜索和过滤逻辑 ---
// 使用 Fuse.js 实现分词搜索:输入 "folder plus" 会匹配 folder_badge_plus
// 策略:输入按空格切分为多个 token，对每个 token 单独做精确子串搜索，
// 取所有 token 命中结果的交集 (AND 关系)，避免模糊匹配误命中
let fuse: Fuse<SymbolItem>;

function handleSearch(): void {
  const term = searchInput.value.trim();
  let symbolsToRender: SymbolItem[] = [];

  if (!term) {
    // 没有搜索词时，渲染所有符号
    symbolsToRender = allSymbols;
    countInfo.textContent = `共 ${allSymbols.length} 个符号。`;
  } else {
    // 有搜索词时，按空格切分为多个 token，逐个搜索取交集
    const tokens = term.split(/\s+/).filter(Boolean);
    if (tokens.length === 1) {
      // 单 token 直接搜索
      symbolsToRender = fuse.search(tokens[0]).map((result) => result.item);
    } else {
      // 多 token:对每个 token 搜索，取命中 name 的交集
      const matchedPerToken = tokens.map(
        (t) => new Set(fuse.search(t).map((result) => result.item.name)),
      );
      const intersection = matchedPerToken.reduce(
        (acc, set) => new Set([...acc].filter((x) => set.has(x))),
      );
      symbolsToRender = allSymbols.filter((s) => intersection.has(s.name));
    }
    countInfo.textContent = `找到 ${symbolsToRender.length} 个结果。`;
  }

  renderSymbols(symbolsToRender);
}

// 绑定搜索事件
searchInput.addEventListener("input", handleSearch);

// --- 数据加载 ---
// 过滤掉空白字符并存储
allSymbols = (rawSymbols as SymbolItem[]).filter(
  (item) => item.unicode_hex !== "U+0020" && item.unicode_hex !== "U+00A0",
);

// 初始化 Fuse 索引 (必须在 allSymbols 赋值后)
// threshold=0 + ignoreLocation 实现精确子串匹配，避免 fuzzy 误命中
fuse = new Fuse(allSymbols, {
  keys: ["name", "aliases", "unicode_hex"],
  threshold: 0,
  ignoreLocation: true,
  includeScore: false,
  minMatchCharLength: 1,
});

// 首次渲染：显示所有符号
handleSearch();
