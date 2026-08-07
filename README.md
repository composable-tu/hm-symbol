# HM Symbol

由于华为开发者联盟官网的图标资源非常不齐全，而 DevEco Studio 中甚至没有图标预览，因此有了这个网站。

纯 AI 编写，用于便捷查找 HM Symbol 中的图标，方便鸿蒙开发者使用。

## 技术栈

- [Vite](https://vitejs.dev/) - 构建与开发工具
- [fontkit](https://github.com/foliojs/fontkit) - 在 Node.js 中解析 TTF 字体提取符号信息
- 原生 HTML/CSS/JS - 前端实现

## 本地开发

```bash
npm install
npm run dev        # 启动开发服务器(会自动先提取符号)
```

`npm run dev` 与 `npm run build` 通过 npm 的 `predev` / `prebuild` 钩子，会自动执行 `scripts/extract-symbols.mjs`，从 `src/assets/HMSymbolVF.ttf` 重新生成 `src/symbols.json`。

其他命令：

```bash
npm run build      # 生产构建(产物输出到 dist/)
npm run preview    # 本地预览构建产物
npm run extract    # 单独执行符号提取
```

## 部署到 GitHub Pages

项目已配置 [GitHub Actions 工作流](.github/workflows/deploy.yml)，推送到 `main` 分支即会自动构建并部署到 GitHub Pages。

### 一次性配置

在仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions** 即可（无需指定分支，工作流自带 `upload-pages-artifact` + `deploy-pages` 步骤）。

部署 URL 形如：`https://<用户名>.github.io/hm-symbol/`

### base 路径

`vite.config.js` 中已设置 `base: '/hm-symbol/'`，与仓库名保持一致。若仓库名不同，或部署到用户根页面 `https://<user>.github.io/`，请同步修改此项。
