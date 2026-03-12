# PaSoRi本番化セットアップ計画

**目標日**: 2024-03-12 実施
**対象PC**: 打刻用Windows PC
**状態**: 実装準備中

---

## ✅ 事前確認済み

```
✅ Node.js v24.14.0
✅ npm (最新)
✅ Python 3.12.10
⏳ Visual Studio Build Tools (インストール必要)
```

---

## 📋 実装フェーズ

### 【フェーズ1】開発環境セットアップ (本日)

#### 実施内容
```
1. Visual Studio Build Tools をインストール
   - C++ ビルドツール をインストール
   - Windows 10/11 SDK を含める

2. npm install pcsclite を実行
   - ネイティブモジュールをビルド
   - ビルド成功を確認

3. test-pasori.js で動作確認
   - すべてのテストが成功することを確認
```

#### 所要時間
```
Visual Studio Build Tools インストール: 15-30分
pcsclite ビルド: 5-10分
テスト実行: 1分
合計: 20-40分
```

---

### 【フェーズ2】PaSoRi UI 統合 (明日)

#### 実施内容
```
1. employee.html に pasori-ui.js を統合
   - UI コンポーネントを組み込み
   - CSS スタイルを適用

2. IC打刻の Firebase 保存処理を実装
   - カード読み込み時に自動保存
   - エラーハンドリング

3. 動作テスト
   - パソリでカード読み込みテスト
   - Firebase に記録が保存されることを確認
```

#### 実装ファイル
```
修正: kintai-electron/employee.html
追加: kintai-electron/pasori-attendance.js (新規)
修正: firebase.json (セキュリティルール)
```

---

### 【フェーズ3】本番テスト (3日目)

#### テストシナリオ
```
1. 単機テスト
   - 打刻用PCでIC打刻が記録される
   - Firebase に記録が保存される

2. 複数デバイステスト
   - 他のPCの管理画面でリアルタイム同期
   - スマホで従業員画面に反映
   - Electron版でも反映

3. ストレステスト
   - 複数カード連続読み込み
   - ネットワーク断時のエラー処理
```

---

## 🎯 本日のTo-Do

### ステップ1: Visual Studio Build Tools インストール

**手順:**
```
1. 以下URLにアクセス
   https://visualstudio.microsoft.com/ja/visual-cpp-build-tools/

2. 「Build Tools をダウンロード」をクリック

3. vs_BuildTools.exe を実行

4. 以下を選択:
   ☑ C++ ビルドツール
   ☑ Windows 10/11 SDK

5. インストール実行

6. PCを再起動
```

**確認コマンド:**
```bash
where cl.exe
# 出力: Visual Studio のパスが表示される
```

### ステップ2: pcsclite をビルド

**手順:**
```bash
cd kintai-electron

npm install pcsclite
```

**期待される出力:**
```
> pcsclite@1.0.1 install
> node-gyp rebuild
...
gyp ok
```

### ステップ3: テスト実行

**手順:**
```bash
node test-pasori.js
```

**期待される結果:**
```
✅ すべてのテスト成功
⚠️ pcsclite: インストール済み (前回は未インストール)
```

---

## 📦 実装に必要なファイル（既に完成）

```
✅ pasori-reader.js       - PC/SC Lite 通信モジュール
✅ pasori-ui.js          - ブラウザ UI コンポーネント
✅ test-pasori.js        - API テストスクリプト
✅ main.js               - Electron IPC ハンドラー
✅ preload.js            - API ブリッジ
```

---

## 🔄 次のステップ（明日）

### 【フェーズ2】PaSoRi UI の employee.html への統合

```html
<!-- employee.html に追加 -->
<script src="pasori-ui.js"></script>

<div id="pasori-container" style="margin: 20px;">
  <!-- PaSoRi UI が自動生成される -->
</div>

<script>
  document.addEventListener('DOMContentLoaded', async () => {
    const pasoriUI = new PaSoRiUI();

    pasoriUI.createReaderUI({
      containerId: 'pasori-container',
      onSuccess: (cardData) => {
        // IC打刻処理
        recordAttendance(cardData);
      },
      onError: (message) => {
        console.error('PaSoRi エラー:', message);
      }
    });
  });

  async function recordAttendance(cardData) {
    // Firebase に打刻記録を保存
    const record = {
      cardId: cardData.id,
      timestamp: new Date().toISOString(),
      type: 'attendance',
      readMethod: 'pasori'
    };

    // Firebase に保存
    await window.db.ref(`attendance/${Date.now()}`).set(record);
  }
</script>
```

---

## ⚠️ トラブルシューティング

### Visual Studio インストール失敗時
```
→ SETUP_VISUAL_STUDIO.md の「トラブルシューティング」を参照
```

### pcsclite ビルド失敗時
```
→ 以下を確認
1. Visual Studio がインストールされているか
2. C++ ワークロードがインストールされているか
3. Python がインストールされているか
4. PCを再起動したか
```

### パソリが認識されない時
```
→ 以下を確認
1. パソリが USB で接続されているか
2. Windows ドライバがインストールされているか
3. パソリを別の USB ポートに接続
4. PC を再起動
```

---

## 📞 確認事項

実装前に以下を確認してください：

- [ ] Visual Studio Build Tools をインストール予定ですか？
- [ ] 本日中に実装を完了したいですか？
- [ ] パソリのドライバは既にインストール済みですか？
- [ ] テスト用のFeliCa カード（Suica等）がありますか？

---

**計画作成日**: 2024-03-12
**対象環境**: Windows 10/11
**依存関係**: Visual Studio Build Tools
**次更新予定**: 実装完了時
