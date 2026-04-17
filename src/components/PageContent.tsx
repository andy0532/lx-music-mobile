import { View, StyleSheet } from 'react-native'
import { useTheme } from '@/store/theme/hook'
import ImageBackground from '@/components/common/ImageBackground'
import { useWindowSize } from '@/utils/hooks'
import { scaleSizeAbsHR } from '@/utils/pixelRatio'
import { defaultHeaders } from './common/Image'
import SizeView from './SizeView'
import { useBgPic } from '@/store/common/hook'

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

const GlowDecorations = () => (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <View style={[glowStyles.glow, glowStyles.glowTopLeft]} />
    <View style={[glowStyles.glow, glowStyles.glowBottomRight]} />
    <View style={[glowStyles.glow, glowStyles.glowCenter]} />
    <View style={[glowStyles.glow, glowStyles.glowTopRight]} />
    <View style={glowStyles.beam} />
    <View style={glowStyles.beam2} />
  </View>
)

const glowStyles = StyleSheet.create({
  glow: { position: 'absolute', borderRadius: 999 },
  glowTopLeft: { top: -100, left: -80, width: 350, height: 350, backgroundColor: 'rgba(100, 60, 220, 0.25)' },
  glowBottomRight: { bottom: -80, right: -60, width: 300, height: 300, backgroundColor: 'rgba(0, 180, 200, 0.18)' },
  glowCenter: { top: '25%', left: '15%', width: 250, height: 250, backgroundColor: 'rgba(140, 100, 240, 0.10)' },
  glowTopRight: { top: -30, right: '10%', width: 180, height: 180, backgroundColor: 'rgba(180, 100, 160, 0.12)' },
  beam: { position: 'absolute', top: -50, left: '20%', width: 2, height: '130%', backgroundColor: 'rgba(160, 140, 255, 0.12)', transform: [{ rotate: '45deg' }] },
  beam2: { position: 'absolute', top: -50, left: '65%', width: 1.5, height: '140%', backgroundColor: 'rgba(80, 200, 240, 0.08)', transform: [{ rotate: '45deg' }] },
})

export default ({ children }: Props) => {
  const theme = useTheme()
  const windowSize = useWindowSize()
  const pic = useBgPic()

  return (
    <>
      <SizeView />
      <View style={{ flex: 1, overflow: 'hidden' }}>
        <DeepSpaceBackground width={windowSize.width} height={windowSize.height} />
        <GlowDecorations />
        {pic ? (
          <ImageBackground
            style={{ position: 'absolute', left: 0, top: 0, height: windowSize.height, width: windowSize.width }}
            source={{ uri: pic, headers: defaultHeaders }}
            resizeMode="cover"
            blurRadius={BLUR_RADIUS}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(6, 10, 30, 0.45)' }} />
          </ImageBackground>
        ) : null}
        <View style={{ flex: 1, flexDirection: 'column', backgroundColor: 'rgba(12, 18, 48, 0.55)' }}>
          {children}
        </View>
      </View>
    </>
  )
}
