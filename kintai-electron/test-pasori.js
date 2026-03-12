/**
 * PaSoRi API テストスクリプト
 * 実際のアプリ起動なしに、PaSoRi 統合の動作を確認
 */

console.log('🔍 PaSoRi API テスト開始\n');

// ============================================
// テスト1: モジュールの読み込み
// ============================================
console.log('📦 テスト1: モジュール読み込み');
try {
    const PaSoRiReader = require('./pasori-reader.js');
    console.log('✅ pasori-reader.js: OK');
} catch (error) {
    console.error('❌ pasori-reader.js 読み込み失敗:', error.message);
}

try {
    // pasori-ui.js は ブラウザ環境専用なので、Node.js 環境では動作しません
    console.log('⚠️  pasori-ui.js: ブラウザ環境専用（Node.js では読み込み不可）');
} catch (error) {
    console.error('❌ pasori-ui.js 読み込み失敗:', error.message);
}

// ============================================
// テスト2: main.js IPC ハンドラーの確認
// ============================================
console.log('\n📡 テスト2: IPC ハンドラー確認');
try {
    const fs = require('fs');
    const mainContent = fs.readFileSync('./main.js', 'utf-8');

    const checks = [
        { name: 'pasori:initialize', found: mainContent.includes("handle('pasori:initialize'") },
        { name: 'pasori:readCard', found: mainContent.includes("handle('pasori:readCard'") },
        { name: 'pasori:stop', found: mainContent.includes("handle('pasori:stop'") },
        { name: 'pasori IPC イベント', found: mainContent.includes('pasori:cardRead') }
    ];

    checks.forEach(check => {
        console.log(`${check.found ? '✅' : '❌'} ${check.name}`);
    });
} catch (error) {
    console.error('❌ main.js 確認失敗:', error.message);
}

// ============================================
// テスト3: preload.js API 確認
// ============================================
console.log('\n🔌 テスト3: Preload API 確認');
try {
    const fs = require('fs');
    const preloadContent = fs.readFileSync('./preload.js', 'utf-8');

    const apiMethods = [
        { name: 'initialize', pattern: "initialize: \\(\\)" },
        { name: 'readCard', pattern: "readCard: \\(\\)" },
        { name: 'stop', pattern: "stop: \\(\\)" },
        { name: 'onCardRead', pattern: "onCardRead:" },
        { name: 'onCardDetected', pattern: "onCardDetected:" },
        { name: 'onReaderAdded', pattern: "onReaderAdded:" },
        { name: 'onReaderRemoved', pattern: "onReaderRemoved:" },
        { name: 'onError', pattern: "onError:" }
    ];

    const pasoriBlock = preloadContent.match(/pasori:\s*\{[\s\S]*?\}/);
    if (pasoriBlock) {
        apiMethods.forEach(method => {
            const found = pasoriBlock[0].includes(method.name);
            console.log(`${found ? '✅' : '❌'} window.electron.pasori.${method.name}`);
        });
    } else {
        console.log('❌ pasori ブロックが見つかりません');
    }
} catch (error) {
    console.error('❌ preload.js 確認失敗:', error.message);
}

// ============================================
// テスト4: PaSoRiReader クラスの検証
// ============================================
console.log('\n🧪 テスト4: PaSoRiReader クラス検証');
try {
    const PaSoRiReader = require('./pasori-reader.js');
    const reader = new PaSoRiReader();

    const methods = [
        'initialize',
        'readCard',
        'stop',
        'handleReaderStatus',
        'buildReadCommand',
        'parseCardData'
    ];

    methods.forEach(method => {
        const hasMethod = typeof reader[method] === 'function';
        console.log(`${hasMethod ? '✅' : '❌'} ${method}() メソッド`);
    });

    // コールバック確認
    console.log(`${typeof reader.onCardRead !== 'undefined' ? '✅' : '❌'} onCardRead コールバック`);
    console.log(`${typeof reader.onError !== 'undefined' ? '✅' : '❌'} onError コールバック`);
} catch (error) {
    console.error('❌ PaSoRiReader 検証失敗:', error.message);
}

// ============================================
// テスト5: package.json 依存確認
// ============================================
console.log('\n📋 テスト5: Package.json 確認');
try {
    const pkg = require('./package.json');
    console.log(`${pkg.optionalDependencies?.pcsclite ? '✅' : '❌'} pcsclite: optionalDependencies`);
    console.log(`✅ electron: v${pkg.devDependencies.electron}`);
    console.log(`✅ electron-builder: v${pkg.devDependencies['electron-builder']}`);
} catch (error) {
    console.error('❌ package.json 確認失敗:', error.message);
}

// ============================================
// テスト6: pcsclite インストール確認
// ============================================
console.log('\n🔧 テスト6: pcsclite インストール確認');
try {
    require('pcsclite');
    console.log('✅ pcsclite: インストール済み');
} catch (error) {
    console.log('⚠️  pcsclite: 未インストール');
    console.log('   インストール方法:');
    console.log('   1. Visual Studio Build Tools with C++ をインストール');
    console.log('   2. npm install pcsclite を実行');
    console.log('\n   または、以下のコマンドで npm install pcsclite を実行:');
    console.log('   npm install pcsclite --save-optional');
}

// ============================================
// サマリー
// ============================================
console.log('\n' + '='.repeat(50));
console.log('✅ テスト完了');
console.log('='.repeat(50));

console.log('\n📝 次のステップ:');
console.log('1. pcsclite をインストール: npm install pcsclite');
console.log('2. employee.html に pasori-ui.js を統合');
console.log('3. Electron アプリ起動: npm start');
console.log('4. パソリでカード読み込みテスト');

console.log('\n💡 トラブルシューティング:');
console.log('- pcsclite ビルドエラー → PASORI_GUIDE.md を参照');
console.log('- パソリ未検出 → Windows ドライバ確認');
console.log('\n');
