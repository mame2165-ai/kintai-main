# Firebase Hosting デプロイガイド

勤怠管理システムを Firebase Hosting でインターネット公開します。

## 🚀 デプロイ手順

### ステップ 1️⃣：Firebase CLI をインストール

```bash
npm install -g firebase-tools
```

### ステップ 2️⃣：Firebase にログイン

```bash
firebase login
```

ブラウザが開き、Google アカウントでログインするよう求められます。
**kintai-fee67** プロジェクトでログインしてください。

### ステップ 3️⃣：デプロイ

```bash
firebase deploy --only hosting
```

デプロイが完了すると、以下のようなメッセージが表示されます：

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/kintai-fee67/overview
Hosting URL: https://kintai-fee67.firebaseapp.com
```

## 📱 アクセス URL

デプロイ完了後、以下の URL でアクセス可能になります：

```
https://kintai-fee67.firebaseapp.com/
```

### 各ページ

| ページ | URL |
|--------|-----|
| ホーム（選択画面） | https://kintai-fee67.firebaseapp.com/ |
| 管理画面 | https://kintai-fee67.firebaseapp.com/kintai.html |
| 従業員ポータル | https://kintai-fee67.firebaseapp.com/employee.html |

## ✨ 特徴

✅ **インターネット接続があればどこからでもアクセス可能**
- 自社ネットワークの外からアクセス可能
- 出張先、在宅勤務からのアクセスに対応

✅ **Firebase と完全統合**
- データは Firebase Realtime Database に保存
- リアルタイム同期（複数デバイス対応）
- インターネット経由でどのデバイスからでも同じデータにアクセス

✅ **SSL/TLS で暗号化通信**
- すべての通信が https で暗号化
- 安全なデータ送受信

## 🔄 更新時の再デプロイ

HTML ファイルを修正した場合：

1. **元のHTMLファイルを修正**
   ```
   kintai.html
   employee.html
   ```

2. **public フォルダにコピー**
   ```bash
   cp kintai.html public/
   cp employee.html public/
   ```

3. **再度デプロイ**
   ```bash
   firebase deploy --only hosting
   ```

## 🛠️ スクリプト化（Windows）

Windows で簡単にデプロイできるバッチファイル：

**deploy.bat** を作成：
```batch
@echo off
chcp 65001 > nul
echo.
echo ========================================
echo  Firebase Hosting へのデプロイ
echo ========================================
echo.

REM ファイルをコピー
echo 📝 ファイルをコピー中...
copy /Y kintai.html public\kintai.html >nul 2>&1
copy /Y employee.html public\employee.html >nul 2>&1

REM デプロイ実行
echo 🚀 Firebase Hosting にデプロイ中...
firebase deploy --only hosting

echo.
echo ✅ デプロイ完了！
echo https://kintai-fee67.firebaseapp.com/
echo.
pause
```

このバッチファイルをダブルクリックすると、ファイルのコピーとデプロイが自動実行されます。

## 📊 Firebase Hosting の管理

### デプロイ履歴の確認
```bash
firebase hosting:list
```

### 特定バージョンにロールバック
```bash
firebase hosting:rollback <version_id>
```

### ホスティング設定の確認
```bash
firebase hosting:disable
```

## 🔐 セキュリティ注意事項

⚠️ **管理画面のパスワードは安全なものを使用してください**
- 初期パスワード: `admin123456` → **変更推奨**

⚠️ **Firebase Security Rules を設定してください**
- `database.rules.json` で Realtime Database へのアクセス制限を実装

⚠️ **本番環境では Firebase の設定を確認**
- 不要な読み書き権限を削除
- ユーザー認証の実装を検討

## 🐛 トラブルシューティング

### デプロイエラー：「Permission denied」

```
Error: Failed to delete specified path: permission denied
```

**解決方法：**
```bash
firebase logout
firebase login
firebase deploy --only hosting
```

### デプロイ後、ページが見つからない

1. Firebase コンソールで正しいプロジェクトが選択されているか確認
   ```bash
   firebase use --list
   ```

2. 設定確認
   ```bash
   firebase list
   ```

### キャッシュの問題

ブラウザのキャッシュをクリア（Ctrl+Shift+Del）してから再度アクセスしてください。

## 📞 その他

詳細は Firebase 公式ドキュメント：
https://firebase.google.com/docs/hosting

---

**デプロイ完了後、全世界からアクセス可能になります！** 🌍
