#!/bin/bash
set -e
echo "=== 车机版改造 ==="

# 1. 强制横屏
sed -i 's/export const isHorizontalMode = () => {/export const isHorizontalMode = () => {\n  return true \/\/ car-mode/' src/utils/tools.ts

# 2. 默认字体1.3
sed -i 's/theme\.id: *['"'"'""]*[^'"'"'""]*['"'"'""]*/theme.id: '"'"'glass_cosmos'"'"'/' src/config/defaultSetting.ts
sed -i 's/theme\.lightId: *['"'"'""]*[^'"'"'""]*['"'"'""]*/theme.lightId: '"'"'glass_cosmos'"'"'/' src/config/defaultSetting.ts
sed -i 's/theme\.darkId: *['"'"'""]*[^'"'"'""]*['"'"'""]*/theme.darkId: '"'"'glass_cosmos'"'"'/' src/config/defaultSetting.ts

# 3. 添加主题并重新生成
node -e "
const fs=require('fs');
let c=fs.readFileSync('src/theme/themes/createThemes.js','utf8');
if(!c.includes('glass_cosmos')){
  const t=\",\\n{\\n  id: 'glass_cosmos',\\n  name: '深空幻境',\\n  isDark: true,\\n  config: {\\n    primary: 'rgb(99,102,241)',\\n    font: 'rgb(229,231,255)',\\n    'c-app-background': 'rgba(15,23,42,0.85)',\\n    'c-main-background': 'rgba(15,23,42,0.75)',\\n    'bg-image': 'landingMoon.png',\\n    'bg-image-position': 'center',\\n    'bg-image-size': 'cover',\\n    'c-badge-primary': 'var(c-primary)',\\n    'c-badge-secondary': 'var(c-primary-dark-300)',\\n    'c-badge-tertiary': 'var(c-primary-light-200)',\\n  },\\n}\";
  c=c.replace(/\\](\\s*;?\\s*$)/,t+'\\n]$1');
  fs.writeFileSync('src/theme/themes/createThemes.js',c);
}
"
node src/theme/themes/createThemes.js

# 4. 光晕+壁纸按钮+字体选项+翻译
node -e "
const fs=require('fs');
const R=p=>fs.readFileSync(p,'utf8');
const W=(p,c)=>fs.writeFileSync(p,c,'utf8');

// GlowDecorations in PageContent
let pc=R('src/components/PageContent.tsx');
if(!pc.includes('GlowDecorations')){
  pc=pc.replace(/(import\s+\{)(.*?)(\}\s+from\s+'react-native')/,(m,a,b,c)=>b.includes('StyleSheet')?m:a+b+', StyleSheet'+c);
  const glow=\`
const GlowDecorations = () => (
  <View style={StyleSheet.absoluteFillObject} pointerEvents=\"none\">
    <View style={{position:'absolute',top:-100,right:-80,width:300,height:300,borderRadius:150,backgroundColor:'rgba(147,51,234,0.12)'}} />
    <View style={{position:'absolute',bottom:-80,left:-60,width:280,height:280,borderRadius:140,backgroundColor:'rgba(59,130,246,0.12)'}} />
    <View style={{position:'absolute',top:'40%',left:'20%',width:240,height:240,borderRadius:120,backgroundColor:'rgba(16,185,129,0.08)'}} />
    <View style={{position:'absolute',top:-200,left:'30%',width:1.5,height:700,backgroundColor:'rgba(139,92,246,0.1)',transform:[{rotate:'45deg'}]}} />
    <View style={{position:'absolute',top:-200,left:'60%',width:1.5,height:700,backgroundColor:'rgba(59,130,246,0.1)',transform:[{rotate:'45deg'}]}} />
  </View>
);
\`;
  pc=pc.replace(/export default/,glow+'export default');
  pc=pc.replace(/(<View[^>]*style=\{themeComponent\}[^>]*>)/g,'\$1\\n        <GlowDecorations />');
  pc=pc.replace(/(<View[^>]*style=\{picComponent\}[^>]*>)/g,'\$1\\n        <GlowDecorations />');
  W('src/components/PageContent.tsx',pc);
}

// WallpaperBtn in Aside
let aside=R('src/screens/Home/Horizontal/Aside.tsx');
if(!aside.includes('WallpaperBtn')){
  aside=aside.replace(/(import\s+\{)(.*?)(\}\s+from\s+'react-native')/,(m,a,b,c)=>b.includes('Alert')?m:a+b+', Alert'+c);
  if(!aside.includes('useBgPic'))aside=\"import { useBgPic, setBgPic } from '@/store/common/hook';\\n\"+aside;
  if(!aside.includes('selectFile'))aside=\"import { selectFile } from '@/utils/fs';\\n\"+aside;
  const wp=\`
const WallpaperBtn = () => {
  const bgPic = useBgPic()
  const handlePress = async () => {
    try { const r = await selectFile({type:'image/*',allowMultiple:false}); if(r&&r.uri) setBgPic(r.uri) } catch(e) { Alert.alert('提示','选择壁纸失败') }
  }
  return (
    <TouchableOpacity style={{alignItems:'center',padding:10,opacity:0.8}} onPress={handlePress} onLongPress={()=>Alert.alert('清除壁纸','确定?',[{text:'取消',style:'cancel'},{text:'确定',onPress:()=>setBgPic('')}])} activeOpacity={0.7}>
      <Text style={{color:'#818cf8',fontSize:18}}>{'🖼'}</Text>
      <Text style={{color:'#818cf8',fontSize:10,marginTop:4}}>壁纸</Text>
    </TouchableOpacity>
  )
}
\`;
  aside=aside.replace(/export default/,wp+'export default');
  // Add before last </View> in render
  const lv=aside.lastIndexOf('</View>');
  const pv=aside.lastIndexOf('</View>',lv-1);
  if(pv>-1)aside=aside.slice(0,pv)+'        <WallpaperBtn />\\n'+aside.slice(pv);
  W('src/screens/Home/Horizontal/Aside.tsx',aside);
}

// Font size options
let fs2=R('src/screens/Home/Views/Setting/settings/Basic/FontSize.tsx');
if(!fs2.includes('1.4')){
  fs2=fs2.replace(/(value:\s*1\.3[^}]*\})/,'\$1,\\n  { value: 1.4, labelId: \"setting_basic_font_size_140\" },\\n  { value: 1.5, labelId: \"setting_basic_font_size_150\" }');
  W('src/screens/Home/Views/Setting/settings/Basic/FontSize.tsx',fs2);
}

// Translations
let zh=R('src/lang/zh-cn.json');
if(!zh.includes('setting_basic_font_size_140')){
  zh=zh.replace(/(\\n\\s*\\})\\s*$/, ',\\n  \"setting_basic_font_size_140\": \"超大\",\\n  \"setting_basic_font_size_150\": \"极大\"\\$1');
  W('src/lang/zh-cn.json',zh);
}

// Default fontSize 1.3
let data=R('src/utils/data.ts');
data=data.replace(/(getFontSize[\\s\\S]*?return\\s+)1(?![.\\d])/, '\$11.3');
W('src/utils/data.ts',data);
"
echo "=== 完成 ==="
