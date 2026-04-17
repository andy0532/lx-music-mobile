import { memo } from 'react'
import { Alert } from 'react-native'
import { ScrollView, TouchableOpacity, View, Text } from 'react-native'
import { useNavActiveId, useStatusbarHeight } from '@/store/common/hook'
import { useTheme } from '@/store/theme/hook'
import { Icon } from '@/components/common/Icon'
import { confirmDialog, createStyle, exitApp as backHome } from '@/utils/tools'
import { NAV_MENUS } from '@/config/constant'
import type { InitState } from '@/store/common/state'
import { exitApp, setNavActiveId } from '@/core/common'
import { BorderWidths } from '@/theme'
import { useBgPic } from '@/store/common/hook'
import { setBgPic } from '@/core/common'
import { selectFile, privateStorageDirectoryPath, existsFile } from '@/utils/fs'
import { useSettingValue } from '@/store/setting/hook'
import { getCarModeScale } from '@/utils/pixelRatio'

const NAV_WIDTH = Math.round(68 * getCarModeScale())
const ICON_SIZE = Math.round(20 * getCarModeScale())

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
        <Icon name="logo" color={theme['c-primary-dark-100-alpha-300']} size={ICON_SIZE} />
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

const WALLPAPER_FILE = privateStorageDirectoryPath + '/car_wallpaper.jpg'

const WallpaperBtn = memo(() => {
  const theme = useTheme()
  const bgPic = useBgPic()

  const handlePress = async () => {
    try {
      const result = await selectFile({ extTypes: ['jpg', 'jpeg', 'png', 'webp'], toPath: WALLPAPER_FILE })
      console.log('[WallpaperBtn] selectFile result:', JSON.stringify(result))
      if (result) {
        const localPath = result.data || result.uri || result.path
        if (localPath) {
          let fileExists = false
          try { fileExists = await existsFile(localPath) } catch (_) {}
          console.log('[WallpaperBtn] localPath:', localPath, 'exists:', fileExists)
          const uri = localPath.startsWith('/') ? 'file://' + localPath : localPath
          console.log('[WallpaperBtn] setting bgPic:', uri)
          setBgPic(uri)
          return
        }
      }
      try {
        const r2 = await selectFile({})
        console.log('[WallpaperBtn] fallback:', JSON.stringify(r2))
        if (r2) { const u = r2.uri || r2.data || r2.path; if (u) { setBgPic(u); return } }
      } catch (_) {}
      Alert.alert('提示', '未能获取壁纸路径')
    } catch (e) {
      Alert.alert('提示', '选择壁纸失败: ' + (e instanceof Error ? e.message : String(e)))
    }
  }

  const handleLongPress = () => { setBgPic(null) }

  return (
    <TouchableOpacity style={styles.menuItem} onPress={handlePress} onLongPress={handleLongPress} activeOpacity={0.5}>
      <View style={styles.iconContent}>
        <Text style={{ fontSize: Math.round(18 * getCarModeScale()), color: bgPic ? theme['c-primary-font-active'] : theme['c-font-label'] }}>🖼</Text>
      </View>
    </TouchableOpacity>
  )
})

export default memo(() => {
  const theme = useTheme()
  const showBackBtn = useSettingValue('common.showBackBtn')
  const showExitBtn = useSettingValue('common.showExitBtn')

  const handlePress = (id: IdType) => {
    switch (id) {
      case 'nav_exit': void confirmDialog({ message: global.i18n.t('exit_app_tip'), confirmButtonText: global.i18n.t('list_remove_tip_button') }).then(isExit => { if (!isExit) return; exitApp('Exit Btn') }); return
      case 'back_home': backHome(); return
    }
    global.app_event.changeMenuVisible(false)
    setNavActiveId(id)
  }

  return (
    <View style={{ ...styles.container, borderRightColor: theme['c-border-background'] }}>
      <Header />
      <ScrollView style={styles.menus}><View style={styles.list}>{NAV_MENUS.map(menu => <MenuItem key={menu.id} id={menu.id} icon={menu.icon} onPress={handlePress} />)}</View></ScrollView>
      {showBackBtn ? <MenuItem id="back_home" icon="home" onPress={handlePress} /> : null}
      {showExitBtn ? <MenuItem id="nav_exit" icon="exit2" onPress={handlePress} /> : null}
      <WallpaperBtn />
    </View>
  )
})
