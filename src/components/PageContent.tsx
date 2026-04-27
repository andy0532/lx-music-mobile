import { View } from 'react-native'
import { useTheme } from '@/store/theme/hook'
import ImageBackground from '@/components/common/ImageBackground'
import { useWindowSize } from '@/utils/hooks'
import { useMemo } from 'react'
import { scaleSizeAbsHR } from '@/utils/pixelRatio'
import SizeView from './SizeView'
import { useBgPic } from '@/store/common/hook'

interface Props {
  children: React.ReactNode
}

const BLUR_RADIUS = Math.max(scaleSizeAbsHR(18), 10)

export default ({ children }: Props) => {
  const theme = useTheme()
  const windowSize = useWindowSize()
  const pic = useBgPic()

  const themeComponent = useMemo(() => {
    return (
      <View style={{ flex: 1, overflow: "hidden" }}>
        <ImageBackground
          style={{ position: "absolute", left: 0, top: 0, height: windowSize.height, width: windowSize.width, backgroundColor: theme["c-content-background"] }}
          source={theme["bg-image"]}
          resizeMode="cover"
        />
        <View style={{ flex: 1, flexDirection: "column", backgroundColor: theme["c-main-background"] }}>
          {children}
        </View>
      </View>
    )
  }, [children, theme, windowSize.height, windowSize.width])

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
