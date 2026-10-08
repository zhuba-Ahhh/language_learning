# 日语词句配音统一 · 2026-10-08

目标 156 条含汉字的日语词句，当前发布 144 条新 CDN。页面原文、音频 key、item ID 与学习记录不变；英语、纯假名和已修复的 51 个纯汉字词不变。配音制作均为离线脚本调用，网页只播放 CDN，没有本地 MP3。

## 接口核对

- BAM 查询 `webcast.game.role_agents / GenerateAvgTextToSpeechAudio` 最新登记版本 `1.0.171`，endpoint `4331126`。
- `common_request` 只有 `speaker / audio_config / context_texts`，item 只有 `item_id / text / context_texts`。类型查询命令是 `bytedcli --json bam method gencode --endpoint-id 4331126 --version 1.0.171 --schema-type request --lang ts`。
- 本地 `game_role_agents/client/text_to_speech_additions.go` 确实能将 `ExplicitLanguage` 写入下游 additions 字符串，但本地 AVG service / executor 未向 client 赋值。未修改另一个仓库、后端、IDL 或生产配置。
- 以上证明的是登记契约和本地实现，不是所有 PPE 部署实例的行为。没有靠 HTTP 200 推断未定义字段已经透传。若有新入口，应核对其确切请求示例后再接入。

## 制作与时间轴

`scripts/japanese-speech.json` 为 156 条词句维护振假名，去掉标注必须严格还原原文；合成文本只允许假名和标点。`Web / React` 转为日语片假名读法，数字按语境维护读音；不转换中文教学解释。`scripts/japanese-speech.mjs` 只用于离线制作，不是运行时辞书。

假名字幕按完整注音边界映射到原文，保留服务的真实秒数，禁止按字数拆分。数字边界细化未改变合成文本，仅从原回执重建时间轴，没有再次请求配音。缺失尾句不能用旧音频时间轴或估算时间补齐。

共 18 次请求、157 条提交：1 条先行检查、155 条批量制作、1 条已明确成功但字幕不完整的定向复查。没有请求结果不明后的自动重试。复查仍缺失尾句，停止继续生成。

## 尚未发布的 12 条

这 12 条新音频缺失尾句字幕，因此恢复本轮前的 CDN 和时间轴，保留全部新制作回执与链接，不将它们标为已完成。没有删除远端资产。完整前后链接、HEAD 结果和缺失范围见 `manifest.json`。

当前发布的 144 条完成 CDN HEAD 验证；所有 156 条候选 CDN 都返回 HTTP 200、audio 类型和非零长度。13 项训练检查保留原标准，全部通过；请求/假名映射/字幕缺失拒绝发布的模拟检查通过。CDN 可访问和字幕覆盖完整不等于逐条人工听感、重音或音频内容完整性审校。

浏览器在独立端口 `43810` 抽查截图例句，原文「大学生」能从新 CDN 的词位置播放，观察到实际播放状态。未操作用户的 3000 服务和学习记录，未录音。浏览器证据使用 CUA；CDP 无法访问内置浏览器标签，因此没有网络录制。

剩余工作：确认可用的语种透传契约，或明确采用逐句 CDN 制作/播放方案；完成上述 12 条并人工试听后，才能声称全部中日混读已消除。
