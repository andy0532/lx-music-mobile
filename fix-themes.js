const fs = require('fs');
const path = require('path');
const BASE = '/workspaces/lx-music-mobile';

// ============================================================
// 1. 只往 createThemes.js 添加新主题，不删除任何东西
// ============================================================
console.log('1. 添加新玻璃主题到 createThemes.js...');
let ctjs = fs.readFileSync(path.join(BASE, 'src/theme/themes/createThemes.js'), 'utf-8');

// Check if new themes already exist
if (ctjs.includes("id: 'glass_amber'")) {
  console.log('   glass_amber already exists, skipping');
} else {
  const newThemes = `,
  {
    id: 'glass_amber',
    name: '\u7425\u73C0\u8F89\u5149',
    isDark: true,
    config: {
      primary: 'rgb(255, 175, 50)',
      font: 'rgb(240, 225, 200)',
      'c-app-background': 'rgba(26, 14, 2, 0)',
      'c-main-background': 'rgba(40, 25, 8, 0.40)',
      'c-content-background': 'rgba(50, 32, 10, 0.40)',
      'c-border-background': 'rgba(255, 175, 50, 0.12)',
      'bg-image': '',
      'bg-image-position': 'center',
      'bg-image-size': 'cover',
      'c-badge-primary': 'rgb(255, 175, 50)',
      'c-badge-secondary': 'rgb(255, 120, 50)',
      'c-badge-tertiary': 'rgb(255, 220, 100)',
    },
  },
  {
    id: 'glass_emerald',
    name: '\u7FE1\u7FE0\u8584\u96FE',
    isDark: true,
    config: {
      primary: 'rgb(16, 185, 129)',
      font: 'rgb(200, 240, 220)',
      'c-app-background': 'rgba(2, 20, 10, 0)',
      'c-main-background': 'rgba(5, 30, 20, 0.40)',
      'c-content-background': 'rgba(8, 38, 26, 0.40)',
      'c-border-background': 'rgba(16, 185, 129, 0.12)',
      'bg-image': '',
      'bg-image-position': 'center',
      'bg-image-size': 'cover',
      'c-badge-primary': 'rgb(16, 185, 129)',
      'c-badge-secondary': 'rgb(50, 210, 160)',
      'c-badge-tertiary': 'rgb(110, 231, 183)',
    },
  },
  {
    id: 'glass_crimson',
    name: '\u7EEF\u7EA2\u5E37\u5E55',
    isDark: true,
    config: {
      primary: 'rgb(220, 60, 60)',
      font: 'rgb(240, 200, 200)',
      'c-app-background': 'rgba(25, 5, 5, 0)',
      'c-main-background': 'rgba(35, 10, 10, 0.40)',
      'c-content-background': 'rgba(45, 14, 14, 0.40)',
      'c-border-background': 'rgba(220, 60, 60, 0.12)',
      'bg-image': '',
      'bg-image-position': 'center',
      'bg-image-size': 'cover',
      'c-badge-primary': 'rgb(220, 60, 60)',
      'c-badge-secondary': 'rgb(255, 120, 80)',
      'c-badge-tertiary': 'rgb(255, 150, 150)',
    },
  },
  {
    id: 'glass_violet',
    name: '\u7D2B\u7F57\u5170\u661F\u4E91',
    isDark: true,
    config: {
      primary: 'rgb(160, 90, 255)',
      font: 'rgb(225, 210, 255)',
      'c-app-background': 'rgba(15, 5, 25, 0)',
      'c-main-background': 'rgba(22, 10, 35, 0.40)',
      'c-content-background': 'rgba(28, 14, 45, 0.40)',
      'c-border-background': 'rgba(160, 90, 255, 0.12)',
      'bg-image': '',
      'bg-image-position': 'center',
      'bg-image-size': 'cover',
      'c-badge-primary': 'rgb(160, 90, 255)',
      'c-badge-secondary': 'rgb(200, 120, 255)',
      'c-badge-tertiary': 'rgb(120, 180, 255)',
    },
  },
  {
    id: 'glass_arctic',
    name: '\u6781\u5730\u971C\u534E',
    isDark: true,
    config: {
      primary: 'rgb(80, 210, 255)',
      font: 'rgb(210, 235, 255)',
      'c-app-background': 'rgba(3, 12, 22, 0)',
      'c-main-background': 'rgba(5, 18, 30, 0.40)',
      'c-content-background': 'rgba(8, 22, 38, 0.40)',
      'c-border-background': 'rgba(80, 210, 255, 0.12)',
      'bg-image': '',
      'bg-image-position': 'center',
      'bg-image-size': 'cover',
      'c-badge-primary': 'rgb(80, 210, 255)',
      'c-badge-secondary': 'rgb(140, 230, 255)',
      'c-badge-tertiary': 'rgb(180, 240, 255)',
    },
  }`;

  // Find the last }; before the closing ]; of the defaultThemes array
  // Insert new themes right before the ];
  const lastBracket = ctjs.lastIndexOf('];');
  ctjs = ctjs.substring(0, lastBracket) + newThemes + '\n' + ctjs.substring(lastBracket);
  fs.writeFileSync(path.join(BASE, 'src/theme/themes/createThemes.js'), ctjs);
  console.log('   createThemes.js updated');
}

// ============================================================
// 2. 运行 createThemes.js 重新生成 themes.ts
// ============================================================
console.log('2. 重新生成 themes.ts...');
require('child_process').execSync('node src/theme/themes/createThemes.js', { cwd: BASE, stdio: 'inherit' });
console.log('   themes.ts done');

// ============================================================
// 3. 更新 i18n 翻译文件
// ============================================================
console.log('3. 更新 i18n 翻译...');
const newThemeKeys = {
  'theme_glass_amber': { 'zh-cn': '\u7425\u73C0\u8F89\u5149', 'en-us': 'Amber Glow', 'zh-tw': '\u7425\u73C0\u8F1D\u5149' },
  'theme_glass_emerald': { 'zh-cn': '\u7FE1\u7FE0\u8584\u96FE', 'en-us': 'Emerald Mist', 'zh-tw': '\u7FE1\u7FE0\u8584\u9727' },
  'theme_glass_crimson': { 'zh-cn': '\u7EEF\u7EA2\u5E37\u5E55', 'en-us': 'Crimson Veil', 'zh-tw': '\u7DBF\u7D05\u5E37\u5E55' },
  'theme_glass_violet': { 'zh-cn': '\u7D2B\u7F57\u5170\u661F\u4E91', 'en-us': 'Violet Nebula', 'zh-tw': '\u7D2B\u7F85\u862D\u661F\u96F2' },
  'theme_glass_arctic': { 'zh-cn': '\u6781\u5730\u971C\u534E', 'en-us': 'Arctic Frost', 'zh-tw': '\u6975\u5730\u971C\u83EF' },
};

for (const [lang] of [['zh-cn'], ['en-us'], ['zh-tw']]) {
  const fpath = path.join(BASE, 'src/lang', lang + '.json');
  const json = JSON.parse(fs.readFileSync(fpath, 'utf-8'));
  for (const [key, translations] of Object.entries(newThemeKeys)) {
    json[key] = translations[lang];
  }
  fs.writeFileSync(fpath, JSON.stringify(json, null, 2) + '\n');
  console.log('   ' + lang + '.json done');
}

console.log('\nAll fixes applied!');
