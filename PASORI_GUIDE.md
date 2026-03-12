# PaSoRi (パソリ) 統合ガイド

このガイドでは、Electron版の勤務管理アプリにパソリ（RC-S380）を統合する方法について説明します。

## 📋 システム要件

- **OS**: Windows 7 以降（推奨：Windows 10/11）
- **ハードウェア**: パソリ（RC-S380など）+ USB接続
- **Node.js**: v14 以上
- **Electron**: v41 以上

## 🔧 セットアップ

### 1. Windows ドライバのインストール

パソリを使用する前に、Windows用のドライバをインストール必要があります。

**Sony の公式サイトからドライバをダウンロード：**
- https://www.sony.co.jp/Products/felica/consumer/support/

または

**PaSoRi/RC-S380 のドライバパッケージをインストール**

### 2. パッケージのインストール

```bash
cd kintai-electron
npm install
```

`package.json` に以下のパッケージが含まれています：
- `pcsclite` - PC/SC Lite (Windows PC/SC) バイディング

### 3. パソリの接続

1. パソリを USB で PC に接続
2. ドライバが正しくインストールされていることを確認
3. Electron アプリを起動

## 📱 使用方法

### HTML での使用

**従業員画面（employee.html）への統合例：**

```html
<!-- ページの <head> に追加 -->
<script src="pasori-ui.js"></script>

<!-- ボディの適切な箇所に追加 -->
<div id="pasori-container"></div>

<script>
    // ページロード時に初期化
    document.addEventListener('DOMContentLoaded', async () => {
        const pasoriUI = new PaSoRiUI();

        // PaSoRi UI を作成
        pasoriUI.createReaderUI({
            containerId: 'pasori-container',
            autoStart: true,
            onSuccess: (cardData) => {
                console.log('カード読み込み成功:', cardData);
                // ここで打刻処理やFirebaseへの保存を実行
                saveAttendanceRecord(cardData.id);
            },
            onError: (message) => {
                console.error('カード読み込みエラー:', message);
                // エラー処理
            }
        });
    });

    // 打刻記録をFirebaseに保存
    async function saveAttendanceRecord(cardId) {
        const now = new Date();
        const record = {
            cardId: cardId,
            timestamp: now.toISOString(),
            type: 'attendance', // 'attendance' or 'departure'
            readMethod: 'pasori'
        };

        try {
            // Firebase へのリアルタイム保存
            // (既存の Firebase 設定に統合)
            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record)
            });
            console.log('打刻記録を保存しました:', record);
        } catch (error) {
            console.error('保存に失敗しました:', error);
        }
    }
</script>
```

### JavaScript での直接使用

```javascript
// PaSoRi UI インスタンスを作成
const pasoriUI = new PaSoRiUI();

// 初期化
await pasoriUI.initialize();

// カード読み込みイベントをリッスン
pasoriUI.onCardRead = (cardData) => {
    console.log('カードID:', cardData.id);
    console.log('読み込み時刻:', cardData.timestamp);
    console.log('タイプ:', cardData.type);
};

// エラーをリッスン
pasoriUI.onError = (message) => {
    console.error('エラー:', message);
};

// 手動読み込み
const result = await pasoriUI.readCard();
if (result.success) {
    console.log('カードデータ:', result.data);
}

// 停止
await pasoriUI.stop();
```

### Electron IPC での低レベル使用

```javascript
// パソリを初期化
const result = await window.electron.pasori.initialize();

// カード読み込みイベントをリッスン
window.electron.pasori.onCardRead((event, cardData) => {
    console.log('カードデータ:', cardData);
});

// 手動読み込み
const readResult = await window.electron.pasori.readCard();

// 停止
await window.electron.pasori.stop();
```

## 📊 カードデータ構造

パソリから読み込まれるカードデータの構造：

```javascript
{
    id: "0123456789ABCDEF",  // FeliCa カードID (16文字の16進数)
    timestamp: "2024-03-12T12:34:56.789Z",  // ISO 8601 タイムスタンプ
    type: "FeliCa",  // カードタイプ
    manufacturer: "Felica (Standard)"  // 製造業者情報
}
```

## 🔌 パソリサポートの詳細

### PC/SC Lite API

本実装は PC/SC Lite API（APDU コマンド経由）を使用しています：

1. **FeliCa ポーリングコマンド**
   ```
   FF 00 00 00 05 D6 06 00 00 FF 00
   ```

2. **カード ID の抽出**
   - IDm（8バイト）をレスポンスから抽出
   - 16進数文字列に変換

### 対応カード

- ✅ Suica
- ✅ Pasmo
- ✅ WAON
- ✅ nanaco
- ✅ 住民基本台帳カード
- ✅ 各種FeliCa対応カード

### 非対応カード

- ❌ Mifare（Mifare Classic など）
- ❌ ISO/IEC 14443 Type A (NXP Mifare シリーズ)

## 🐛 トラブルシューティング

### パソリが認識されない

```javascript
// 初期化が失敗する場合
const result = await window.electron.pasori.initialize();
if (!result.success) {
    console.error('初期化エラー:', result.message);
}
```

**解決策：**
1. パソリが USB で正しく接続されているか確認
2. Windows のドライバが正しくインストールされているか確認
3. Electron アプリを再起動

```bash
# デバイスマネージャーで確認（Windows）
# コントロールパネル → デバイスマネージャー → USB デバイス
```

### カードが読み込めない

**パソリの初期化確認：**
```javascript
await window.electron.pasori.initialize()
    .then(result => {
        if (result.success) {
            console.log('PaSoRi 準備完了');
        }
    })
    .catch(error => {
        console.error('初期化失敗:', error);
    });
```

**解決策：**
1. FeliCa 対応カードを使用しているか確認
2. パソリの位置を調整（カードをかざす距離や角度）
3. PC を再起動（USB デバイスのリセット）

### PC/SC エラー

**一般的なエラーメッセージ：**
- `"SCARD_E_NO_READERS_AVAILABLE"` - パソリが検出されない
- `"SCARD_E_TIMEOUT"` - カード読み込みタイムアウト
- `"SCARD_E_NOT_TRANSACTED"` - 通信エラー

**確認項目：**
1. Windows のスマートカードサービスが実行中か確認
2. パソリのドライバが最新版か確認
3. USB ハブ経由でなく、PC に直接接続

## 📝 Firebase との統合

打刻記録を Firebase Realtime Database に保存する例：

```javascript
import { getDatabase, ref, set } from 'firebase/database';

async function saveAttendanceWithPaSoRi(cardId) {
    const db = getDatabase();
    const now = new Date();
    const timestamp = now.toISOString();

    // カード ID から従業員を検索
    const employees = await fetch('/api/employees');
    const employeeList = await employees.json();
    const employee = employeeList.find(e => e.cardId === cardId);

    if (!employee) {
        throw new Error(`カード ID が見つかりません: ${cardId}`);
    }

    // Firebase に保存
    const recordId = `${employee.id}-${Date.now()}`;
    await set(ref(db, `attendance/${recordId}`), {
        employeeId: employee.id,
        employeeName: employee.name,
        cardId: cardId,
        timestamp: timestamp,
        type: 'check_in',
        method: 'pasori',
        ipAddress: getClientIP(),
        userAgent: navigator.userAgent
    });

    return { success: true, employee: employee };
}
```

## 🔐 セキュリティに関する注意

1. **カード ID の保護**
   - カード ID を平文で保存しないでください
   - Firebase のセキュリティルールで制限してください

2. **ネットワーク通信**
   - Firebase との通信は HTTPS で暗号化されます
   - ローカルネットワーク上で安全に操作してください

3. **ドライバの信頼性**
   - 公式サイトからのみドライバをダウンロード
   - 定期的にアップデートを確認

## 📚 参考資料

- [Sony PaSoRi 公式サイト](https://www.sony.co.jp/Products/felica/consumer/)
- [PC/SC API ドキュメント](https://pcsclite.apdu.org/)
- [pcsclite npm パッケージ](https://www.npmjs.com/package/pcsclite)

## 🚀 次のステップ

1. ✅ Electron アプリにパソリ機能を統合
2. ⏳ 打刻画面でパソリを使用
3. ⏳ Firebase にデータを保存・同期
4. ⏳ 管理画面で打刻データを表示
5. ⏳ 本番環境でテスト
