import { View, LinearGradient } from 'react-native'
import { useTheme } from '@/store/theme/hook'
import ImageBackground from '@/components/common/ImageBackground'
import { useWindowSize } from '@/utils/hooks'
import { useMemo } from 'react'
import { scaleSizeAbsHR } from '@/utils/pixelRatio'
import { defaultHeaders } from './common/Image'
import SizeView from './SizeView'
import { useBgPic } from '@/store/common/hook'

interface GlassConfig {
  bgColor: string
  gradientTop: string
  gradientMid: string
  glowColor: string
}

const GLASS_CONFIGS: Record<string, GlassConfig> = {
  glass_cosmos: { bgColor: '#030610', gradientTop: '#0a1a3a', gradientMid: '#050d20', glowColor: 'rgba(0,150,255,0.12)' },
  glass_amber: { bgColor: '#0a0602', gradientTop: '#2a1600', gradientMid: '#150b00', glowColor: 'rgba(255,160,40,0.10)' },
  glass_emerald: { bgColor: '#020a08', gradientTop: '#042a1a', gradientMid: '#021508', glowColor: 'rgba(0,200,160,0.10)' },
  glass_crimson: { bgColor: '#0a0203', gradientTop: '#2a0608', gradientMid: '#150204', glowColor: 'rgba(255,60,60,0.10)' },
  glass_violet: { bgColor: '#080214', gradientTop: '#20063a', gradientMid: '#10031c', glowColor: 'rgba(160,70,255,0.10)' },
  glass_arctic: { bgColor: '#020a0e', gradientTop: '#062830', gradientMid: '#031418', glowColor: 'rgba(0,210,200,0.10)' },
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
          {/* Layer 1: Deep black base */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: glassConfig.bgColor }} />
          {/* Layer 2: Top gradient - dark to deep blue, fading down */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '45%', backgroundColor: glassConfig.gradientTop, opacity: 0.5 }} />
          {/* Layer 3: Mid transition - softer gradient zone */}
          <View style={{ position: 'absolute', top: '20%', left: 0, right: 0, height: '30%', backgroundColor: glassConfig.gradientMid, opacity: 0.3 }} />
          {/* Layer 4: Horizontal diffuse glow band at top - the key sci-fi element */}
          <View style={{ position: 'absolute', top: 0, left: '-10%', right: '-10%', height: '8%', backgroundColor: glassConfig.glowColor }} />
          {/* Layer 5: Wider softer glow below the band */}
          <View style={{ position: 'absolute', top: '4%', left: '-20%', right: '-20%', height: '12%', backgroundColor: glassConfig.glowColor, opacity: 0.5 }} />
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
