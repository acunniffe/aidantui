# AidanTUI

Bun, React और OpenTUI पर बना एक टर्मिनल-फर्स्ट पर्सनल CRM और एक्टिविटी ट्रैकर।

## भाषाएँ

- [English](./README.md)
- [中文（简体）](./README.zh-CN.md)
- हिन्दी (यह फ़ाइल)
- [Español](./README.es.md)
- [العربية](./README.ar.md)

## यह क्या करता है

- सेल्स पाइपलाइन स्टेज ट्रैक करता है।
- Gmail और Slack से कम्युनिकेशन कॉन्टेक्स्ट सिंक करता है।
- लोकल रिकॉर्डिंग सेटिंग्स और लोकल डेटा स्टोरेज सपोर्ट करता है।
- टर्मिनल UI ऐप के रूप में चलता है।

## आवश्यकताएँ

- Bun 1.3+
- Google OAuth क्रेडेंशियल्स (Gmail सिंक के लिए)
- वैकल्पिक Slack bot token (Slack सिंक के लिए)

## जल्दी शुरू करें

1. डिपेंडेंसी इंस्टॉल करें:
   - `bun install`
2. लोकल कॉन्फ़िग बनाएं:
   - `mkdir -p ~/.aidantui`
   - `cp config.example.toml ~/.aidantui/config.toml`
3. Google OAuth refresh token सेट करें:
   - `bun run setup-auth`
4. (वैकल्पिक) pipeline markdown को triggers में compile करें:
   - `bun run compile-pipeline`
5. ऐप शुरू करें:
   - `bun run dev`

## स्क्रिप्ट्स

- `bun run dev` — TUI ऐप शुरू करें
- `bun run setup-auth` — OAuth refresh token बनाएं
- `bun run compile-pipeline` — pipeline rules compile करें

## कॉन्फ़िगरेशन

`config.example.toml` को टेम्पलेट की तरह इस्तेमाल करें। मुख्य सेक्शन:

- `[google]` OAuth क्रेडेंशियल्स
- `[gmail]` query और domain filter
- `[slack]` bot token और channels
- `[recording]` audio preferences
- `[general]` data directory और sync behavior
