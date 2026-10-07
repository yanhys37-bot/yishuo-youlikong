# 亦朔 × 我叫有理控｜GitHub Pages V1

这是一个手机竖屏优先的纯静态单页网站，流程为：

`P1 密码页 → P2 3.6 秒加载页 → P3 相识计时主页 → P4 开发中页 → P3`

## 直接发布到 GitHub Pages

1. 把本目录中的全部文件上传到 GitHub 仓库根目录。
2. 打开仓库 `Settings → Pages`。
3. 在 `Build and deployment` 中选择 `Deploy from a branch`。
4. Branch 选择 `main`，Folder 选择 `/(root)`，保存。
5. 等待 GitHub Pages 发布后，访问 `https://<用户名>.github.io/<仓库名>/`。

项目不需要 Node、构建工具、后端或运行中的本地服务器。所有运行时资源均使用相对路径，支持 GitHub Pages 仓库子路径。

## 本地验证（可选）

直接双击 `index.html` 即可查看；如需模拟 GitHub Pages 的 HTTP 环境，可使用任意静态文件服务器。

自动检查：

```powershell
node --test tests/*.test.js
```

入口暗号：`260921`
