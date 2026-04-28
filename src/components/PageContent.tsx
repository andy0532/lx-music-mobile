import { View } from 'react-native'
import { useTheme } from '@/store/theme/hook'
import ImageBackground from '@/components/common/ImageBackground'
import { useWindowSize } from '@/utils/hooks'
import { useMemo } from 'react'
import { scaleSizeAbsHR } from '@/utils/pixelRatio'
import SizeView from './SizeView'
import { useBgPic } from '@/store/common/hook'

interface GlassOverlay {
  selfGlow: string
  accentLine: string
}

const GLASS_OVERLAYS: Record<string, GlassOverlay> = {
  glass_cosmos: {
    selfGlow: 'rgba(0,100,220,0.03)',
    accentLine: 'rgba(0,140,255,0.4)',
  },
  glass_amber: {
    selfGlow: 'rgba(200,120,10,0.03)',
    accentLine: 'rgba(255,150,30,0.4)',
  },
  glass_emerald: {
    selfGlow: 'rgba(0,140,110,0.03)',
    accentLine: 'rgba(0,190,150,0.4)',
  },
  glass_crimson: {
    selfGlow: 'rgba(180,30,30,0.03)',
    accentLine: 'rgba(255,55,55,0.4)',
  },
  glass_violet: {
    selfGlow: 'rgba(120,40,180,0.03)',
    accentLine: 'rgba(150,65,240,0.4)',
  },
  glass_arctic: {
    selfGlow: 'rgba(0,150,140,0.03)',
    accentLine: 'rgba(0,200,190,0.4)',
  },
  glass_frost: {
    selfGlow: 'rgba(50,120,200,0.04)',
    accentLine: 'rgba(80,140,220,0.5)',
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
  const glassOverlay = isGlassTheme ? GLASS_OVERLAYS[theme.id] : null

  const themeComponent = useMemo(() => {
    // Glass themes: stretch gradient PNG to fill screen (no cropping)
    // Gradients look smooth when stretched, unlike photos
    const resizeMode = isGlassTheme ? 'stretch' : 'cover'

    return (
      <View style={{ flex: 1, overflow: "hidden" }}>
        <ImageBackground
          style={{ position: "absolute", left: 0, top: 0, height: windowSize.height, width: windowSize.width, backgroundColor: theme["c-content-background"] }}
          source={theme["bg-image"]}
          resizeMode={resizeMode}
        />

        {/* Self-illuminating ambient glow for glass themes */}
        {glassOverlay && (
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: glassOverlay.selfGlow }} />
        )}

        {/* Top accent line for glass themes */}
        {glassOverlay && (
          <View style={{ position: "absolute", top: 0, left: "5%", right: "5%", height: 1.5, backgroundColor: glassOverlay.accentLine }} />
        )}

        {/* Main content with semi-transparent overlay */}
        <View style={{ flex: 1, flexDirection: "column", backgroundColor: theme["c-main-background"] }}>
          {children}
        </View>
      </View>
    )
  }, [children, theme, windowSize.height, windowSize.width, isGlassTheme, glassOverlay])

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
