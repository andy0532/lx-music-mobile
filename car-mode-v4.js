#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const ROOT = process.cwd()

function patchFile(filePath, search, replace, description) {
  const fullPath = path.join(ROOT, filePath)
  if (!fs.existsSync(fullPath)) { console.log('⚠️  跳过 ' + filePath + ' - 文件不存在'); return false }
  let content = fs.readFileSync(fullPath, 'utf-8')
  if (content.includes(replace)) { console.log('✅ ' + filePath + ' - 已修改过 (' + description + ')'); return true }
  if (!content.includes(search)) { console.log('❌ ' + filePath + ' - 找不到匹配 (' + description + ')'); console.log('   搜索: ' + search.substring(0, 80) + '...'); return false }
  content = content.replace(search, replace)
  fs.writeFileSync(fullPath, content, 'utf-8')
  console.log('✅ ' + filePath + ' - 修改成功 (' + description + ')')
  return true
}
function writeFile(filePath, content, description) {
  const fullPath = path.join(ROOT, filePath)
  fs.writeFileSync(fullPath, content, 'utf-8')
  console.log('✅ ' + filePath + ' - 写入成功 (' + description + ')')
}
let success = 0, failed = 0

// 1. pixelRatio.ts
patchFile('src/utils/pixelRatio.ts',
  "import { PixelRatio } from 'react-native'\nimport { windowSizeTools } from './windowSizeTools'",
  "import { Dimensions, PixelRatio } from 'react-native'\nimport { windowSizeTools } from './windowSizeTools'\n\nexport function getCarModeScale(): number {\n  const { width, height } = Dimensions.get('screen')\n  const minDim = Math.min(width, height)\n  const scale = 1.0 + (minDim - 360) / (900 - 360) * 0.5\n  return Math.min(1.5, Math.max(1.0, scale))\n}",
  '自适应缩放函数') ? success++ : failed++

// 2. app.ts
patchFile('src/app.ts',
  "import '@/utils/errorHandle'\nimport { init as initLog } from '@/utils/log'\nimport { bootLog, getBootLog } from '@/utils/bootLog'\nimport '@/config/globalData'\nimport { getFontSize } from '@/utils/data'\nimport { exitApp } from './utils/nativeModules/utils'\nimport { windowSizeTools } from './utils/windowSizeTools'\nimport { listenLaunchEvent } from './navigation/regLaunchedEvent'\nimport { tipDialog } from './utils/tools'\n\nconsole.log('starting app...')\nlistenLaunchEvent()\n\nvoid Promise.all([getFontSize(), windowSizeTools.init()]).then(async([fontSize]) => {\n  global.lx.fontSize = fontSize",
  "import '@/utils/errorHandle'\nimport { init as initLog } from '@/utils/log'\nimport { bootLog, getBootLog } from '@/utils/bootLog'\nimport '@/config/globalData'\nimport { getFontSize } from '@/utils/data'\nimport { exitApp } from './utils/nativeModules/utils'\nimport { windowSizeTools } from './utils/windowSizeTools'\nimport { listenLaunchEvent } from './navigation/regLaunchedEvent'\nimport { tipDialog } from './utils/tools'\nimport { getCarModeScale } from '@/utils/pixelRatio'\n\nconsole.log('starting app...')\nlistenLaunchEvent()\n\nvoid Promise.all([getFontSize(), windowSizeTools.init()]).then(async([fontSize]) => {\n  if (fontSize === 1) {\n    global.lx.fontSize = getCarModeScale()\n  } else {\n    global.lx.fontSize = fontSize\n  }",
  '自适应字号') ? success++ : failed++

// 3a. state.ts type
patchFile('src/store/common/state.ts',
  '  bgPic: string | null\n}',
  '  bgPic: string | null\n  carWallpaper: string | null\n}',
  'carWallpaper 类型') ? success++ : failed++

// 3b. state.ts init
patchFile('src/store/common/state.ts',
  '  bgPic: null,\n}',
  '  bgPic: null,\n  carWallpaper: null,\n}',
  'carWallpaper 初始值') ? success++ : failed++

// 4. action.ts
patchFile('src/store/common/action.ts',
  "  setBgPic(pic: string | null) {\n    state.bgPic = pic\n    global.state_event.bgPicUpdated(pic)\n  },",
  "  setBgPic(pic: string | null) {\n    state.bgPic = pic\n    global.state_event.bgPicUpdated(pic)\n  },\n  setCarWallpaper(pic: string | null) {\n    state.carWallpaper = pic\n    global.state_event.carWallpaperUpdated(pic)\n  },",
  'setCarWallpaper action') ? success++ : failed++

// 5. stateEvent.ts
patchFile('src/event/stateEvent.ts',
  "  bgPicUpdated(bgPic: string | null) {\n    this.emit('bgPicUpdated', bgPic)\n  }",
  "  bgPicUpdated(bgPic: string | null) {\n    this.emit('bgPicUpdated', bgPic)\n  }\n  carWallpaperUpdated(pic: string | null) {\n    this.emit('carWallpaperUpdated', pic)\n  }",
  'carWallpaperUpdated 事件') ? success++ : failed++

// 6. hook.ts
patchFile('src/store/common/hook.ts',
  "export const useBgPic = () => {\n  const [value, update] = useState(state.bgPic)\n\n  useEffect(() => {\n    global.state_event.on('bgPicUpdated', update)\n    return () => {\n      global.state_event.off('bgPicUpdated', update)\n    }\n  }, [])\n\n  return value\n}",
  "export const useBgPic = () => {\n  const [value, update] = useState(state.bgPic)\n\n  useEffect(() => {\n    global.state_event.on('bgPicUpdated', update)\n    return () => {\n      global.state_event.off('bgPicUpdated', update)\n    }\n  }, [])\n\n  return value\n}\n\nexport const useCarWallpaper = () => {\n  const [value, update] = useState(state.carWallpaper)\n\n  useEffect(() => {\n    global.state_event.on('carWallpaperUpdated', update)\n    return () => {\n      global.state_event.off('carWallpaperUpdated', update)\n    }\n  }, [])\n\n  return value\n}",
  'useCarWallpaper hook') ? success++ : failed++

// 7. core/common.ts
patchFile('src/core/common.ts',
  "export const setBgPic = (pic: string | null) => {\n  commonActions.setBgPic(pic)\n}",
  "export const setBgPic = (pic: string | null) => {\n  commonActions.setBgPic(pic)\n}\nexport const setCarWallpaper = (pic: string | null) => {\n  commonActions.setCarWallpaper(pic)\n}",
  'setCarWallpaper 导出') ? success++ : failed++

// 8a. init/common.ts imports
patchFile('src/core/init/common.ts',
  "import playerState from '@/store/player/state'\nimport { prefetch } from '@/components/common/ImageBackground'\nimport { setBgPic } from '@/core/common'",
  "import playerState from '@/store/player/state'\nimport { prefetch } from '@/components/common/ImageBackground'\nimport { setBgPic, setCarWallpaper } from '@/core/common'\nimport { privateStorageDirectoryPath, existsFile, readFile, writeFile, unlink } from '@/utils/fs'",
  '壁纸持久化导入') ? success++ : failed++

// 8b. init/common.ts logic
patchFile('src/core/init/common.ts',
  "  handlePicUpdate()\n  global.state_event.on('playerMusicInfoChanged', handlePicUpdate)\n  global.state_event.on('configUpdated', handleConfigUpdate)\n}",
  "  handlePicUpdate()\n  global.state_event.on('playerMusicInfoChanged', handlePicUpdate)\n  global.state_event.on('configUpdated', handleConfigUpdate)\n\n  const wallpaperPathFile = privateStorageDirectoryPath + '/car_wallpaper_path.txt'\n  try {\n    if (await existsFile(wallpaperPathFile)) {\n      const savedPath = await readFile(wallpaperPathFile)\n      if (savedPath && await existsFile(savedPath.replace('file://', ''))) {\n        setCarWallpaper(savedPath)\n      }\n    }\n  } catch (e) {}\n\n  const handleCarWallpaperUpdate = (pic) => {\n    if (pic) {\n      void writeFile(wallpaperPathFile, pic)\n    } else {\n      void unlink(wallpaperPathFile).catch(() => {})\n    }\n  }\n  global.state_event.on('carWallpaperUpdated', handleCarWallpaperUpdate)\n}",
  '壁纸持久化逻辑') ? success++ : failed++

// 9. themes/index.ts
patchFile('src/theme/themes/index.ts',
  "    'c-list-header-border-bottom': theme.config.themeColors['c-primary-alpha-900'],\n    'c-content-background': theme.config.themeColors['c-primary-light-1000'],\n    'c-border-background': theme.config.themeColors['c-primary-light-100-alpha-700'],",
  "    'c-list-header-border-bottom': theme.config.themeColors['c-primary-alpha-900'],\n    'c-content-background': ('c-content-background' in theme.config.extInfo)\n      ? theme.config.extInfo['c-content-background'] as string\n      : theme.config.themeColors['c-primary-light-1000'],\n    'c-border-background': ('c-border-background' in theme.config.extInfo)\n      ? theme.config.extInfo['c-border-background'] as string\n      : theme.config.themeColors['c-primary-light-100-alpha-700'],",
  '半透明覆盖色') ? success++ : failed++

// 10. createThemes.js
patchFile('src/theme/themes/createThemes.js',
  "  {\n    id: 'happy_new_year',\n    name: '\u65b0\u5e74\u5feb\u4e50',",
  "  {\n    id: 'glass_cosmos',\n    name: '\u6df1\u7a7a\u661f\u6cb3',\n    isDark: true,\n    config: {\n      primary: 'rgb(100, 140, 255)',\n      font: 'rgb(220, 225, 255)',\n      'c-app-background': 'rgba(6, 10, 30, 0)',\n      'c-main-background': 'rgba(10, 14, 40, 0.45)',\n      'c-content-background': 'rgba(14, 18, 48, 0.50)',\n      'c-border-background': 'rgba(120, 160, 255, 0.12)',\n      'bg-image': '',\n      'bg-image-position': 'center',\n      'bg-image-size': 'cover',\n      'c-badge-primary': 'rgb(100, 140, 255)',\n      'c-badge-secondary': 'rgb(180, 100, 255)',\n      'c-badge-tertiary': 'rgb(100, 220, 255)',\n    },\n  },\n  {\n    id: 'happy_new_year',\n    name: '\u65b0\u5e74\u5feb\u4e50',",
  'glass_cosmos 主题') ? success++ : failed++

// 11. rebuild themes.ts
console.log('\n🔄 重建 themes.ts ...')
try {
  require('child_process').execSync('node src/theme/themes/createThemes.js', { cwd: ROOT, stdio: 'inherit' })
  console.log('✅ themes.ts 重建成功'); success++
} catch (e) { console.log('❌ themes.ts 重建失败:', e.message); failed++ }

// 12. i18n
patchFile('src/lang/zh-cn.json', '"theme_happy_new_year": "\u65b0\u5e74\u5feb\u4e50"', '"theme_happy_new_year": "\u65b0\u5e74\u5feb\u4e50",\n  "theme_glass_cosmos": "\u6df1\u7a7a\u661f\u6cb3"', '中文主题名') ? success++ : failed++
patchFile('src/lang/en-us.json', '"theme_happy_new_year": "New Year"', '"theme_happy_new_year": "New Year",\n  "theme_glass_cosmos": "Deep Cosmos"', '英文主题名') ? success++ : failed++
patchFile('src/lang/zh-tw.json', '"theme_happy_new_year": "\u65b0\u5e74\u5feb\u6a02"', '"theme_happy_new_year": "\u65b0\u5e74\u5feb\u6a02",\n  "theme_glass_cosmos": "\u6df1\u7a7a\u661f\u6cb3"', '繁体主题名') ? success++ : failed++

// 13. PageContent.tsx
writeFile('src/components/PageContent.tsx', "import { View } from 'react-native'\nimport { useTheme } from '@/store/theme/hook'\nimport ImageBackground from '@/components/common/ImageBackground'\nimport { useWindowSize } from '@/utils/hooks'\nimport { useMemo } from 'react'\nimport { scaleSizeAbsHR } from '@/utils/pixelRatio'\nimport { defaultHeaders } from './common/Image'\nimport SizeView from './SizeView'\nimport { useBgPic, useCarWallpaper } from '@/store/common/hook'\n\ninterface Props {\n  children: React.ReactNode\n}\n\nconst BLUR_RADIUS = Math.max(scaleSizeAbsHR(18), 10)\n\nconst DeepSpaceBackground = ({ width, height }: { width: number; height: number }) => (\n  <View style={{ position: 'absolute', left: 0, top: 0, width, height }}>\n    <View style={{ flex: 1, backgroundColor: '#060A1E' }} />\n    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '45%', backgroundColor: 'rgba(20, 10, 60, 0.5)' }} />\n    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', backgroundColor: 'rgba(5, 20, 50, 0.4)' }} />\n  </View>\n)\n\nconst GlowDecorations = ({ width, height }: { width: number; height: number }) => (\n  <View style={{ position: 'absolute', left: 0, top: 0, width, height }} pointerEvents=\"none\">\n    <View style={{\n      position: 'absolute', top: height * 0.05, left: -width * 0.1,\n      width: width * 0.5, height: width * 0.5,\n      borderRadius: width * 0.25,\n      backgroundColor: 'rgba(60, 100, 255, 0.12)',\n    }} />\n    <View style={{\n      position: 'absolute', bottom: height * 0.1, right: -width * 0.05,\n      width: width * 0.4, height: width * 0.4,\n      borderRadius: width * 0.2,\n      backgroundColor: 'rgba(140, 80, 255, 0.10)',\n    }} />\n    <View style={{\n      position: 'absolute', top: 0, right: width * 0.2,\n      width: width * 0.03, height: height * 0.6,\n      backgroundColor: 'rgba(100, 160, 255, 0.06)',\n      transform: [{ rotate: '45deg' }],\n    }} />\n  </View>\n)\n\nexport default ({ children }: Props) => {\n  const theme = useTheme()\n  const windowSize = useWindowSize()\n  const pic = useBgPic()\n  const carWallpaper = useCarWallpaper()\n  const wallpaperUri = carWallpaper || pic\n  const isGlassTheme = theme.id === 'glass_cosmos'\n\n  const content = useMemo(() => {\n    if (isGlassTheme) {\n      return (\n        <View style={{ flex: 1, overflow: 'hidden' }}>\n          <DeepSpaceBackground width={windowSize.width} height={windowSize.height} />\n          <GlowDecorations width={windowSize.width} height={windowSize.height} />\n          {wallpaperUri ? (\n            <ImageBackground\n              style={{ position: 'absolute', left: 0, top: 0, height: windowSize.height, width: windowSize.width }}\n              source={{ uri: wallpaperUri, headers: defaultHeaders }}\n              resizeMode=\"cover\"\n              blurRadius={BLUR_RADIUS}\n            >\n              <View style={{ flex: 1, backgroundColor: 'rgba(6, 10, 30, 0.18)' }} />\n            </ImageBackground>\n          ) : null}\n          <View style={{ flex: 1, flexDirection: 'column', backgroundColor: wallpaperUri ? 'rgba(6, 10, 30, 0.30)' : 'transparent' }}>\n            {children}\n          </View>\n        </View>\n      )\n    }\n    if (wallpaperUri) {\n      return (\n        <View style={{ flex: 1, overflow: 'hidden' }}>\n          <ImageBackground\n            style={{ position: 'absolute', left: 0, top: 0, height: windowSize.height, width: windowSize.width }}\n            source={{ uri: wallpaperUri, headers: defaultHeaders }}\n            resizeMode=\"cover\"\n            blurRadius={BLUR_RADIUS}\n          >\n            <View style={{ flex: 1, backgroundColor: theme['c-content-background'], opacity: 0.55 }} />\n          </ImageBackground>\n          <View style={{ flex: 1, flexDirection: 'column', backgroundColor: theme['c-main-background'], opacity: 0.78 }}>\n            {children}\n          </View>\n        </View>\n      )\n    }\n    return (\n      <View style={{ flex: 1, overflow: 'hidden' }}>\n        <ImageBackground\n          style={{ position: 'absolute', left: 0, top: 0, height: windowSize.height, width: windowSize.width, backgroundColor: theme['c-content-background'] }}\n          source={theme['bg-image']}\n          resizeMode=\"cover\"\n        />\n        <View style={{ flex: 1, flexDirection: 'column', backgroundColor: theme['c-main-background'] }}>\n          {children}\n        </View>\n      </View>\n    )\n  }, [children, theme, wallpaperUri, windowSize.height, windowSize.width, isGlassTheme])\n\n  return (\n    <>\n      <SizeView />\n      {content}\n    </>\n  )\n}\n", 'PageContent 磨砂玻璃效果')
success++

// 14. Aside.tsx
writeFile('src/screens/Home/Horizontal/Aside.tsx', "import { memo, useCallback, useRef } from 'react'\nimport { ScrollView, TouchableOpacity, View, Alert } from 'react-native'\nimport { useNavActiveId, useStatusbarHeight, useCarWallpaper } from '@/store/common/hook'\nimport { useTheme } from '@/store/theme/hook'\nimport { Icon } from '@/components/common/Icon'\nimport { confirmDialog, createStyle, exitApp as backHome } from '@/utils/tools'\nimport { NAV_MENUS } from '@/config/constant'\nimport type { InitState } from '@/store/common/state'\nimport { exitApp, setNavActiveId, setCarWallpaper } from '@/core/common'\nimport { BorderWidths } from '@/theme'\nimport { useSettingValue } from '@/store/setting/hook'\nimport { getCarModeScale } from '@/utils/pixelRatio'\nimport { selectFile, privateStorageDirectoryPath, unlink } from '@/utils/fs'\n\nconst CAR_SCALE = getCarModeScale()\nconst NAV_WIDTH = Math.round(68 * CAR_SCALE)\nconst ICON_SIZE = Math.round(20 * CAR_SCALE)\nconst WALLPAPER_FILE = privateStorageDirectoryPath + '/car_wallpaper.jpg'\n\nconst styles = createStyle({\n  container: { flexGrow: 0, borderRightWidth: BorderWidths.normal, paddingBottom: 10, width: NAV_WIDTH },\n  header: { paddingTop: 15, paddingBottom: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },\n  headerText: { textAlign: 'center', marginLeft: 16 },\n  menus: { flex: 1 },\n  list: { paddingBottom: 15 },\n  menuItem: { flexDirection: 'row', paddingTop: 15, paddingBottom: 15, justifyContent: 'center', alignItems: 'center' },\n  iconContent: { alignItems: 'center' },\n  text: { paddingLeft: 15 },\n})\n\nconst Header = () => {\n  const theme = useTheme()\n  const statusBarHeight = useStatusbarHeight()\n  return (\n    <View style={{ paddingTop: statusBarHeight }}>\n      <View style={styles.header}>\n        <Icon name=\"logo\" color={theme['c-primary-dark-100-alpha-300']} size={Math.round(22 * CAR_SCALE)} />\n      </View>\n    </View>\n  )\n}\n\ntype IdType = InitState['navActiveId'] | 'nav_exit' | 'back_home'\n\nconst MenuItem = ({ id, icon, onPress }: { id: IdType; icon: string; onPress: (id: IdType) => void }) => {\n  const activeId = useNavActiveId()\n  const theme = useTheme()\n  return activeId == id\n    ? <View style={styles.menuItem}><View style={styles.iconContent}><Icon name={icon} size={ICON_SIZE} color={theme['c-primary-font-active']} /></View></View>\n    : <TouchableOpacity style={styles.menuItem} onPress={() => { onPress(id) }}><View style={styles.iconContent}><Icon name={icon} size={ICON_SIZE} color={theme['c-font-label']} /></View></TouchableOpacity>\n}\n\nconst WallpaperBtn = () => {\n  const theme = useTheme()\n  const carWallpaper = useCarWallpaper()\n  const isUnmounted = useRef(false)\n  const handleSelectWallpaper = useCallback(() => {\n    void selectFile({ extTypes: ['jpg', 'jpeg', 'png', 'webp'], toPath: WALLPAPER_FILE }).then((file) => {\n      if (!file || isUnmounted.current) return\n      const uri = file.path.startsWith('file://') ? file.path : 'file://' + file.path\n      setCarWallpaper(uri)\n    }).catch(() => {})\n  }, [])\n  const handleLongPress = useCallback(() => {\n    if (!carWallpaper) return\n    Alert.alert('清除壁纸', '确定要清除当前壁纸吗？', [\n      { text: '取消', style: 'cancel' },\n      { text: '确定', style: 'destructive', onPress: () => { setCarWallpaper(null); void unlink(WALLPAPER_FILE).catch(() => {}) } },\n    ])\n  }, [carWallpaper])\n  return (\n    <TouchableOpacity style={styles.menuItem} onPress={handleSelectWallpaper} onLongPress={handleLongPress}>\n      <View style={styles.iconContent}>\n        <Icon name=\"album\" size={ICON_SIZE} color={carWallpaper ? theme['c-primary-font-active'] : theme['c-font-label']} />\n      </View>\n    </TouchableOpacity>\n  )\n}\n\nexport default memo(() => {\n  const theme = useTheme()\n  const showBackBtn = useSettingValue('common.showBackBtn')\n  const showExitBtn = useSettingValue('common.showExitBtn')\n  const handlePress = (id: IdType) => {\n    switch (id) {\n      case 'nav_exit':\n        void confirmDialog({ message: global.i18n.t('exit_app_tip'), confirmButtonText: global.i18n.t('list_remove_tip_button') }).then(isExit => { if (!isExit) return; exitApp('Exit Btn') })\n        return\n      case 'back_home': backHome(); return\n    }\n    global.app_event.changeMenuVisible(false)\n    setNavActiveId(id)\n  }\n  const isGlassTheme = theme.id === 'glass_cosmos'\n  const containerStyle = isGlassTheme\n    ? { ...styles.container, borderRightColor: 'rgba(120, 160, 255, 0.12)', backgroundColor: 'transparent' }\n    : { ...styles.container, borderRightColor: theme['c-border-background'] }\n  return (\n    <View style={containerStyle}>\n      <Header />\n      <ScrollView style={styles.menus}>\n        <View style={styles.list}>\n          {NAV_MENUS.map(menu => <MenuItem key={menu.id} id={menu.id} icon={menu.icon} onPress={handlePress} />)}\n        </View>\n      </ScrollView>\n      <WallpaperBtn />\n      {showBackBtn ? <MenuItem id=\"back_home\" icon=\"home\" onPress={handlePress} /> : null}\n      {showExitBtn ? <MenuItem id=\"nav_exit\" icon=\"exit2\" onPress={handlePress} /> : null}\n    </View>\n  )\n})\n", 'Aside 壁纸按钮+自适应+透明背景')
success++

console.log('\n' + '='.repeat(50))
console.log('✅ 成功: ' + success + ' 项')
if (failed > 0) console.log('❌ 失败: ' + failed + ' 项')
console.log('='.repeat(50))
console.log('\n车机模式修改已应用！')
console.log('1. 自适应缩放 - 手机不放大，车机自动放大')
console.log('2. 深空星河主题 - 磨砂玻璃效果')
console.log('3. 壁纸功能 - 点击导航栏 album 图标选择壁纸，长按清除')
console.log('4. 导航栏自适应 - 宽度和图标大小随屏幕缩放')
console.log('5. 壁纸全屏覆盖 - 壁纸在导航栏和内容区背后显示')
