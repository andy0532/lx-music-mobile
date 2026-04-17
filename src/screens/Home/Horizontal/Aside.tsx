import { memo, useCallback, useRef } from 'react'
import { ScrollView, TouchableOpacity, View, Alert } from 'react-native'
import { useNavActiveId, useStatusbarHeight, useCarWallpaper } from '@/store/common/hook'
import { useTheme } from '@/store/theme/hook'
import { Icon } from '@/components/common/Icon'
import { confirmDialog, createStyle, exitApp as backHome } from '@/utils/tools'
import { NAV_MENUS } from '@/config/constant'
import type { InitState } from '@/store/common/state'
import { exitApp, setNavActiveId, setCarWallpaper } from '@/core/common'
import { BorderWidths } from '@/theme'
import { useSettingValue } from '@/store/setting/hook'
import { getCarModeScale } from '@/utils/pixelRatio'
import { selectFile, privateStorageDirectoryPath, unlink } from '@/utils/fs'

const CAR_SCALE = getCarModeScale()
const NAV_WIDTH = Math.round(68 * CAR_SCALE)
const ICON_SIZE = Math.round(20 * CAR_SCALE)
const WALLPAPER_DIR = privateStorageDirectoryPath + '/car_wallpaper'

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
    void selectFile({ extTypes: ['jpg', 'jpeg', 'png', 'webp'], toPath: WALLPAPER_FILE }).then((file) => {
      if (!file || isUnmounted.current) return
      const uri = WALLPAPER_FILE.startsWith('file://') ? WALLPAPER_FILE : 'file://' + WALLPAPER_FILE
      setCarWallpaper(uri)
    }).catch(() => {})
  }, [])
  const handleLongPress = useCallback(() => {
    if (!carWallpaper) return
    Alert.alert('清除壁纸', '确定要清除当前壁纸吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确定', style: 'destructive', onPress: () => { setCarWallpaper(null); void unlink(WALLPAPER_FILE).catch(() => {}) } },
    ])
  }, [carWallpaper])
  return (
    <TouchableOpacity style={styles.menuItem} onPress={handleSelectWallpaper} onLongPress={handleLongPress}>
      <View style={styles.iconContent}>
        <Icon name="album" size={ICON_SIZE} color={carWallpaper ? theme['c-primary-font-active'] : theme['c-font-label']} />
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
  const isGlassTheme = theme.id === 'glass_cosmos'
  const containerStyle = isGlassTheme
    ? { ...styles.container, borderRightColor: 'rgba(120, 160, 255, 0.12)', backgroundColor: 'transparent' }
    : { ...styles.container, borderRightColor: theme['c-border-background'] }
  return (
    <View style={containerStyle}>
      <Header />
      <ScrollView style={styles.menus}>
        <View style={styles.list}>
          {NAV_MENUS.map(menu => <MenuItem key={menu.id} id={menu.id} icon={menu.icon} onPress={handlePress} />)}
        </View>
      </ScrollView>
      <WallpaperBtn />
      {showBackBtn ? <MenuItem id="back_home" icon="home" onPress={handlePress} /> : null}
      {showExitBtn ? <MenuItem id="nav_exit" icon="exit2" onPress={handlePress} /> : null}
    </View>
  )
})
