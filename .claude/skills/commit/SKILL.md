---
name: commit
description: groove2score プロジェクト用のコミット＆プッシュスキル。コミット、プッシュ、PR作成を行うとき、または「コミット」「プッシュ」「commit」「push」「PR」と言われたときに使うこと。
---

## 機密情報チェック

`git diff HEAD` の内容を確認し、以下が含まれていないかチェックすること：
- APIキー、トークン、パスワード、シークレット
- 秘密鍵や認証情報
- `.env` ファイルや credential ファイル

**見つかった場合は即座に中断し、ユーザーに確認を取ること。確認が取れるまでコミットしない。**

## コミットメッセージのルール

- 簡潔かつ分かりやすく（件名は72文字以内）
- 命令形で書く（例：「Add feature」「Fix bug」）
- リポジトリの既存スタイルに合わせる

## コミットコマンド

必ず `--signoff` を付けること：

```bash
git commit --signoff -m "メッセージ"
```

## プッシュ・PR作成（要求された場合）

```bash
git push origin <branch>
gh pr create --title "タイトル" --body "説明"
```
