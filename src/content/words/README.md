# 词库数据

词库按“语言 / 词组”拆分，每个 JSON 文件对应一个可独立练习的词组：

```text
words/
├── data/
│   ├── en/              # 英语词组
│   └── ja/              # 日语词组
├── en.ts                # 英语词组顺序
├── ja.ts                # 日语词组顺序
├── schema.ts            # 数据完整性与 ID 校验
└── index.ts             # 业务统一入口
```

## 添加词条

直接编辑对应词组的 JSON 文件。每个词条必须包含稳定 ID、原文、释义、例句和例句翻译；日语词条再补 `reading`。

```json
{
  "id": "en-daily-check-in",
  "term": "check in",
  "audioUrl": "https://example-cdn.com/audio/en-daily-check-in.mp3",
  "meaning": "办理入住",
  "example": "We can check in after three.",
  "exampleZh": "三点后可以办理入住。"
}
```

`audioUrl` 可选，用于单条覆盖默认配音。内置词条、例句、口语和假名的预生成 CDN 地址集中保存在 `src/lib/audio.generated.json`，项目中不存储音频文件。新增内容后运行 `pnpm audio:generate`，脚本会跳过已生成项并补齐缺失地址。只有用户自定义的新词会在首次朗读时请求 TTS 接口。

词条 ID 会作为本地学习记录的键。已有 ID 不要修改或复用；新 ID 建议使用 `<词组 ID>-<简短英文标识>`，不要依赖数组下标。历史 `ja-katakana` 数据仍保留原有的 `ja-kata-*` 前缀。

## 添加词组

1. 在 `data/en` 或 `data/ja` 下新增一个 JSON 文件。
2. 词组包含 `id`、`lang`、`title`、`subtitle` 和非空 `words`。
3. 在 `en.ts` 或 `ja.ts` 中导入并加入数组；数组顺序即页面展示顺序。
4. 运行 `pnpm build`。缺失字段、错误语言或重复 ID 会在页面加载时直接报错。

## 约束

- 英语 `lang` 固定为 `en`，日语固定为 `ja`。
- 词组 ID 全局唯一；词条 ID 全局唯一。
- 新词条 ID 建议以对应词组 ID 加连字符开头。
- 不在数据文件中保存“认识 / 不认识”等用户状态。
