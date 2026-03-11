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

- `main.js` - Electronメインプロセス（IPC、NFC通信）
- `preload.js` - セキュリティコンテキスト分離（electron.nfc API公開）
- `nfc-handler.js` - NFC処理ハンドラー
- `nfc-integration.html` - Web NFC API統合スクリプト
- `kintai.html` - 管理者向け画面
- `employee.html` - 従業員向け画面

## NFC/PASORI対応

Web NFC APIを使用したNFC カードリーディング機能を実装。以下の機能が利用可能：

- ✅ NFC カード読取
- ✅ PASORI カードリーダー対応
- ✅ Electron + ブラウザ両対応
- ✅ NDEF レコード解析

### 使用例

```javascript
// NFC対応チェック
if (nfcIntegration.isSupported()) {
    await nfcIntegration.startScanning({
        onCardRead: (cardData) => {
            console.log('カード読取:', cardData.id);
            // 打刻処理実行
        },
        onError: (error) => console.error('NFC エラー:', error)
    });
}
```

## 今後の予定

- [ ] オフライン対応
- [ ] 自動更新機能
- [ ] ネイティブ通知
- [ ] 複数NFC形式対応

## Firebase設定

Firebase設定は `kintai.html` と `employee.html` に埋め込まれています。

## ライセンス

ISC
