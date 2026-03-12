# AidanTUI

Un CRM personnel et suivi d'activite oriente terminal, construit avec Bun, React et OpenTUI.

## Langues

- [English](./README.md)
- [中文（简体）](./README.zh-CN.md)
- [हिन्दी](./README.hi.md)
- [Español](./README.es.md)
- [العربية](./README.ar.md)
- Francais (ce fichier)

Note de documentation: les ameliorations de traduction de la communaute sont bienvenues.

## Fonctionnalites

- Suit les etapes du pipeline commercial.
- Synchronise le contexte de communication depuis Gmail et Slack.
- Prend en charge la configuration d'enregistrement local et le stockage local.
- Fonctionne comme application TUI dans le terminal.

## Prerequis

- Bun 1.3+
- Identifiants Google OAuth (pour la synchronisation Gmail)
- Jeton bot Slack optionnel (pour la synchronisation Slack)

## Demarrage rapide

1. Installer les dependances:
   - `bun install`
2. Creer la configuration locale:
   - `mkdir -p ~/.aidantui`
   - `cp config.example.toml ~/.aidantui/config.toml`
3. Configurer le refresh token Google OAuth:
   - `bun run setup-auth`
4. (Optionnel) Compiler le markdown du pipeline en triggers:
   - `bun run compile-pipeline`
5. Lancer l'application:
   - `bun run dev`

## Scripts

- `bun run dev` — demarre l'application TUI
- `bun run setup-auth` — genere le refresh token OAuth
- `bun run compile-pipeline` — compile les regles du pipeline

## Configuration

Utilisez `config.example.toml` comme modele. Sections principales:

- `[google]` identifiants OAuth
- `[gmail]` requete et filtre de domaines
- `[slack]` jeton bot et canaux
- `[recording]` preferences audio
- `[general]` dossier de donnees et comportement de synchronisation
