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

const DeepSpaceBackground = ({ width, height }: { width: number; height: number }) => (
  <View style={{ position: 'absolute', left: 0, top: 0, width, height }}>
    <View style={{ flex: 1, backgroundColor: '#060A1E' }} />
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '45%', backgroundColor: 'rgba(20, 10, 60, 0.5)' }} />
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', backgroundColor: 'rgba(5, 20, 50, 0.4)' }} />
  </View>
)

const GlowDecorations = ({ width, height }: { width: number; height: number }) => (
  <View style={{ position: 'absolute', left: 0, top: 0, width, height }} pointerEvents="none">
    <View style={{
      position: 'absolute', top: height * 0.05, left: -width * 0.1,
      width: width * 0.5, height: width * 0.5,
      borderRadius: width * 0.25,
      backgroundColor: 'rgba(60, 100, 255, 0.12)',
    }} />
    <View style={{
      position: 'absolute', bottom: height * 0.1, right: -width * 0.05,
      width: width * 0.4, height: width * 0.4,
      borderRadius: width * 0.2,
      backgroundColor: 'rgba(140, 80, 255, 0.10)',
    }} />
    <View style={{
      position: 'absolute', top: 0, right: width * 0.2,
      width: width * 0.03, height: height * 0.6,
      backgroundColor: 'rgba(100, 160, 255, 0.06)',
      transform: [{ rotate: '45deg' }],
    }} />
  </View>
)

export default ({ children }: Props) => {
  const theme = useTheme()
  const windowSize = useWindowSize()
  const pic = useBgPic()
  const carWallpaper = useCarWallpaper()
  const wallpaperUri = carWallpaper || pic
  const isGlassTheme = theme.id === 'glass_cosmos'

  const content = useMemo(() => {
    if (isGlassTheme) {
      return (
        <View style={{ flex: 1, overflow: 'hidden' }}>
          <DeepSpaceBackground width={windowSize.width} height={windowSize.height} />
          <GlowDecorations width={windowSize.width} height={windowSize.height} />
          {wallpaperUri ? (
            <ImageBackground
              style={{ position: 'absolute', left: 0, top: 0, height: windowSize.height, width: windowSize.width }}
              source={{ uri: wallpaperUri }}
              resizeMode="cover"
              blurRadius={BLUR_RADIUS}
            >
              <View style={{ flex: 1, backgroundColor: 'rgba(6, 10, 30, 0.18)' }} />
            </ImageBackground>
          ) : null}
          <View style={{ flex: 1, flexDirection: 'column', backgroundColor: wallpaperUri ? 'rgba(6, 10, 30, 0.30)' : 'transparent' }}>
            {children}
          </View>
        </View>
      )
    }
    if (wallpaperUri) {
      return (
        <View style={{ flex: 1, overflow: 'hidden' }}>
          <ImageBackground
            style={{ position: 'absolute', left: 0, top: 0, height: windowSize.height, width: windowSize.width }}
            source={{ uri: wallpaperUri, headers: defaultHeaders }}
            resizeMode="cover"
            blurRadius={BLUR_RADIUS}
          >
            <View style={{ flex: 1, backgroundColor: theme['c-content-background'], opacity: 0.55 }} />
          </ImageBackground>
          <View style={{ flex: 1, flexDirection: 'column', backgroundColor: theme['c-main-background'], opacity: 0.78 }}>
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
        />
        <View style={{ flex: 1, flexDirection: 'column', backgroundColor: theme['c-main-background'] }}>
          {children}
        </View>
      </View>
    )
  }, [children, theme, wallpaperUri, windowSize.height, windowSize.width, isGlassTheme])

  return (
    <>
      <SizeView />
      {content}
    </>
  )
}
