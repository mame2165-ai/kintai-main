# Visual Studio Build Tools セットアップガイド

**目的**: pcsclite のネイティブモジュールをビルド可能にする

---

## 📋 前提条件確認

```bash
# Node.js のバージョン確認
node --version
# 推奨: v14 以上 (現在: v24.14.0 ✅)

# npm のバージョン確認
npm --version
# 推奨: v6 以上

# Python のバージョン確認
python --version
# 推奨: Python 3.x (現在あるか確認)
```

---

## 🚀 インストール手順

### 方法1: Visual Studio Community（推奨）

**利点**: 無料、フル機能、将来のアップデート対応

#### ステップ1: ダウンロード
1. 以下のURLにアクセス:
   https://visualstudio.microsoft.com/ja/vs/community/

2. 「無料ダウンロード」をクリック

#### ステップ2: インストーラー実行
```
Visual Studio Community 2022 Installer を実行
```

#### ステップ3: ワークロード選択

**重要**: 以下のワークロードを選択してください

```
☑ C++ によるデスクトップ開発
  - MSVC v143 以上のビルドツール
  - Windows 10/11 SDK
  - CMake ツール for Windows
```

#### ステップ4: インストール
- インストール先: デフォルト推奨
- インストール時間: 10-30分

#### ステップ5: 再起動
インストール完了後、PCを再起動

---

### 方法2: Build Tools for Visual Studio（軽量版）

**利点**: インストールサイズが小さい (3GB vs 30GB)

#### ステップ1: ダウンロード
https://visualstudio.microsoft.com/ja/visual-cpp-build-tools/

#### ステップ2: インストーラー実行
```
vs_BuildTools.exe を実行
```

#### ステップ3: ワークロード選択
```
☑ C++ ビルドツール
  - MSVC v143 コンパイラ
  - Windows SDK
```

#### ステップ4: インストール

---

## ✅ インストール確認

### 確認コマンド

```bash
# C++ コンパイラが利用可能か確認
where cl.exe

# 出力例 (成功):
# C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\14.3x.xxxxx\bin\Hostx64\x64\cl.exe
```

### Windows 環境変数の確認

インストール後、以下の環境変数が自動的に設定されます:

```
VCINSTALLDIR: C:\Program Files\Microsoft Visual Studio\2022\Community\VC\
PATH: (C++ ツールのパスが追加)
```

**確認方法:**
```bash
echo %VCINSTALLDIR%
# または
Get-ChildItem env:VCINSTALLDIR  # PowerShell
```

---

## 🔧 pcsclite ビルド

### ステップ1: 前提パッケージ確認

```bash
# Python 3.x をインストール（必須）
python --version

# pip を使って必要なパッケージをインストール
pip install --upgrade pip setuptools
```

### ステップ2: pcsclite をインストール

```bash
cd kintai-electron

# npm cache をクリア（トラブル時）
npm cache clean --force

# pcsclite をインストール
npm install pcsclite
```

### ステップ3: ビルド確認

```bash
# node-gyp で ビルドが実行される
# 出力:
# gyp info it worked if it ends with ok
# ...
# gyp ok
```

**成功例:**
```
> pcsclite@1.0.1 install
> node-gyp rebuild

gyp info it worked if it ends with ok
gyp info using node-gyp@11.5.0
gyp info using node@24.14.0 | win32 | x64
gyp info find Python using Python version 3.14.3
gyp info find VS msvs_version not set from command line or npm config
gyp info find VS VCINSTALLDIR set from command line or npm config
...
gyp info ok
```

### ステップ4: インストール検証

```bash
# 以下のコマンドで pcsclite が読み込めるか確認
node -e "console.log(require('pcsclite'))"

# 出力例 (成功):
# [Function: PCSCLite]
```

---

## 🐛 トラブルシューティング

### エラー1: "Could not find any Visual Studio installation"

**原因**: Visual Studio Build Tools がインストールされていない

**解決策**:
1. Visual Studio Community をインストール
2. または Build Tools for Visual Studio をインストール
3. C++ ワークロードを確認してインストール

### エラー2: "Python is not installed"

**原因**: Python がインストールされていない、または PATH に追加されていない

**解決策**:
```bash
# Python をダウンロード
https://www.python.org/downloads/

# インストール時に "Add Python to PATH" にチェック ✓

# インストール後、確認
python --version
```

### エラー3: "node-gyp configure error"

**原因**: MSVC コンパイラが見つからない

**解決策**:
```bash
# PCを再起動（環境変数の再読み込み）
# または

# npm config を設定
npm config set msvs_version 2022
npm install pcsclite
```

### エラー4: "LNK1104: cannot open file 'winscard.lib'"

**原因**: Windows SDK が不完全

**解決策**:
1. Visual Studio インストーラーを再実行
2. "修復" を選択
3. "C++ ビルドツール" を確認して再インストール

---

## 📝 参考情報

### システム要件
```
OS:        Windows 7 以上 (推奨: Windows 10/11)
メモリ:    4GB 以上 (推奨: 8GB)
ディスク:  3-30GB (Community: 30GB, Build Tools: 3GB)
```

### インストール時間
```
Build Tools:  10-15分
Community:    20-30分
```

### インストール後の確認リスト
```
☐ Visual Studio / Build Tools がインストールされている
☐ C++ ワークロードがインストールされている
☐ Windows SDK がインストールされている
☐ Python 3.x がインストールされている
☐ cl.exe が PATH に追加されている
☐ npm install pcsclite が成功している
```

---

## ✨ 次のステップ

インストール完了後、以下のコマンドを実行:

```bash
cd kintai-electron

# pcsclite インストール
npm install pcsclite

# テストスクリプト実行
node test-pasori.js

# Electron アプリ起動
npm start
```

---

**問題が発生した場合**:
1. このガイドの「トラブルシューティング」を確認
2. GitHub Issues に報告
3. PASORI_GUIDE.md の関連セクションを参照

---

**作成日**: 2024-03-12
**対象**: Windows 10/11
**関連ドキュメント**: PASORI_GUIDE.md, PASORI_IMPLEMENTATION.md
