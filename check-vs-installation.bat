@echo off
echo ===== Visual Studio Build Tools インストール確認 =====
echo.

REM C++ コンパイラの確認
echo [1] C++ コンパイラの確認
where cl.exe
if %ERRORLEVEL% EQU 0 (
  echo ✅ C++ コンパイラが見つかりました
) else (
  echo ❌ C++ コンパイラが見つかりません
  echo 再起動後に再確認してください
)
echo.

REM MSVC バージョン確認
echo [2] MSVC バージョン確認
cl.exe 2>&1 | findstr /R "^[^P]"
echo.

REM Windows SDK 確認
echo [3] Windows SDK の確認
if exist "C:\Program Files (x86)\Windows Kits\10" (
  echo ✅ Windows 10 SDK がインストールされています
) else if exist "C:\Program Files (x86)\Windows Kits\11" (
  echo ✅ Windows 11 SDK がインストールされています
) else (
  echo ⚠️ Windows SDK が見つかりません
)
echo.

echo ===== 確認完了 =====
pause
