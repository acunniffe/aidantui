# AidanTUI

Un CRM personal y rastreador de actividad, orientado a terminal, construido con Bun, React y OpenTUI.

## Idiomas

- [English](./README.md)
- [中文（简体）](./README.zh-CN.md)
- [हिन्दी](./README.hi.md)
- Español (este archivo)
- [العربية](./README.ar.md)

## Qué hace

- Gestiona etapas del pipeline de ventas.
- Sincroniza contexto de comunicación desde Gmail y Slack.
- Soporta configuración local de grabación y almacenamiento local de datos.
- Se ejecuta como una app de interfaz en terminal.

## Requisitos

- Bun 1.3+
- Credenciales de Google OAuth (para sincronización con Gmail)
- Token de bot de Slack opcional (para sincronización con Slack)

## Inicio rápido

1. Instala dependencias:
   - `bun install`
2. Crea la configuración local:
   - `mkdir -p ~/.aidantui`
   - `cp config.example.toml ~/.aidantui/config.toml`
3. Configura el refresh token de Google OAuth:
   - `bun run setup-auth`
4. (Opcional) Compila el markdown del pipeline en triggers:
   - `bun run compile-pipeline`
5. Inicia la app:
   - `bun run dev`

## Scripts

- `bun run dev` — inicia la app TUI
- `bun run setup-auth` — genera refresh token OAuth
- `bun run compile-pipeline` — compila reglas de pipeline

## Configuración

Usa `config.example.toml` como plantilla. Secciones principales:

- `[google]` credenciales OAuth
- `[gmail]` consulta y filtro de dominios
- `[slack]` token de bot y canales
- `[recording]` preferencias de audio
- `[general]` directorio de datos y comportamiento de sincronización
