import { View } from 'react-native'
import { useTheme } from '@/store/theme/hook'
import ImageBackground from '@/components/common/ImageBackground'
import { useWindowSize } from '@/utils/hooks'
import { useMemo } from 'react'
import { scaleSizeAbsHR } from '@/utils/pixelRatio'
import { defaultHeaders } from './common/Image'
import SizeView from './SizeView'
import { useBgPic } from '@/store/common/hook'

interface GlassConfig {
  bg1: string
  bg2: string
  glow: string
  glow2: string
  glow3: string
  border: string
}

const GLASS_CONFIGS: Record<string, GlassConfig> = {
  glass_cosmos: { bg1: '#050816', bg2: '#0c1535', glow: 'rgba(0,170,255,0.35)', glow2: 'rgba(0,170,255,0.10)', glow3: 'rgba(0,100,255,0.06)', border: 'rgba(0,170,255,0.18)' },
  glass_amber: { bg1: '#120a02', bg2: '#2a1600', glow: 'rgba(255,170,50,0.35)', glow2: 'rgba(255,170,50,0.10)', glow3: 'rgba(255,120,0,0.06)', border: 'rgba(255,170,50,0.18)' },
  glass_emerald: { bg1: '#02100c', bg2: '#042a1c', glow: 'rgba(0,212,170,0.35)', glow2: 'rgba(0,212,170,0.10)', glow3: 'rgba(0,180,140,0.06)', border: 'rgba(0,212,170,0.18)' },
  glass_crimson: { bg1: '#120204', bg2: '#2a0408', glow: 'rgba(255,68,68,0.35)', glow2: 'rgba(255,68,68,0.10)', glow3: 'rgba(200,40,40,0.06)', border: 'rgba(255,68,68,0.18)' },
  glass_violet: { bg1: '#0c0214', bg2: '#1e0430', glow: 'rgba(170,80,255,0.35)', glow2: 'rgba(170,80,255,0.10)', glow3: 'rgba(130,50,220,0.06)', border: 'rgba(170,80,255,0.18)' },
  glass_arctic: { bg1: '#021014', bg2: '#041c24', glow: 'rgba(0,230,210,0.35)', glow2: 'rgba(0,230,210,0.10)', glow3: 'rgba(0,200,180,0.06)', border: 'rgba(0,230,210,0.18)' },
}

interface Props {
  children: React.ReactNode
}

const BLUR_RADIUS = Math.max(scaleSizeAbsHR(18), 10)

export default ({ children }: Props) => {
  const theme = useTheme()
  const windowSize = useWindowSize()
  const pic = useBgPic()
  const isGlassTheme = theme.id.startsWith('glass_')
  const glassConfig = isGlassTheme ? GLASS_CONFIGS[theme.id] : null

  const themeComponent = useMemo(() => {
    if (isGlassTheme && glassConfig) {
      return (
        <View style={{ flex: 1, overflow: 'hidden' }}>
          {/* Base: deep black */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: glassConfig.bg1 }} />
          {/* Gradient layer: subtle depth from top */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60%', backgroundColor: glassConfig.bg2, opacity: 0.5 }} />
          {/* Primary glow: top-right large orb */}
          <View style={{ position: 'absolute', top: -120, right: -100, width: 450, height: 450, borderRadius: 225, backgroundColor: glassConfig.glow }} />
          {/* Secondary glow: larger ambient light */}
          <View style={{ position: 'absolute', top: -200, right: -200, width: 650, height: 650, borderRadius: 325, backgroundColor: glassConfig.glow2 }} />
          {/* Diagonal light streak */}
          <View style={{ position: 'absolute', top: '-20%', left: '-40%', right: '-40%', bottom: '-20%', backgroundColor: 'rgba(255,255,255,0.012)', transform: [{ rotate: '-20deg' }] }} />
          {/* Bottom-left glow */}
          <View style={{ position: 'absolute', bottom: -100, left: -80, width: 380, height: 380, borderRadius: 190, backgroundColor: glassConfig.glow2 }} />
          {/* Center-bottom subtle glow */}
          <View style={{ position: 'absolute', bottom: -60, left: '20%', width: 300, height: 300, borderRadius: 150, backgroundColor: glassConfig.glow3 }} />
          {/* Content layer */}
          <View style={{ flex: 1, flexDirection: 'column' }}>
            {children}
          </View>
        </View>
      )
    }
    return (
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
    )
  }, [children, theme, windowSize.height, windowSize.width, isGlassTheme, glassConfig])

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

  return (
    <>
      <SizeView />
      {pic ? picComponent : themeComponent}
    </>
  )
}
