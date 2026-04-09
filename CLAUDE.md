# groove2score

ドラム MIDI ファイル（主に Addictive Drums 2）を定量化・整形した Midi または MusicXML に変換する CLI ツール。MuseScore での譜面表示を最終目的とする。

## 構成

- `src/cli/` — CLI エントリポイント（commander）
- `src/core/` — MIDI 解析・MusicXML 変換ロジック
- `src/mappings/` — ドラム音源ごとの MIDI ノート番号 → 打楽器種別マッピング

## 制限

- 調査はサブエージェントに任せること
- 実装後は必ずチェックを行うこと
