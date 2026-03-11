@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Firebase Hosting へのデプロイ
echo ========================================
echo.

REM ファイルをコピー
echo 📝 ファイルをコピー中...
copy /Y kintai.html public\kintai.html >nul 2>&1
if errorlevel 1 (
    echo ❌ kintai.html のコピーに失敗しました
    pause
    exit /b 1
)

copy /Y employee.html public\employee.html >nul 2>&1
if errorlevel 1 (
    echo ❌ employee.html のコピーに失敗しました
    pause
    exit /b 1
)

echo ✅ ファイルをコピーしました

echo.
echo 🚀 Firebase Hosting にデプロイ中...
echo （初回実行時は firebase login が必要な場合があります）
echo.

firebase deploy --only hosting

if errorlevel 1 (
    echo.
    echo ❌ デプロイに失敗しました
    echo 以下を確認してください：
    echo - firebase-cli がインストールされているか
    echo - firebase login でログインしているか
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ デプロイ完了！
echo ========================================
echo.
echo 📱 アクセスURL:
echo https://kintai-fee67.firebaseapp.com/
echo.
echo 🏠 管理画面:
echo https://kintai-fee67.firebaseapp.com/kintai.html
echo.
echo 👤 従業員ポータル:
echo https://kintai-fee67.firebaseapp.com/employee.html
echo.
pause
