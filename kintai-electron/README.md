# 勤怠管理システム - Electron版

Electronベースの勤怠管理アプリケーションです。

## 機能

- 管理者向けダッシュボード (kintai.html)
- 従業員向けポータル (employee.html)
- Firebase Realtime Databaseによるリアルタイム同期
- シフト希望申請・変更通知システム
- Web打刻・IC カード対応

## セットアップ

```bash
npm install
```

## 実行

```bash
npm start
```

## ビルド

### Windows
```bash
npm run build:win
```

### macOS
```bash
npm run build:mac
```

### Linux
```bash
npm run build:linux
```

## ファイル構成

- `main.js` - Electronメインプロセス
- `preload.js` - セキュリティコンテキスト分離
- `kintai.html` - 管理者向け画面
- `employee.html` - 従業員向け画面

## 今後の予定

- [ ] NFC/PASORI カードリーダー統合
- [ ] オフライン対応
- [ ] 自動更新機能
- [ ] ネイティブ通知

## Firebase設定

Firebase設定は `kintai.html` と `employee.html` に埋め込まれています。

## ライセンス

ISC
