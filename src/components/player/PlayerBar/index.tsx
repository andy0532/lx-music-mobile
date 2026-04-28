import { memo, useMemo } from 'react'
import { View } from 'react-native'
import { useKeyboard } from '@/utils/hooks'

import Pic from './components/Pic'
import Title from './components/Title'
import PlayInfo from './components/PlayInfo'
import ControlBtn from './components/ControlBtn'
import { createStyle } from '@/utils/tools'
// import { useSettingValue } from '@/store/setting/hook'
import { useTheme } from '@/store/theme/hook'
import { useSettingValue } from '@/store/setting/hook'

interface GlassAccent {
  bgColor: string
  accentLine: string
}

const GLASS_ACCENTS: Record<string, GlassAccent> = {
  glass_cosmos: { bgColor: 'transparent', accentLine: 'rgba(0,150,255,0.5)' },
  glass_amber: { bgColor: 'transparent', accentLine: 'rgba(255,150,30,0.5)' },
  glass_emerald: { bgColor: 'transparent', accentLine: 'rgba(0,190,150,0.5)' },
  glass_crimson: { bgColor: 'transparent', accentLine: 'rgba(255,55,55,0.5)' },
  glass_violet: { bgColor: 'transparent', accentLine: 'rgba(150,65,240,0.5)' },
  glass_arctic: { bgColor: 'transparent', accentLine: 'rgba(0,200,190,0.5)' },
  glass_frost: { bgColor: 'transparent', accentLine: 'rgba(80,140,220,0.5)' },
  glass_rose: { bgColor: 'transparent', accentLine: 'rgba(220,80,120,0.5)' },
  glass_spring: { bgColor: 'transparent', accentLine: 'rgba(60,170,90,0.5)' },
}

export default memo(({ isHome = false }: { isHome?: boolean }) => {
  // const { onLayout, ...layout } = useLayout()
  const { keyboardShown } = useKeyboard()
  const theme = useTheme()
  const autoHidePlayBar = useSettingValue('common.autoHidePlayBar')
  const isGlassTheme = theme.id.startsWith('glass_')
  const glassAccent = isGlassTheme ? GLASS_ACCENTS[theme.id] : null

  const playerComponent = useMemo(() => (
    <View style={{
      ...styles.container,
      backgroundColor: isGlassTheme && glassAccent ? glassAccent.bgColor : theme['c-content-background'],
    }}>
      {/* Glass theme: top glow line */}
      {isGlassTheme && glassAccent && (
        <View style={{ position: 'absolute', top: 0, left: '5%', right: '5%', height: 1, backgroundColor: glassAccent.accentLine }} />
      )}
      <Pic isHome={isHome} />
      <View style={styles.center}>
        <Title isHome={isHome} />
        <PlayInfo isHome={isHome} />
      </View>
      <View style={styles.right}>
        <ControlBtn />
      </View>
    </View>
  ), [theme, isHome, isGlassTheme, glassAccent])

  // console.log('render pb')

  return autoHidePlayBar && keyboardShown ? null : playerComponent
})


const styles = createStyle({
  container: {
    width: '100%',
    // height: 100,
    // paddingTop: progressContentPadding,
    // marginTop: -progressContentPadding,
    // backgroundColor: 'rgba(0, 0, 0, .1)',
    // borderTopWidth: BorderWidths.normal2,
    paddingVertical: 5,
    paddingLeft: 5,
    // backgroundColor: AppColors.primary,
    // backgroundColor: 'red',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 10,
  },
  left: {
    // borderRadius: 3,
    flexGrow: 0,
    flexShrink: 0,
  },
  center: {
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    paddingLeft: 5,
    height: '100%',
    // justifyContent: 'space-evenly',
    // height: 48,
    // backgroundColor: 'rgba(0, 0, 0, .1)',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 0,
    flexShrink: 0,
    paddingLeft: 5,
    paddingRight: 5,
  },
  // row: {
  //   flexDirection: 'row',
  //   flexGrow: 0,
  //   flexShrink: 0,
  // },
})
