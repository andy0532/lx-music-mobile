import { View } from 'react-native'
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

const GLASS_COLORS: Record<string, { bgBase: string; overlay1: string; overlay2: string; glow: string; glowInner: string; beam: string }> = {
  glass_cosmos: {
    bgBase: '#060A1E', overlay1: 'rgba(6,10,30,0.18)', overlay2: 'rgba(6,10,30,0.30)',
    glow: 'rgba(100,160,255,0.10)', glowInner: 'rgba(80,140,255,0.05)', beam: 'rgba(180,200,255,0.06)',
  },
  glass_amber: {
    bgBase: '#1A0E02', overlay1: 'rgba(26,14,2,0.18)', overlay2: 'rgba(26,14,2,0.30)',
    glow: 'rgba(255,175,50,0.12)', glowInner: 'rgba(255,150,30,0.06)', beam: 'rgba(255,220,150,0.07)',
  },
  glass_emerald: {
    bgBase: '#021408', overlay1: 'rgba(2,20,10,0.18)', overlay2: 'rgba(2,20,10,0.30)',
    glow: 'rgba(16,185,129,0.12)', glowInner: 'rgba(10,160,110,0.06)', beam: 'rgba(110,231,183,0.07)',
  },
  glass_crimson: {
    bgBase: '#1A0505', overlay1: 'rgba(25,5,5,0.18)', overlay2: 'rgba(25,5,5,0.30)',
    glow: 'rgba(220,60,60,0.12)', glowInner: 'rgba(200,40,40,0.06)', beam: 'rgba(255,150,150,0.07)',
  },
  glass_violet: {
    bgBase: '#0F051A', overlay1: 'rgba(15,5,25,0.18)', overlay2: 'rgba(15,5,25,0.30)',
    glow: 'rgba(160,90,255,0.12)', glowInner: 'rgba(140,70,230,0.06)', beam: 'rgba(200,160,255,0.07)',
  },
  glass_arctic: {
    bgBase: '#030C16', overlay1: 'rgba(3,12,22,0.18)', overlay2: 'rgba(3,12,22,0.30)',
    glow: 'rgba(80,210,255,0.12)', glowInner: 'rgba(60,190,240,0.06)', beam: 'rgba(200,240,255,0.07)',
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
      ></ImageBackground>
      <View style={{ flex: 1, flexDirection: 'column', backgroundColor: theme['c-main-background'] }}>
        {children}
      </View>
    </View>
  ), [children, theme, windowSize.height, windowSize.width])

  const picComponent = useMemo(() => (
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
  ), [children, pic, theme, windowSize.height, windowSize.width])

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
                <View style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: 140, backgroundColor: gc.glow }} />
                <View style={{ position: 'absolute', top: -20, right: -20, width: 160, height: 160, borderRadius: 80, backgroundColor: gc.glowInner }} />
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
