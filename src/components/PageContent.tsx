import { View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useTheme } from '@/store/theme/hook'
import ImageBackground from '@/components/common/ImageBackground'
import { useWindowSize } from '@/utils/hooks'
import { useMemo } from 'react'
import { scaleSizeAbsHR } from '@/utils/pixelRatio'
import { defaultHeaders } from './common/Image'
import SizeView from './SizeView'
import { useBgPic } from '@/store/common/hook'

interface GlassConfig {
  colors: string[]
  glowColor: string
  selfGlow: string
}

const GLASS_CONFIGS: Record<string, GlassConfig> = {
  glass_cosmos: {
    colors: ['#0e1a3a', '#080f28', '#040a1e', '#030618'],
    glowColor: 'rgba(0,140,255,0.25)',
    selfGlow: 'rgba(0,100,200,0.05)',
  },
  glass_amber: {
    colors: ['#1a0e02', '#120800', '#0a0500', '#080400'],
    glowColor: 'rgba(255,150,30,0.28)',
    selfGlow: 'rgba(200,120,10,0.05)',
  },
  glass_emerald: {
    colors: ['#041a0e', '#021008', '#010a04', '#010804'],
    glowColor: 'rgba(0,190,150,0.25)',
    selfGlow: 'rgba(0,140,110,0.05)',
  },
  glass_crimson: {
    colors: ['#1a0408', '#100206', '#0a0104', '#080103'],
    glowColor: 'rgba(255,55,55,0.28)',
    selfGlow: 'rgba(180,30,30,0.05)',
  },
  glass_violet: {
    colors: ['#120420', '#0a0214', '#06010c', '#04010a'],
    glowColor: 'rgba(150,65,240,0.25)',
    selfGlow: 'rgba(120,40,180,0.05)',
  },
  glass_arctic: {
    colors: ['#041218', '#020a10', '#01060c', '#01050a'],
    glowColor: 'rgba(0,200,190,0.25)',
    selfGlow: 'rgba(0,150,140,0.05)',
  },
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
        <View style={{ flex: 1, overflow: "hidden" }}>
          {/* Smooth diagonal gradient: warm bright top-left -> deep dark bottom-right */}
          <LinearGradient
            colors={glassConfig.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Top accent glow band - natural fade to transparent */}
          <LinearGradient
            colors={[glassConfig.glowColor, "transparent"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ position: "absolute", top: 0, left: 0, right: 0, height: "18%" }}
          />

          {/* Self-illuminating ambient across entire surface */}
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: glassConfig.selfGlow }} />

          {/* Top edge bright accent line */}
          <View style={{ position: "absolute", top: 0, left: "5%", right: "5%", height: 1.5, backgroundColor: glassConfig.glowColor, opacity: 0.5 }} />

          {/* Content layer */}
          <View style={{ flex: 1, flexDirection: "column" }}>
            {children}
          </View>
        </View>
      )
    }
    return (
      <View style={{ flex: 1, overflow: "hidden" }}>
        <ImageBackground
          style={{ position: "absolute", left: 0, top: 0, height: windowSize.height, width: windowSize.width, backgroundColor: theme["c-content-background"] }}
          source={theme["bg-image"]}
          resizeMode="cover"
        >
        </ImageBackground>
        <View style={{ flex: 1, flexDirection: "column", backgroundColor: theme["c-main-background"] }}>
          {children}
        </View>
      </View>
    )
  }, [children, theme, windowSize.height, windowSize.width, isGlassTheme, glassConfig])

  const picComponent = useMemo(() => {
    return (
      <View style={{ flex: 1, overflow: "hidden" }}>
        <ImageBackground
          style={{ position: "absolute", left: 0, top: 0, height: windowSize.height, width: windowSize.width, backgroundColor: theme["c-content-background"] }}
          resizeMode="cover"
          blurRadius={BLUR_RADIUS}
        >
          <View style={{ flex: 1, flexDirection: "column", backgroundColor: theme["c-content-background"], opacity: 0.76 }}></View>
        </ImageBackground>
        <View style={{ flex: 1, flexDirection: "column" }}>
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
