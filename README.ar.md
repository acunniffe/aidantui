# AidanTUI

نظام CRM شخصي ومتتبع أنشطة يعمل من الطرفية، مبني باستخدام Bun وReact وOpenTUI.

## اللغات

- [English](./README.md)
- [中文（简体）](./README.zh-CN.md)
- [हिन्दी](./README.hi.md)
- [Español](./README.es.md)
- العربية (هذا الملف)
- [Francais](./README.fr.md)

## ماذا يفعل

- يتابع مراحل خط أنابيب المبيعات.
- يزامن سياق التواصل من Gmail وSlack.
- يدعم إعدادات تسجيل محلية وتخزين بيانات محلي.
- يعمل كتطبيق واجهة طرفية (TUI).

## المتطلبات

- Bun 1.3+
- بيانات اعتماد Google OAuth (لمزامنة Gmail)
- رمز Slack bot اختياري (لمزامنة Slack)

## البدء السريع

1. ثبّت الاعتماديات:
   - `bun install`
2. أنشئ الإعداد المحلي:
   - `mkdir -p ~/.aidantui`
   - `cp config.example.toml ~/.aidantui/config.toml`
3. أعدد رمز التحديث لـ Google OAuth:
   - `bun run setup-auth`
4. (اختياري) حوّل ملف pipeline markdown إلى triggers:
   - `bun run compile-pipeline`
5. شغّل التطبيق:
   - `bun run dev`

## الأوامر

- `bun run dev` — تشغيل تطبيق TUI
- `bun run setup-auth` — إنشاء رمز تحديث OAuth
- `bun run compile-pipeline` — تحويل قواعد pipeline

## الإعداد

استخدم `config.example.toml` كقالب. الأقسام الأساسية:

- `[google]` بيانات اعتماد OAuth
- `[gmail]` الاستعلام وتصفية النطاقات
- `[slack]` رمز البوت والقنوات
- `[recording]` تفضيلات الصوت
- `[general]` مسار البيانات وسلوك المزامنة
