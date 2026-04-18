const fs = require('fs');
const path = require('path');
const BASE = '/workspaces/lx-music-mobile';

// ============================================================
// 1. 修复壁纸持久化：Aside.tsx - 壁纸从缓存目录拷贝到持久目录
// ============================================================
console.log('1. 修复 Aside.tsx 壁纸持久化...');
const asideContent = `import { memo, useCallback, useRef } from 'react'
import { ScrollView, TouchableOpacity, View, Alert } from 'react-native'
import { useNavActiveId, useStatusbarHeight, useCarWallpaper } from '@/store/common/hook'
import { useTheme } from '@/store/theme/hook'
import { Icon } from '@/components/common/Icon'
import { confirmDialog, createStyle, exitApp as backHome, TEMP_FILE_PATH } from '@/utils/tools'
import { NAV_MENUS } from '@/config/constant'
import type { InitState } from '@/store/common/state'
import { exitApp, setNavActiveId, setCarWallpaper } from '@/core/common'
import { BorderWidths } from '@/theme'
import { useSettingValue } from '@/store/setting/hook'
import { getCarModeScale } from '@/utils/pixelRatio'
import { selectFile, readFile, writeFile, unlink, privateStorageDirectoryPath, mkdir } from '@/utils/fs'

const CAR_SCALE = getCarModeScale()
const NAV_WIDTH = Math.round(68 * CAR_SCALE)
const ICON_SIZE = Math.round(20 * CAR_SCALE)
const WALLPAPER_PERSIST_DIR = privateStorageDirectoryPath + '/car_wallpaper'

const styles = createStyle({
  container: { flexGrow: 0, borderRightWidth: BorderWidths.normal, paddingBottom: 10, width: NAV_WIDTH },
  header: { paddingTop: 15, paddingBottom: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  headerText: { textAlign: 'center', marginLeft: 16 },
  menus: { flex: 1 },
  list: { paddingBottom: 15 },
  menuItem: { flexDirection: 'row', paddingTop: 15, paddingBottom: 15, justifyContent: 'center', alignItems: 'center' },
  iconContent: { alignItems: 'center' },
  text: { paddingLeft: 15 },
})

const Header = () => {
  const theme = useTheme()
  const statusBarHeight = useStatusbarHeight()
  return (
    <View style={{ paddingTop: statusBarHeight }}>
      <View style={styles.header}>
        <Icon name="logo" color={theme['c-primary-dark-100-alpha-300']} size={Math.round(22 * CAR_SCALE)} />
      </View>
    </View>
  )
}

type IdType = InitState['navActiveId'] | 'nav_exit' | 'back_home'

const MenuItem = ({ id, icon, onPress }: { id: IdType; icon: string; onPress: (id: IdType) => void }) => {
  const activeId = useNavActiveId()
  const theme = useTheme()
  return activeId == id
    ? <View style={styles.menuItem}><View style={styles.iconContent}><Icon name={icon} size={ICON_SIZE} color={theme['c-primary-font-active']} /></View></View>
    : <TouchableOpacity style={styles.menuItem} onPress={() => { onPress(id) }}><View style={styles.iconContent}><Icon name={icon} size={ICON_SIZE} color={theme['c-font-label']} /></View></TouchableOpacity>
}

const WallpaperBtn = () => {
  const theme = useTheme()
  const carWallpaper = useCarWallpaper()
  const isUnmounted = useRef(false)

  const handleSelectWallpaper = useCallback(() => {
    void selectFile({
      extTypes: ['jpg', 'jpeg', 'png', 'webp'],
      toPath: TEMP_FILE_PATH,
    }).then(async (file) => {
      if (!file || isUnmounted.current) return
      if (file.data && typeof file.data === 'string' && file.data.startsWith('/')) {
        // Copy from cache (CacheDir) to persistent storage (DocumentDir)
        // CacheDir can be cleared by Android, DocumentDir persists across restarts
        await mkdir(WALLPAPER_PERSIST_DIR).catch(() => {})
        for (const old of ['wallpaper.jpg', 'wallpaper.jpeg', 'wallpaper.png', 'wallpaper.webp']) {
          await unlink(WALLPAPER_PERSIST_DIR + '/' + old).catch(() => {})
        }
        const ext = file.data.split('.').pop() || 'jpg'
        const persistPath = WALLPAPER_PERSIST_DIR + '/wallpaper.' + ext
        const base64Data = await readFile(file.data, 'base64')
        await writeFile(persistPath, base64Data, 'base64')
        await unlink(file.data).catch(() => {})
        setCarWallpaper('file://' + persistPath)
        return
      }
      // Fallback: base64 mode
      if (file.data && typeof file.data === 'string' && file.data.length > 200) {
        try {
          await mkdir(WALLPAPER_PERSIST_DIR)
          const persistPath = WALLPAPER_PERSIST_DIR + '/wallpaper.jpg'
          await writeFile(persistPath, file.data, 'base64')
          setCarWallpaper('file://' + persistPath)
        } catch (e) {
          console.warn('save wallpaper failed', e)
        }
      }
    }).catch(() => {})
  }, [])

  const handleLongPress = useCallback(() => {
    if (!carWallpaper) return
    Alert.alert('\u6E05\u9664\u58C1\u7EB8', '\u786E\u5B9A\u8981\u6E05\u9664\u5F53\u524D\u58C1\u7EB8\u5417\uFF1F', [
      { text: '\u53D6\u6D88', style: 'cancel' },
      { text: '\u786E\u5B9A', style: 'destructive', onPress: () => {
        setCarWallpaper(null)
        const filePath = carWallpaper.replace('file://', '')
        void unlink(filePath).catch(() => {})
        for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
          void unlink(WALLPAPER_PERSIST_DIR + '/wallpaper.' + ext).catch(() => {})
        }
      }},
    ])
  }, [carWallpaper])

  return (
    <TouchableOpacity style={styles.menuItem} onPress={handleSelectWallpaper} onLongPress={handleLongPress}>
      <View style={styles.iconContent}>
        <Icon name="slider" size={ICON_SIZE} color={carWallpaper ? theme['c-primary-font-active'] : theme['c-font-label']} />
      </View>
    </TouchableOpacity>
  )
}

export default memo(() => {
  const theme = useTheme()
  const showBackBtn = useSettingValue('common.showBackBtn')
  const showExitBtn = useSettingValue('common.showExitBtn')
  const handlePress = (id: IdType) => {
    switch (id) {
      case 'nav_exit':
        void confirmDialog({ message: global.i18n.t('exit_app_tip'), confirmButtonText: global.i18n.t('list_remove_tip_button') }).then(isExit => { if (!isExit) return; exitApp('Exit Btn') })
        return
      case 'back_home': backHome(); return
    }
    global.app_event.changeMenuVisible(false)
    setNavActiveId(id)
  }
  const isGlassTheme = theme.id.startsWith('glass_')
  const containerStyle = {
    ...styles.container,
    borderRightColor: theme['c-border-background'],
    ...(isGlassTheme ? { backgroundColor: 'transparent' } : {}),
  }
  return (
    <View style={containerStyle}>
      <Header />
      <ScrollView style={styles.menus}>
        <View style={styles.list}>
          {NAV_MENUS.map(menu => <MenuItem key={menu.id} id={menu.id} icon={menu.icon} onPress={handlePress} />)}
          <WallpaperBtn />
        </View>
      </ScrollView>
      {showBackBtn ? <MenuItem id="back_home" icon="home" onPress={handlePress} /> : null}
      {showExitBtn ? <MenuItem id="nav_exit" icon="exit2" onPress={handlePress} /> : null}
    </View>
  )
})
`;
fs.writeFileSync(path.join(BASE, 'src/screens/Home/Horizontal/Aside.tsx'), asideContent);
console.log('   Aside.tsx done');

// ============================================================
// 2. 更新 PageContent.tsx - 多主题玻璃效果 + 光晕/光束装饰
// ============================================================
console.log('2. 更新 PageContent.tsx 玻璃主题效果...');
const pageContentContent = `import { View } from 'react-native'
import { useTheme } from '@/store/theme/hook'
import ImageBackground from '@/components/common/ImageBackground'
import { useWindowSize } from '@/utils/hooks'
import { useMemo } from 'react'
import { scaleSizeAbsHR } from '@/utils/pixelRatio'
import { defaultHeaders } from './common/Image'
import SizeView from './SizeView'
import { useBgPic, useCarWallpaper } from '@/store/common/hook'

interface Props {
  children: React.ReactNode
}

const BLUR_RADIUS = Math.max(scaleSizeAbsHR(18), 10)

// Glass theme decorative colors: glow + 45deg beam
const GLASS_COLORS: Record<string, { bgBase: string; overlay1: string; overlay2: string; glow: string; glowInner: string; beam: string }> = {
  glass_cosmos: {
    bgBase: '#060A1E',
    overlay1: 'rgba(6, 10, 30, 0.18)',
    overlay2: 'rgba(6, 10, 30, 0.30)',
    glow: 'rgba(100, 160, 255, 0.10)',
    glowInner: 'rgba(80, 140, 255, 0.05)',
    beam: 'rgba(180, 200, 255, 0.06)',
  },
  glass_amber: {
    bgBase: '#1A0E02',
    overlay1: 'rgba(26, 14, 2, 0.18)',
    overlay2: 'rgba(26, 14, 2, 0.30)',
    glow: 'rgba(255, 175, 50, 0.12)',
    glowInner: 'rgba(255, 150, 30, 0.06)',
    beam: 'rgba(255, 220, 150, 0.07)',
  },
  glass_emerald: {
    bgBase: '#021408',
    overlay1: 'rgba(2, 20, 10, 0.18)',
    overlay2: 'rgba(2, 20, 10, 0.30)',
    glow: 'rgba(16, 185, 129, 0.12)',
    glowInner: 'rgba(10, 160, 110, 0.06)',
    beam: 'rgba(110, 231, 183, 0.07)',
  },
  glass_crimson: {
    bgBase: '#1A0505',
    overlay1: 'rgba(25, 5, 5, 0.18)',
    overlay2: 'rgba(25, 5, 5, 0.30)',
    glow: 'rgba(220, 60, 60, 0.12)',
    glowInner: 'rgba(200, 40, 40, 0.06)',
    beam: 'rgba(255, 150, 150, 0.07)',
  },
  glass_violet: {
    bgBase: '#0F051A',
    overlay1: 'rgba(15, 5, 25, 0.18)',
    overlay2: 'rgba(15, 5, 25, 0.30)',
    glow: 'rgba(160, 90, 255, 0.12)',
    glowInner: 'rgba(140, 70, 230, 0.06)',
    beam: 'rgba(200, 160, 255, 0.07)',
  },
  glass_arctic: {
    bgBase: '#030C16',
    overlay1: 'rgba(3, 12, 22, 0.18)',
    overlay2: 'rgba(3, 12, 22, 0.30)',
    glow: 'rgba(80, 210, 255, 0.12)',
    glowInner: 'rgba(60, 190, 240, 0.06)',
    beam: 'rgba(200, 240, 255, 0.07)',
  },
}

export default ({ children }: Props) => {
  const theme = useTheme()
  const windowSize = useWindowSize()
  const pic = useBgPic()
  const carWallpaper = useCarWallpaper()
  const isGlassTheme = theme.id.startsWith('glass_')

  const themeComponent = useMemo(() => (
    <View style={{ flex: 1, overflow: 'hidden' }}>
      <ImageBackground
        style={{ position: 'absolute', left: 0, top: 0, height: windowSize.height, width: windowSize.width, backgroundColor: theme['c-content-background'] }}
        source={theme['bg-image']}
        resizeMode="cover"
      >
      </ImageBackground>
      <View style={{ flex: 1, flexDirection: 'column', backgroundColor: theme['c-main-background'] }}>
        {children}
      </View>
    </View>
  ), [children, theme, windowSize.height, windowSize.width])

  const picComponent = useMemo(() => {
    return (
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ImageBackground
          style={{ position: 'absolute', left: 0, top: 0, height: windowSize.height, width: windowSize.width, backgroundColor: theme['c-content-background'] }}
          source={{ uri: pic!, headers: defaultHeaders }}
          resizeMode="cover"
          blurRadius={BLUR_RADIUS}
        >
          <View style={{ flex: 1, flexDirection: 'column', backgroundColor: theme['c-content-background'], opacity: 0.76 }}></View>
        </ImageBackground>
        <View style={{ flex: 1, flexDirection: 'column' }}>
          {children}
        </View>
      </View>
    )
  }, [children, pic, theme, windowSize.height, windowSize.width])

  const wallpaperComponent = useMemo(() => {
    const gc = isGlassTheme ? (GLASS_COLORS[theme.id] || GLASS_COLORS.glass_cosmos) : null
    return (
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ImageBackground
          style={{ position: 'absolute', left: 0, top: 0, height: windowSize.height, width: windowSize.width, backgroundColor: gc ? gc.bgBase : theme['c-content-background'] }}
          source={{ uri: carWallpaper! }}
          resizeMode="cover"
          blurRadius={BLUR_RADIUS}
        >
          <View style={{ flex: 1, backgroundColor: gc ? gc.overlay1 : theme['c-content-background'], opacity: gc ? 1 : 0.55 }}>
            {gc && (
              <>
                {/* Glow effect - top right corner */}
                <View style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: gc.glow }} />
                <View style={{ position: 'absolute', top: -20, right: -20, width: 160, height: 160, borderRadius: 80, backgroundColor: gc.glowInner }} />
                {/* 45 degree beam - diagonal light */}
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }} pointerEvents="none">
                  <View style={{ position: 'absolute', top: '35%', left: '-20%', width: '140%', height: 1.5, backgroundColor: gc.beam, transform: [{ rotate: '45deg' }] }} />
                </View>
              </>
            )}
          </View>
        </ImageBackground>
        <View style={{ flex: 1, flexDirection: 'column', backgroundColor: gc ? gc.overlay2 : 'transparent' }}>
          {children}
        </View>
      </View>
    )
  }, [children, carWallpaper, theme, windowSize.height, windowSize.width, isGlassTheme])

  return (
    <>
      <SizeView />
      {carWallpaper ? wallpaperComponent : pic ? picComponent : themeComponent}
    </>
  )
}
`;
fs.writeFileSync(path.join(BASE, 'src/components/PageContent.tsx'), pageContentContent);
console.log('   PageContent.tsx done');

// ============================================================
// 3. 更新 createThemes.js - 新增5个玻璃主题，删除重复glass_cosmos
// ============================================================
console.log('3. 更新 createThemes.js 新增玻璃主题...');
let ctjs = fs.readFileSync(path.join(BASE, 'src/theme/themes/createThemes.js'), 'utf-8');

// Remove duplicate glass_cosmos (the second occurrence)
const firstGlassIdx = ctjs.indexOf("id: 'glass_cosmos'");
const secondGlassIdx = ctjs.indexOf("id: 'glass_cosmos'", firstGlassIdx + 1);
if (secondGlassIdx > 0) {
  let entryStart = ctjs.lastIndexOf('{', secondGlassIdx);
  let entryEnd = ctjs.indexOf('},', secondGlassIdx);
  if (entryEnd > 0) {
    entryEnd += 2;
    let prefix = ctjs.substring(0, entryStart).trimEnd();
    if (prefix.endsWith(',')) prefix = prefix.slice(0, -1);
    ctjs = prefix + '\n' + ctjs.substring(entryEnd).trimStart();
    console.log('   Removed duplicate glass_cosmos');
  }
}

// New glass themes
const newGlassThemes = `  {
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
  },
`;

// Insert before the closing ]
const insertPos = ctjs.lastIndexOf(']');
ctjs = ctjs.substring(0, insertPos) + newGlassThemes + ctjs.substring(insertPos);

fs.writeFileSync(path.join(BASE, 'src/theme/themes/createThemes.js'), ctjs);
console.log('   createThemes.js done');

// ============================================================
// 4. 运行 createThemes.js 重新生成 themes.ts
// ============================================================
console.log('4. 重新生成 themes.ts...');
require('child_process').execSync('node src/theme/themes/createThemes.js', { cwd: BASE, stdio: 'inherit' });
console.log('   themes.ts done');

// ============================================================
// 5. 更新 i18n 翻译文件
// ============================================================
console.log('5. 更新 i18n 翻译...');

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

// ============================================================
// 6. 恢复 isHorizontalMode 原始逻辑
// ============================================================
console.log('6. 检查 isHorizontalMode...');
const toolsPath = path.join(BASE, 'src/utils/tools.ts');
let toolsContent = fs.readFileSync(toolsPath, 'utf-8');
if (toolsContent.includes('return true // car-mode')) {
  toolsContent = toolsContent.replace('return true // car-mode', 'return width / height > 1.2');
  fs.writeFileSync(toolsPath, toolsContent);
  console.log('   isHorizontalMode restored');
} else {
  console.log('   isHorizontalMode already correct');
}

console.log('\nAll changes applied successfully!');
