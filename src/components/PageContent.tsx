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

export default ({ children }: Props) => {
  const theme = useTheme()
  const windowSize = useWindowSize()
  const pic = useBgPic()
  const carWallpaper = useCarWallpaper()
  const isGlassTheme = theme.id === 'glass_cosmos'

  const themeComponent = useMemo(() => (
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
  ), [children, theme, windowSize.height, windowSize.width])

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

  const wallpaperComponent = useMemo(() => {
    return (
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <ImageBackground
          style={{ position: 'absolute', left: 0, top: 0, height: windowSize.height, width: windowSize.width, backgroundColor: isGlassTheme ? '#060A1E' : theme['c-content-background'] }}
          source={{ uri: carWallpaper! }}
          resizeMode="cover"
          blurRadius={BLUR_RADIUS}
        >
          <View style={{ flex: 1, backgroundColor: isGlassTheme ? 'rgba(6, 10, 30, 0.18)' : theme['c-content-background'], opacity: isGlassTheme ? 1 : 0.55 }}></View>
        </ImageBackground>
        <View style={{ flex: 1, flexDirection: 'column', backgroundColor: isGlassTheme ? 'rgba(6, 10, 30, 0.30)' : 'transparent' }}>
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
