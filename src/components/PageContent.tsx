import { View } from 'react-native'
import { useTheme } from '@/store/theme/hook'
import ImageBackground from '@/components/common/ImageBackground'
import { useWindowSize } from '@/utils/hooks'
import { useMemo } from 'react'
import { scaleSizeAbsHR } from '@/utils/pixelRatio'
import { defaultHeaders } from './common/Image'
import SizeView from './SizeView'
import { useBgPic } from '@/store/common/hook'

const GLASS_CONFIGS: Record<string, { bg1: string; bg2: string; glow: string; glow2: string }> = {
  glass_cosmos: { bg1: '#0a0e27', bg2: '#1a1f4e', glow: 'rgba(79,195,247,0.25)', glow2: 'rgba(79,195,247,0.08)' },
  glass_amber: { bg1: '#1a0e00', bg2: '#3d2200', glow: 'rgba(255,183,77,0.25)', glow2: 'rgba(255,183,77,0.08)' },
  glass_emerald: { bg1: '#001a0e', bg2: '#003d22', glow: 'rgba(102,187,106,0.25)', glow2: 'rgba(102,187,106,0.08)' },
  glass_crimson: { bg1: '#1a0005', bg2: '#4d0015', glow: 'rgba(239,83,80,0.25)', glow2: 'rgba(239,83,80,0.08)' },
  glass_violet: { bg1: '#0e001a', bg2: '#2a004d', glow: 'rgba(171,71,188,0.25)', glow2: 'rgba(171,71,188,0.08)' },
  glass_arctic: { bg1: '#001a2e', bg2: '#003d5c', glow: 'rgba(77,208,225,0.25)', glow2: 'rgba(77,208,225,0.08)' },
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
          {/* Gradient background layer 1 - deep base */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: glassConfig.bg1 }} />
          {/* Gradient background layer 2 - creates depth */}
          <View style={{ position: 'absolute', top: '30%', left: 0, right: 0, bottom: 0, backgroundColor: glassConfig.bg2, opacity: 0.6 }} />
          {/* Main glow - top right */}
          <View style={{ position: 'absolute', top: -80, right: -80, width: 350, height: 350, borderRadius: 175, backgroundColor: glassConfig.glow }} />
          {/* Secondary glow - larger, softer */}
          <View style={{ position: 'absolute', top: -150, right: -150, width: 500, height: 500, borderRadius: 250, backgroundColor: glassConfig.glow2 }} />
          {/* Diagonal light beam */}
          <View style={{ position: 'absolute', top: 0, left: '-30%', right: '-30%', bottom: 0, backgroundColor: 'rgba(255,255,255,0.015)', transform: [{ rotate: '-15deg' }] }} />
          {/* Bottom accent glow */}
          <View style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, borderRadius: 125, backgroundColor: glassConfig.glow2 }} />
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
