import './style.css';
// symbols.json 由 scripts/extract-symbols.mjs 在构建/启动前生成,
// 直接以模块方式 import,无需运行时 fetch
import allSymbols from './symbols.json';

const container = document.getElementById('symbols-container');
const searchInput = document.getElementById('search-input');
const countInfo = document.getElementById('count-info');
const toastElement = document.getElementById('toast');

// --- Toast 显示函数 ---
let toastTimeout;
const showToast = (message) => {
    toastElement.textContent = message;
    // 清除之前的定时器
    clearTimeout(toastTimeout);

    // 显示 Toast
    toastElement.classList.add('show');

    // 1.5 秒后隐藏 Toast
    toastTimeout = setTimeout(() => {
        toastElement.classList.remove('show');
    }, 1500);
};

// --- 复制 Fallback 方法（解决浏览器安全限制导致的复制失败） ---
const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    let successful = false;
    try {
        successful = document.execCommand('copy');
    } catch (err) {
        console.error('Fallback: 无法复制', err);
    }
    document.body.removeChild(textArea);
    return successful;
};

// --- 核心复制功能 ---
function copyToClipboard(text) {
    // 尝试使用现代 Clipboard API
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('名称已复制到剪贴板!');
        }).catch(err => {
            // Clipboard API 失败，尝试 Fallback 方法
            console.warn('Clipboard API 失败，尝试 Fallback 复制。', err);
            if (fallbackCopyTextToClipboard(text)) {
                showToast('名称已复制到剪贴板!');
            } else {
                // 彻底失败时给用户提示
                alert('复制失败，请手动复制: ' + text);
            }
        });
    } else {
        // 浏览器不支持 Clipboard API，直接使用 Fallback
        if (fallbackCopyTextToClipboard(text)) {
            showToast('名称已复制到剪贴板!');
        } else {
            alert('复制失败，请手动复制: ' + text);
        }
    }
}

// --- 渲染符号函数 ---
function renderSymbols(symbolsToRender) {
    container.innerHTML = ''; // 清空现有内容

    if (symbolsToRender.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: #666; margin-top: 30px;">未找到匹配的符号。</p>`;
        return;
    }

    symbolsToRender.forEach(item => {
        const div = document.createElement('div');
        div.className = 'symbol-item';

        const iconSpan = document.createElement('span');
        iconSpan.className = 'icon';
        iconSpan.textContent = item.character;

        const nameDiv = document.createElement('div');
        nameDiv.className = 'name';
        nameDiv.textContent = item.name;

        const unicodeDiv = document.createElement('div');
        unicodeDiv.className = 'unicode';
        unicodeDiv.textContent = item.unicode_hex;

        div.appendChild(iconSpan);
        div.appendChild(nameDiv);
        div.appendChild(unicodeDiv);

        // 添加复制功能
        div.addEventListener('click', () => {
            copyToClipboard(item.name);
        });

        container.appendChild(div);
    });
}

// --- 搜索和过滤逻辑 ---
function handleSearch() {
    const term = searchInput.value.toLowerCase().trim();
    let symbolsToRender = [];

    // 过滤掉空白字符
    const source = allSymbols.filter(item =>
        item.unicode_hex !== 'U+0020' && item.unicode_hex !== 'U+00A0'
    );

    if (!term) {
        // 没有搜索词时，渲染所有符号
        symbolsToRender = source;
        countInfo.textContent = `共 ${source.length} 个符号。`;
    } else {
        // 有搜索词时，进行过滤
        symbolsToRender = source.filter(item =>
            item.name.toLowerCase().includes(term) ||
            item.unicode_hex.toLowerCase().includes(term)
        );
        countInfo.textContent = `找到 ${symbolsToRender.length} 个结果。`;
    }

    renderSymbols(symbolsToRender);
}

// 绑定搜索事件
searchInput.addEventListener('input', handleSearch);

// 首次渲染
handleSearch();
