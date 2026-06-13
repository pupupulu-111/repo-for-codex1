# 校园记忆播种地图

本项目是一个本地运行的校园记忆探索地图，以南京大学鼓楼校区为核心地图，将学生与在特定校园地点的记忆按时间序列存储入档，通过大模型的定制化解读，播种与发掘记忆的意义。
前端使用 Vite + React，后端使用 Node.js + Express 提供本地 AI mock API。

## 本地启动

须先下载Node.js

首次使用先安装依赖：

```powershell
npm.cmd install
```

一键启动前端和后端：

```powershell
npm.cmd run dev:all
```

打开：

```text
http://127.0.0.1:5173/
```

也可以分两个终端启动：

```powershell
npm.cmd run server
npm.cmd run dev
```

## API 配置

默认前端会调用：

```text
http://127.0.0.1:3001
```

如果需要修改 API 地址，复制 `.env.example` 为 `.env`，然后根据本地端口修改：

```env
VITE_API_BASE_URL=http://127.0.0.1:3001
PORT=3001
```

`.env` 不要提交到 git。

## 当前 AI 模式

当前后端 `/api/ai` 和 `/api/chat` 使用本地 mock 回复，不需要真实 API Key。

如果未来接入真实模型，可以在 `.env` 中配置：

```env
OPENAI_API_KEY=replace-with-your-api-key
OPENAI_BASE_URL=api地址
OPENAI_MODEL=选择的模型
```


## 常用命令

```powershell
npm.cmd run dev
npm.cmd run server
npm.cmd run dev:all
npm.cmd run build
npm.cmd run preview
```
