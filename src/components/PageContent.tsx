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
  bgColor: string
  warmColor: string
  warmFade: string
  coolColor: string
  coolFade: string
  glowColor: string
  selfGlow: string
}

const GLASS_CONFIGS: Record<string, GlassConfig> = {
  glass_cosmos: { bgColor: '#04081a', warmColor: 'rgba(140,100,40,0.22)', warmFade: 'rgba(80,120,200,0.12)', coolColor: 'rgba(0,60,160,0.18)', coolFade: 'rgba(0,40,120,0.08)', glowColor: 'rgba(0,140,255,0.25)', selfGlow: 'rgba(0,100,200,0.05)' },
  glass_amber: { bgColor: '#0c0600', warmColor: 'rgba(180,100,20,0.28)', warmFade: 'rgba(120,70,10,0.14)', coolColor: 'rgba(50,25,0,0.12)', coolFade: 'rgba(40,20,0,0.06)', glowColor: 'rgba(255,150,30,0.28)', selfGlow: 'rgba(200,120,10,0.05)' },
  glass_emerald: { bgColor: '#020c06', warmColor: 'rgba(80,140,50,0.20)', warmFade: 'rgba(40,100,60,0.10)', coolColor: 'rgba(0,80,60,0.18)', coolFade: 'rgba(0,60,50,0.08)', glowColor: 'rgba(0,190,150,0.25)', selfGlow: 'rgba(0,140,110,0.05)' },
  glass_crimson: { bgColor: '#0c0203', warmColor: 'rgba(180,50,50,0.22)', warmFade: 'rgba(120,30,30,0.10)', coolColor: 'rgba(60,8,16,0.14)', coolFade: 'rgba(40,5,10,0.06)', glowColor: 'rgba(255,55,55,0.28)', selfGlow: 'rgba(180,30,30,0.05)' },
  glass_violet: { bgColor: '#06011a', warmColor: 'rgba(140,50,160,0.20)', warmFade: 'rgba(90,30,120,0.10)', coolColor: 'rgba(50,15,90,0.16)', coolFade: 'rgba(30,10,60,0.06)', glowColor: 'rgba(150,65,240,0.25)', selfGlow: 'rgba(120,40,180,0.05)' },
  glass_arctic: { bgColor: '#020c10', warmColor: 'rgba(50,120,140,0.18)', warmFade: 'rgba(30,80,100,0.10)', coolColor: 'rgba(0,70,110,0.18)', coolFade: 'rgba(0,50,80,0.08)', glowColor: 'rgba(0,200,190,0.25)', selfGlow: 'rgba(0,150,140,0.05)' },
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
          {/* Base: deep blue-black */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: glassConfig.bgColor }} />

          {/* === Diagonal warm-to-cool gradient - VIVID so it shows through transparent UI === */}
          {/* Warm zone: top-left - bright and saturated */}
          <View style={{ position: 'absolute', top: 0, left: 0, width: '65%', height: '45%', backgroundColor: glassConfig.warmColor }} />
          {/* Warm spread: softer, extends further */}
          <View style={{ position: 'absolute', top: '5%', left: '3%', width: '80%', height: '35%', backgroundColor: glassConfig.warmFade }} />
          {/* Cool zone: bottom-right - deep tint */}
          <View style={{ position: 'absolute', top: '25%', left: '35%', right: 0, bottom: 0, backgroundColor: glassConfig.coolColor }} />
          {/* Cool spread: softer, extends further up-left */}
          <View style={{ position: 'absolute', top: '15%', left: '25%', width: '55%', height: '55%', backgroundColor: glassConfig.coolFade }} />

          {/* === Top accent glow band === */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4%', backgroundColor: glassConfig.glowColor, opacity: 0.6 }} />
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '10%', backgroundColor: glassConfig.glowColor, opacity: 0.25 }} />
          <View style={{ position: 'absolute', top: '2%', left: 0, right: 0, height: '14%', backgroundColor: glassConfig.glowColor, opacity: 0.08 }} />

          {/* === Self-illuminating ambient === */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: glassConfig.selfGlow }} />

          {/* === Top edge bright line === */}
          <View style={{ position: 'absolute', top: 0, left: '5%', right: '5%', height: 1.5, backgroundColor: glassConfig.glowColor, opacity: 0.45 }} />

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
