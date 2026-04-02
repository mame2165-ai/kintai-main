# 勤務管理アプリ - 実装状況レポート

**作成日**: 2024-03-12
**バージョン**: v2.0 (PaSoRi統合完了版)
**ステータス**: 開発版完成 → 本番展開準備中

---

## 🎯 プロジェクト概要

### テスト段階から本番運用へ
本プロジェクトは、以下の新しい運用要件に対応する必要があります：

```
【従来の要件】
✅ GitHub + Firebase で複数PC・スマホからアクセス
✅ リアルタイム同期が動作
✅ PaSoRi IC カード読み込み

【新しい運用要件 - 3つの利用シーン】
1️⃣ 勤怠管理 & 従業員画面
   - 複数PC・スマホから見られる状態
   - リアルタイム同期

2️⃣ 打刻用PC（別PC）
   - PaSoRi接続してIC打刻可能
   - カード読み込み時に自動打刻

3️⃣ 全体
   - シフト提出・打刻記録・管理者設定
   - 全媒体でリアルタイム同期
```

---

## 📊 現在の実装状況

### 1️⃣ Firebase Hosting リアルタイム同期

**ステータス**: ✅ **実装済み・動作確認済み**

#### 実装内容
- **SDK**: Firebase 9.23.0 (compat版)
- **データベース**: Realtime Database (asia-southeast1)
- **URL**: https://kintai-fee67-default-rtdb.asia-southeast1.firebasedatabase.app

#### 同期対象データ
```javascript
// employee.html & kintai.html で共通
- employees (従業員マスタ)
- shifts (シフト希望)
- attendance (打刻記録)
- settings (管理者設定)
```

#### 複数デバイス対応
```
✅ Web ブラウザ (PC/Mac/Linux)
   - https://kintai-fee67.firebaseapp.com/kintai.html (管理画面)
   - https://kintai-fee67.firebaseapp.com/employee.html (従業員画面)

✅ スマートフォン (iOS/Android)
   - レスポンシブデザイン対応
   - タッチ操作対応

✅ Electron版デスクトップアプリ
   - ローカルHTTPサーバー (http://localhost:3000)
   - 同じ HTML ファイルを使用
```

#### 動作確認済み機能
```
✅ リアルタイム双方向同期
✅ オフライン対応 (localStorageフォールバック)
✅ 複数ウィンドウ・タブの同時更新
✅ セッション管理
```

---

### 2️⃣ Electron版アプリの同期

**ステータス**: ⚠️ **部分的実装 - 改善必要**

#### 現在の実装
```javascript
// main.js
- ローカルHTTPサーバー起動 (PORT 3000)
- 管理画面と従業員画面を別ウィンドウで表示
- IPC通信 (pasori:initialize, pasori:readCard等)
- PaSoRi統合ハンドラー
```

#### 動作確認済み
```
✅ Electron起動
✅ ローカルサーバー起動
✅ HTTP://localhost:3000でアクセス可能
✅ Firebase接続（同じHTMLを使用）
```

#### 現在の課題
```
❌ 同期遅延 - データ更新が遅い場合がある
❌ セッション同期 - 複数ウィンドウでセッションが異なる
❌ キャッシュ管理 - localStorageの一貫性維持が困難
```

#### 改善方針
```
🔧 メインプロセスでFirebaseリアルタイムリスナーを設定
🔧 ipcMain.handleで同期状態を管理
🔧 レンダープロセスに push通知で更新を通知
```

---

### 3️⃣ PaSoRi (IC カード) 連携

**ステータス**: ✅ **開発版完成 → 本番対応準備中**

#### 実装済みモジュール
```
✅ pasori-reader.js
   - PC/SC Lite API経由の通信
   - FeliCa カード読み込み
   - エラーハンドリング

✅ pasori-ui.js
   - ブラウザUI コンポーネント
   - リアルタイムステータス表示

✅ main.js & preload.js
   - IPC ハンドラー (pasori:initialize, pasori:readCard, pasori:stop)
   - window.electron.pasori API 公開

✅ test-pasori.js
   - API 動作確認 (全テスト成功)
```

#### 対応カード
```
✅ Suica / Pasmo / nanaco / WAON
✅ 住民基本台帳カード
✅ その他FeliCa対応カード
```

#### 本番対応状況
```
⚠️ 未完了: Visual Studio Build Tools インストール
⚠️ 未完了: pcsclite ネイティブモジュール ビルド
✅ 完了: エラーハンドリング（オプション依存化）
✅ 完了: ドキュメント (PASORI_GUIDE.md, PASORI_IMPLEMENTATION.md)
```

---

## 🏗️ アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│           Firebase Realtime Database (クラウド)             │
│  employees | shifts | attendance | settings | auth          │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────┼───────────┐
         │           │           │
    ┌────▼─────┐ ┌──▼─────┐ ┌──▼──────┐
    │ Web浏览  │ │ Mobile │ │ Electron│
    │ Browser  │ │(iOS/Andrd)│        │
    └──────────┘ └────────┘ └────┬───┘
                               │
                    ┌──────────▼────────┐
                    │ ローカルHTTPサーバー│
                    │ (http://localhost:3000)
                    │ - kintai.html      │
                    │ - employee.html    │
                    │ - pasori-ui.js     │
                    │ - pasori-reader.js │
                    └────────────────────┘
                               │
                    ┌──────────▼────────┐
                    │  パソリ (USB接続)  │
                    │  RC-S380          │
                    │  FeliCa カード読込│
                    └────────────────────┘
```

---

## ✅ 実装済み機能一覧

| 機能 | Webブラウザ | スマホ | Electron版 | PaSoRi統合 |
|------|-----------|--------|----------|----------|
| 勤怠管理画面 | ✅ | ✅ | ✅ | - |
| 従業員画面 | ✅ | ✅ | ✅ | - |
| Firebase同期 | ✅ | ✅ | ✅(要改善) | - |
| シフト提出 | ✅ | ✅ | ✅ | - |
| 打刻記録 | ✅ | ✅ | ✅ | ⏳準備中 |
| **IC カード読込** | ❌ | ❌ | ✅(開発版) | ✅ |
| **自動打刻** | ❌ | ❌ | ⏳準備中 | ⏳準備中 |
| セッション管理 | ✅ | ✅ | ⚠️改善中 | - |
| オフライン対応 | ✅ | ✅ | ✅ | - |
| SSL/TLS暗号化 | ✅ | ✅ | ✅ | - |

---

## 🚀 次のマイルストーン

### 【Phase 1】Electron版の同期改善 (高優先度)

#### 目標
Electron版アプリで複数ウィンドウ間のリアルタイム同期を完全に実装

#### 実装内容
```javascript
// main.js 修正内容
1. メインプロセスでFirebaseリスナーを設定
   - employees, shifts, attendanceを監視
   - 更新時に全レンダープロセスに通知

2. IPC通信拡張
   - firebase:onUpdate イベントを追加
   - ipcMain.handle('firebase:getData')

3. セッション同期
   - レンダープロセスで共通のセッションストレージ使用
   - BroadcastChannel API活用
```

#### 実装ファイル
- `kintai-electron/main-firebase.js` (新規)
- `kintai-electron/firebase-service.js` (新規)

#### 期間: 2-3日

---

### 【Phase 2】PaSoRi統合の本番化 (中優先度)

#### 目標
打刻用PC でPaSoRi経由のIC打刻を実装・本番運用開始

#### 実装内容
```javascript
// 1. employee.html にPaSoRi UI を統合
<script src="pasori-ui.js"></script>
<div id="pasori-container">
  <!-- UI自動生成 -->
</div>

// 2. IC打刻時のFirebase保存処理
window.electron.pasori.onCardRead(async (event, cardData) => {
    const record = {
        cardId: cardData.id,
        timestamp: new Date().toISOString(),
        type: 'attendance', // または 'departure'
        method: 'pasori'
    };
    await firebase.database().ref(`attendance/${uniqueId}`).set(record);
});

// 3. ビルド & 本番デプロイ
npm run build:win
```

#### 前提条件
- ✅ Visual Studio Build Tools インストール済み
- ✅ pcsclite がビルド可能

#### 実装ファイル
- `kintai-electron/employee.html` (修正)
- `kintai-electron/pasori-attendance.js` (新規)

#### 期間: 1-2日

---

### 【Phase 3】全媒体リアルタイム同期の検証 (中優先度)

#### 目標
3つのシーン (管理画面, 従業員画面, IC打刻PC) で完全な双方向同期を達成

#### テストシナリオ
```
1. Webで新しいシフトを登録
   → Electron版・スマホで即座に表示される

2. スマホで打刻ボタンをクリック
   → 管理画面に記録が表示される (< 1秒)

3. 打刻用PCで IC カードをかざす
   → すべてのデバイスで打刻時刻が反映される

4. 管理画面で打刻記録を修正
   → 従業員画面・Electron版で反映される
```

#### テスト環境
- Windows PC (打刻用) × 1台 (PaSoRi接続)
- Windows PC (管理) × 1台
- iPhone または Android (従業員) × 1台

#### 期間: 1日

---

## 📋 実装チェックリスト

### 現在進行中タスク

#### 【緊急】Electron版の同期問題解決
- [ ] firebase.js をメインプロセスに実装
- [ ] firebaseリアルタイムリスナーを設定
- [ ] IPC通信で更新を通知
- [ ] 複数ウィンドウ間の同期テスト
- [ ] localStorageキャッシュの一貫性確認

#### 【重要】PaSoRi統合の完成
- [ ] Visual Studio Build Tools インストール確認
- [ ] `npm install pcsclite` でビルド成功確認
- [ ] employee.html に pasori-ui.js を統合
- [ ] IC打刻時の Firebase 保存処理を実装
- [ ] 打刻用PCでの動作テスト

#### 【重要】本番環境テスト
- [ ] 3つのシーン (Web, Mobile, Electron) で同時動作確認
- [ ] Firebase Hosting のセキュリティルール確認
- [ ] SSL/TLS通信確認
- [ ] インターネット接続状況での同期確認

---

## 🔐 本番前チェックリスト

### Firebase セキュリティ
- [ ] セキュリティルール設定確認
- [ ] 認証機能実装 (OAuth or カスタム認証)
- [ ] データベースのアクセス制御確認

### Electron版アプリ
- [ ] Code signing 設定 (Windows用)
- [ ] インストーラー作成
- [ ] アップデート機構実装
- [ ] クラッシュレポート機構実装

### PaSoRi
- [ ] パソリドライバのサポート対象確認
- [ ] エラーハンドリング包括的テスト
- [ ] 複数ユーザー環境でのテスト
- [ ] セキュリティ (カード情報の暗号化)

### 運用体制
- [ ] ユーザーマニュアル作成
- [ ] トラブルシューティングガイド作成
- [ ] サポート体制構築
- [ ] 定期メンテナンス計画策定

---

## 📚 関連ドキュメント

| ドキュメント | 用途 | 対象者 |
|-----------|------|--------|
| FIREBASE_HOSTING.md | Firebase Hosting デプロイガイド | 管理者 |
| DEPLOY_GUIDE.md | デプロイ実行手順 | 管理者 |
| MOBILE_ACCESS.md | スマホアクセスガイド | ユーザー |
| DISTRIBUTION.md | 社内配布用案内文 | HR |
| PASORI_GUIDE.md | PaSoRi セットアップガイド | 管理者・開発者 |
| PASORI_IMPLEMENTATION.md | PaSoRi 実装詳細 | 開発者 |

---

## 🎯 目標タイムライン

```
【2024年3月】
✅ 3月12日 - PaSoRi統合開発版完成
⏳ 3月13-14日 - Electron版の同期改善
⏳ 3月15日 - PaSoRi本番化・IC打刻実装
⏳ 3月16日 - 全媒体同期テスト

【2024年3月下旬】
⏳ 本番環境デプロイ準備
⏳ ユーザーテスト
⏳ フィードバック反映

【2024年4月以降】
⏳ 本番運用開始
⏳ 継続的改善
```

---

## 💡 主な技術スタック

```
【フロントエンド】
- HTML5 / CSS3 / JavaScript (Vanilla)
- Firebase SDK 9.23.0 (compat)
- Electron 41.0.0

【バックエンド】
- Firebase Realtime Database
- Firebase Hosting

【ハードウェア統合】
- PaSoRi (RC-S380)
- pcsclite (PC/SC Lite)
- FeliCa カード

【開発環境】
- Node.js 24.x
- Electron Builder
- Visual Studio Build Tools (C++)
```

---

## 🤝 コミュニケーション

### GitHub Commits (最新10件)
```
a011435 docs: PaSoRi 実装ステータスレポート追加
58bfb57 fix: pcsclite を optionalDependencies に移動・テストスクリプト追加
48f1621 feat: PaSoRi (Windows) 統合実装 - IC カード読み込み機能追加
8269028 管理者・従業員向けアクセスガイドと管理者ポータルページを追加
2a5297c Firebase Hosting デプロイガイドと .firebaserc 追加
```

### 現在のリポジトリ
- **URL**: https://github.com/mame2165-ai/kintai-main
- **Branch**: main (本番管理)
- **Remote**: origin (GitHub)

---

## 📞 質問・確認事項

1. **Electron版の同期改善** - メインプロセスでの Firebase リスナー実装で良いか確認
2. **IC打刻の確認** - PaSoRi読み込み時に自動打刻を希望するか、確認ダイアログを出すか
3. **セキュリティ** - カード ID をどの程度保護する必要があるか確認
4. **本番テスト** - テスト環境の詳細（ユーザー数、デバイス数）を確認
5. **運用体制** - サポート体制をどのようにするか確認

---

## 🆕 給与明細データ管理機能（2026-04-02 追加）

**ステータス**: ✅ **実装完了 - テスト中**

### 背景
Firebase Storage のCORSエラーにより PDF アップロード機能が動作不可のため、管理者が直接給与明細データを入力・管理できる機能に移行。

### 実装内容

#### 1️⃣ 管理画面（kintai.html）- 明細編集タブ
- **UI**: 「✏️ 明細編集」タブを追加
- **従業員選択**: Firebase から従業員リストを動的読み込み
- **年月選択**: 対象月を指定
- **データ入力フォーム**:
  - 🗓 勤怠データ: 出勤日数（平日）、残業時間（平日）、有休取得日数
  - 💰 支給: 基本給、役職手当、交通費、資格手当、家族手当、時間外手当、深夜割増、休日出勤手当、その他支給
  - 🏦 控除: 欠勤控除、健康保険料、介護保険料、厚生年金保険料、雇用保険料、所得税、住民税、その他控除

#### 2️⃣ PDF 自動抽出機能
- **PDF.js** を使用したテキスト抽出
- **対応フォーマット**: 固定レイアウト給与明細書
- **抽出項目**:
  - 勤怠データ（3項目のみ）
  - すべての支給・控除金額
  - 年月の自動認識（令和/西暦形式対応）
- **ボタン**: 「📄 PDFから読み込む」で自動抽出 → フォーム自動入力

#### 3️⃣ データ管理機能
```javascript
// Firebase DB パス: kintai/salary_records/{empName}/{YYYY-MM}
{
  // 勤怠
  workDays: 20,                    // 出勤日数（平日）
  overtimeHours: 10.5,             // 残業時間（平日）
  paidLeave: 2,                    // 有休取得日数

  // 支給
  baseSalary: 250000,              // 基本給
  positionAllowance: 10000,        // 役職手当
  transportAllowance: 7820,        // 交通費
  skillAllowance: 3045,            // 資格手当
  familyAllowance: 0,              // 家族手当
  overtimePay: 12500,              // 時間外手当
  lateNightPay: 0,                 // 深夜割増
  holidayPay: 0,                   // 休日出勤手当
  otherIncome: 0,                  // その他支給

  // 控除
  absenceDeduction: 0,             // 欠勤控除
  healthInsurance: 12857,          // 健康保険料
  nursingInsurance: 0,             // 介護保険料
  welfarePension: 23790,           // 厚生年金保険料
  employmentInsurance: 1490,       // 雇用保険料
  incomeTax: 5250,                 // 所得税
  residentTax: 10500,              // 住民税
  otherDeduction: 0,               // その他控除

  memo: '3月の給与',               // 備考
  savedAt: '2026-04-02T...'        // 保存日時
}
```

#### 4️⃣ 従業員画面（employee.html）への反映
- **給与明細タブ**: salary_records からデータ自動取得
- **優先順位**:
  1. 管理者が入力した salary_records データがあれば → そのデータで表示
  2. なければ → 勤怠から自動計算で表示（フォールバック）
- **勤怠サマリー**: 出勤日数、残業時間、有休が管理者入力値で更新
- **給与額**: 管理者入力値で計算

### 技術仕様
- **ライブラリ**: pdfjs-dist (PDF.js 3.11.174)
- **非同期処理**: async/await で統一
- **状態管理**:
  - `initSalaryEditTab()` - 従業員リスト読み込み
  - `loadAutoCalcToEdit()` - 自動計算結果をフォーム入力
  - `loadSalaryRecord()` - 保存済みデータを読み込み
  - `saveSalaryRecord()` - データ保存 (fbStore.set)
  - `deleteSalaryRecordConfirm()` - データ削除
  - `listSavedSalaryRecords()` - 保存済み月一覧表示
  - `uploadAndExtractPDF()` - PDF アップロード・抽出
  - `extractSalaryDataFromPDF()` - テキスト抽出・パース

### 修正履歴（2026-04-02）
1. ✅ **83f32c0** - 給与明細の直接編集機能を実装
2. ✅ **7993c3a** - PDF給与明細からの自動抽出機能を実装
3. ✅ **18435c4** - fbStore メソッド修正 (put → set, delete → remove)
4. ✅ **32cc493** - initSalaryEditTab で従業員リスト非同期ロード
5. ✅ **e7175ad** - 給与記録に勤怠データを追加・employee.html で反映
6. ✅ **212c2f3** - currentUser.id → currentUser.name に統一
7. ✅ **ba8db13** - async/await で処理を統一
8. ✅ **caa9563** - att を const → let に変更
9. ✅ **e03af46** - switchSalaryAdminTab を async に変更

### 現在の状態（2026-04-02 18:00）
- ✅ 実装完了
- ⏳ テスト中（保存済み一覧の表示確認待ち）
- 🔄 次起動時: 従業員リストがすぐに表示されるか確認予定

### 次のステップ
1. ✅ 管理画面で給与データ保存・削除機能
2. ✅ 従業員画面での給与明細表示
3. ⏳ 本番環境でのテスト実施
4. ⏳ ユーザー受け入れテスト

---

**最終更新**: 2026-04-02
**作成者**: Claude Code
**バージョン**: 2.1 (給与明細管理機能追加版)
**ステータス**: テスト中 → 本番展開準備中
