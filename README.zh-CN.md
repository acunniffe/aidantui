# AidanTUI

一个基于 Bun、React 和 OpenTUI 的终端优先个人 CRM 与活动追踪工具。

## 语言

- [English](./README.md)
- 中文（简体，本文件）
- [हिन्दी](./README.hi.md)
- [Español](./README.es.md)
- [العربية](./README.ar.md)

## 功能

- 跟踪销售流程阶段。
- 从 Gmail 和 Slack 同步沟通上下文。
- 支持本地录音配置与本地数据存储。
- 以终端 UI 形式运行。

## 环境要求

- Bun 1.3+
- Google OAuth 凭据（用于 Gmail 同步）
- 可选：Slack Bot Token（用于 Slack 同步）

## 快速开始

1. 安装依赖：
   - `bun install`
2. 创建本地配置：
   - `mkdir -p ~/.aidantui`
   - `cp config.example.toml ~/.aidantui/config.toml`
3. 配置 Google OAuth 刷新令牌：
   - `bun run setup-auth`
4. （可选）将流程 Markdown 编译为触发器：
   - `bun run compile-pipeline`
5. 启动应用：
   - `bun run dev`

## 脚本

- `bun run dev` — 启动 TUI 应用
- `bun run setup-auth` — 生成 OAuth 刷新令牌
- `bun run compile-pipeline` — 编译流程规则

## 配置

可使用 `config.example.toml` 作为模板，主要包含：

- `[google]` OAuth 凭据
- `[gmail]` 查询条件与域名过滤
- `[slack]` Bot Token 与频道列表
- `[recording]` 音频偏好设置
- `[general]` 数据目录与同步行为
