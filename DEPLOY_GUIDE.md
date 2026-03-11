# Firebase Hosting デプロイ実行ガイド

Firebase CLI のセットアップと デプロイ手順を説明します。

## 📋 前提条件

✅ Node.js がインストールされている
✅ Firebase CLI がインストール済み（`npm install -g firebase-tools`）
✅ Google アカウントを持っている

## 🔐 Firebase ログイン（初回のみ）

### Windows コマンドプロンプトで実行

```bash
firebase login
```

**動作：**
1. ブラウザが自動的に開く
2. Google アカウントでログイン
3. 「Google Cloud にアクセスを許可しますか？」に **はい** をクリック
4. コマンドプロンプトに戻る

### ログイン確認

```bash
firebase list
```

実行結果：
```
┌───────────────────┬──────────────┬─────────────┐
│ Name              │ Project ID   │ Permissions │
├───────────────────┼──────────────┼─────────────┤
│ kintai-fee67      │ kintai-fee67 │ Owner       │
└───────────────────┴──────────────┴─────────────┘
```

## 🚀 デプロイ方法

### 方法1️⃣：deploy.bat をダブルクリック（最も簡単）

```
deploy.bat
```

自動的に：
1. HTML ファイルを public フォルダにコピー
2. Firebase Hosting にデプロイ
3. デプロイ完了時に URL を表示

### 方法2️⃣：コマンドプロンプトで手動実行

```bash
firebase deploy --only hosting
```

### 方法3️⃣：全て手動で実行

```bash
# ファイルをコピー
copy kintai.html public\kintai.html
copy employee.html public\employee.html

# デプロイ
firebase deploy --only hosting
```

## ✅ デプロイ成功の確認

コマンドプロンプトに以下のように表示されます：

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/kintai-fee67/overview
Hosting URL: https://kintai-fee67.firebaseapp.com
```

## 📱 アクセス

デプロイ完了後、以下の URL でアクセス可能：

```
https://kintai-fee67.firebaseapp.com/
```

## 🔄 更新手順

1. ローカルの `kintai.html` または `employee.html` を修正
2. `deploy.bat` をダブルクリック
3. 自動的に更新されます

## 🐛 トラブルシューティング

### エラー：「Permission denied」

**原因：** ログインしていない

**解決：**
```bash
firebase logout
firebase login
firebase deploy --only hosting
```

### エラー：「No hosted site found」

**原因：** Firebase Hosting が有効になっていない

**解決：**
1. [Firebase Console](https://console.firebase.google.com) にアクセス
2. kintai-fee67 プロジェクトを選択
3. 左メニュー → Hosting → 有効化

### デプロイ後、ページが見つからない

**原因：** ブラウザキャッシュ

**解決：**
```
Ctrl + Shift + Delete でキャッシュをクリア
```

### Firebase にログインできない

**解決方法1：** 別のマシンでログイン

```bash
firebase login --no-localhost
```

ブラウザが開かない場合、表示される URL を手動でブラウザにコピー＆ペースト

**解決方法2：** トークンを使用

Firebase Console から認証トークンを取得して設定

## 📊 デプロイ状況の確認

### デプロイ履歴を確認

```bash
firebase hosting:list
```

### リリース履歴を確認

```bash
firebase deploy:list
```

## 🔙 ロールバック（前のバージョンに戻す）

```bash
firebase hosting:rollback
```

## 📞 サポート

問題が解決しない場合：

1. Firebase Console でプロジェクト設定を確認
2. Firebase 公式ドキュメント：https://firebase.google.com/docs/hosting
3. Firebase サポート：https://firebase.google.com/support

---

**デプロイが完了すれば、全世界からアクセス可能になります！** 🌍
