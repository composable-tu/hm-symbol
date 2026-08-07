import { defineConfig } from 'vite';

// GitHub Pages 项目页面 URL 为 https://<user>.github.io/<repo>/,
// 因此 base 必须与仓库名一致;本地开发预览时同样工作。
// 若部署到用户根页面 https://<user>.github.io/,改成 '/' 即可。
export default defineConfig({
    base: '/hm-symbol/',
    server: {
        port: 5173,
        open: true,
    },
    build: {
        outDir: 'dist',
    },
});
