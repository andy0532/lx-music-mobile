const fs=require('fs'),ROOT='/workspaces/lx-music-mobile'
function patch(f,s,r,d){const p=ROOT+'/'+f;let c=fs.readFileSync(p,'utf-8');if(c.includes(r)){console.log('✅ '+f+' 已修改 ('+d+')');return}if(!c.includes(s)){console.log('❌ '+f+' 未匹配 ('+d+')');console.log('  搜索: '+s.substring(0,100));return}fs.writeFileSync(p,c.replace(s,r),'utf-8');console.log('✅ '+f+' 修改成功 ('+d+')')}

// 1. Aside.tsx - toPath改为目录(不带扩展名), 用file.data获取实际路径
patch('src/screens/Home/Horizontal/Aside.tsx',
  "const WALLPAPER_FILE = privateStorageDirectoryPath + '/car_wallpaper.jpg'",
  "const WALLPAPER_DIR = privateStorageDirectoryPath + '/car_wallpaper'",
  '壁纸目录改为不带扩展名');

patch('src/screens/Home/Horizontal/Aside.tsx',
  "    void selectFile({\n      extTypes: ['jpg', 'jpeg', 'png', 'webp'],\n      toPath: WALLPAPER_FILE,\n    }).then((file) => {\n      if (!file || isUnmounted.current) return\n      // toPath模式：文件实际路径在 file.data 中\n      const filePath = file.data || file.path\n      const uri = filePath.startsWith('file://') ? filePath : 'file://' + filePath\n      setCarWallpaper(uri)\n    }).catch(() => {\n      // 用户取消选择，忽略\n    })",
  "    void selectFile({\n      extTypes: ['jpg', 'jpeg', 'png', 'webp'],\n      toPath: WALLPAPER_DIR,\n    }).then((file) => {\n      if (!file || isUnmounted.current) return\n      // toPath模式：file.data 是实际文件路径(toPath + '/' + 原始文件名)\n      if (file.data) {\n        const uri = file.data.startsWith('file://') ? file.data : 'file://' + file.data\n        setCarWallpaper(uri)\n      }\n    }).catch(() => {\n      // 用户取消选择，忽略\n    })",
  '修复壁纸选择逻辑');

// 2. 清除壁纸时也要改
patch('src/screens/Home/Horizontal/Aside.tsx',
  "            onPress: () => { setCarWallpaper(null); void unlink(WALLPAPER_FILE).catch(() => {}) }",
  "            onPress: () => {\n              setCarWallpaper(null)\n              if (carWallpaper) void unlink(carWallpaper.replace('file://', '')).catch(() => {})\n            }",
  '修复清除壁纸逻辑');

console.log('\n修复完成!')
