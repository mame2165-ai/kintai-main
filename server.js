#!/usr/bin/env node
/**
 * シンプルな HTTP サーバー
 * 使い方: node server.js
 *
 * ローカル: http://localhost:3000/
 * リモート: http://<このPC のIPアドレス>:3000/
 */

const http = require('http');
const path = require('path');
const fs = require('fs');
const os = require('os');

const PORT = 3000;

// MIME タイプ定義
const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// HTTP サーバー作成
const server = http.createServer((req, res) => {
    // パスの正規化
    let filePath = path.join(__dirname, req.url === '/' ? 'kintai.html' : req.url);

    // ディレクトリトラバーサル攻撃対策
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>403 Forbidden</h1>', 'utf-8');
        return;
    }

    const ext = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // ファイル読み込み
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>404 Not Found</h1><p>' + req.url + '</p>', 'utf-8');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end('<h1>500 Server Error</h1>', 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// サーバー起動
server.listen(PORT, '0.0.0.0', () => {
    const interfaces = os.networkInterfaces();
    let ipAddress = 'localhost';

    // ローカルIPアドレスを取得
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // IPv4 で内部アドレスではないもの
            if (iface.family === 'IPv4' && !iface.internal) {
                ipAddress = iface.address;
                break;
            }
        }
        if (ipAddress !== 'localhost') break;
    }

    console.log('\n' + '='.repeat(50));
    console.log('🚀 勤怠管理システムサーバー起動');
    console.log('='.repeat(50));
    console.log(`\n📍 ローカルアクセス:`);
    console.log(`   http://localhost:${PORT}/`);
    console.log(`\n🌐 リモートアクセス:`);
    console.log(`   http://${ipAddress}:${PORT}/`);
    console.log(`\n📋 管理画面:`);
    console.log(`   http://${ipAddress}:${PORT}/kintai.html`);
    console.log(`\n👤 従業員画面:`);
    console.log(`   http://${ipAddress}:${PORT}/employee.html`);
    console.log('\n💡 スマホからアクセスする場合：');
    console.log(`   http://${ipAddress}:${PORT}/employee.html`);
    console.log('\n🛑 終了: Ctrl+C を押してください');
    console.log('='.repeat(50) + '\n');
});

// エラーハンドリング
server.on('error', (err) => {
    console.error('サーバーエラー:', err);
    process.exit(1);
});

// プロセス終了時の処理
process.on('SIGINT', () => {
    console.log('\n\n✅ サーバーを停止しました');
    server.close();
    process.exit(0);
});
