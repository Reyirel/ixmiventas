import { View, Text, Image, StyleSheet, Pressable, ScrollView, useWindowDimensions, SafeAreaView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const isMobileOrTablet = width < 900;
  const isSmallDevice = width < 380;
  const isIOS = Platform.OS === 'ios';
  const isiPhone = isIOS && width < 430;

  const dynamicStyles = StyleSheet.create({
    contentRow: {
      flexDirection: isMobileOrTablet ? 'column' : 'row',
      padding: isiPhone ? 2 : (isSmallDevice ? 4 : 10),
      marginBottom: isiPhone ? 5 : 15,
    },
    imageColumn: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: isMobileOrTablet ? '100%' : undefined,
      marginBottom: isiPhone ? 5 : (isMobileOrTablet ? 15 : 0),
    },
    textColumn: {
      flex: 1,
      justifyContent: 'center',
      alignItems: isMobileOrTablet ? 'center' : 'flex-start',
      padding: isiPhone ? 0 : (isSmallDevice ? 3 : 8),
      width: isMobileOrTablet ? '100%' : undefined,
    },
    mainTitle: {
      fontSize: isiPhone ? 20 : (isSmallDevice ? 22 : (isMobileOrTablet ? 28 : 48)),
      fontWeight: 'bold',
      color: 'white',
      marginBottom: isiPhone ? 2 : 6,
      textAlign: isMobileOrTablet ? 'center' : 'left',
    },
    goldSubtitle: {
      fontSize: isiPhone ? 20 : (isSmallDevice ? 22 : (isMobileOrTablet ? 28 : 48)),
      fontWeight: 'bold',
      color: '#E1CB7A',
      marginBottom: isiPhone ? 4 : 12,
      textAlign: isMobileOrTablet ? 'center' : 'left',
    },
    description: {
      fontSize: isiPhone ? 12 : (isSmallDevice ? 13 : 16),
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: isiPhone ? 10 : 18,
      lineHeight: isiPhone ? 16 : (isSmallDevice ? 18 : 22),
      textAlign: isMobileOrTablet ? 'center' : 'left',
      paddingHorizontal: isiPhone ? 0 : (isSmallDevice ? 3 : 0),
    },
    button: {
      backgroundColor: 'white',
      paddingVertical: isiPhone ? 6 : 8,
      paddingHorizontal: isiPhone ? 20 : (isSmallDevice ? 25 : (isMobileOrTablet ? 35 : 80)),
      borderRadius: 15,
      elevation: 2,
      alignSelf: 'center',
      marginBottom: isiPhone ? 6 : 15,
    },
    welcomeImage: {
      width: '100%',
      height: isiPhone ? 110 : (isSmallDevice ? 130 : (isMobileOrTablet ? 180 : '80%')),
      maxWidth: isiPhone ? 280 : 350,
      resizeMode: 'contain',
    },
    logo: {
      width: isiPhone ? 100 : (isSmallDevice ? 130 : (isMobileOrTablet ? 180 : 300)),
      height: isiPhone ? 100 : (isSmallDevice ? 130 : (isMobileOrTablet ? 180 : 300)),
    },
  });

  return (
    <LinearGradient
      colors={['#C24747', '#7a2a2a', '#260909']}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContainer, 
          isiPhone && styles.iphoneScrollContainer
        ]}
      >
        {/* Primera fila - Logo centrado */}
        <View style={[styles.logoRow, isiPhone && styles.iphoneLogoRow]}>
          <Image
            source={require('../assets/images/logo.png')}
            style={dynamicStyles.logo}
            resizeMode="contain"
          />
        </View>
        
        {/* Segunda fila - Imagen y texto con botón */}
        <View style={dynamicStyles.contentRow}>
          {/* Columna izquierda - Imagen */}
          <View style={dynamicStyles.imageColumn}>
            <Image
              source={require('../assets/images/image1.png')}
              style={dynamicStyles.welcomeImage}
              resizeMode="contain"
            />
          </View>
          
          {/* Columna derecha - Texto y botón */}
          <View style={dynamicStyles.textColumn}>
            <Text style={dynamicStyles.mainTitle}>Compra en Ixmiquilpan</Text>
            <Text style={dynamicStyles.goldSubtitle}>Tai ha Ntsotk ani</Text>
            <Text style={dynamicStyles.description}>
              Explora y apoya los mejores negocios locales de Ixmiquilpan. Conectamos 
              a comerciantes y clientes para impulsar la economía de nuestra región.
            </Text>
            <Link href="/negocios" asChild>
              <Pressable style={dynamicStyles.button}>
                <Text style={[styles.buttonText, isiPhone && styles.iphoneButtonText]}>Iniciar</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>

      {/* Footer con logos alternados */}
      <View style={[styles.footer, isiPhone && styles.iphoneFooter]}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.footerContent}
        >
          {[...Array(isiPhone ? 12 : 30)].map((_, index) => (
            <Image 
              key={index}
              source={index % 2 === 0 
                ? require('../assets/images/image2.png')
                : require('../assets/images/image3.png')} 
              style={[styles.footerLogo, isiPhone && styles.iphoneFooterLogo]} 
              resizeMode="contain"
            />
          ))}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  iphoneScrollContainer: {
    paddingTop: 0,
    paddingBottom: 0,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  logoRow: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  iphoneLogoRow: {
    paddingTop: 2,
    paddingBottom: 2,
  },
  footer: {
    backgroundColor: '#B4A673',
    height: 60,
    justifyContent: 'center',
  },
  iphoneFooter: {
    height: 50,
  },
  footerContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  footerLogo: {
    width: 40,
    height: 40,
    marginHorizontal: 15,
  },
  iphoneFooterLogo: {
    width: 30,
    height: 30,
    marginHorizontal: 8,
  },
  buttonText: {
    color: '#8B0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iphoneButtonText: {
    fontSize: 14,
  },
});