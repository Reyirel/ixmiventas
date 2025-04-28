import { View, Text, Image, StyleSheet, Pressable, ScrollView, useWindowDimensions, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const isMobileOrTablet = width < 900;
  const isSmallDevice = width < 380;

  const dynamicStyles = StyleSheet.create({
    contentRow: {
      flexDirection: isMobileOrTablet ? 'column' : 'row',
      padding: isSmallDevice ? 5 : 10,
      marginBottom: 20,
    },
    imageColumn: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: isMobileOrTablet ? '100%' : undefined,
      marginBottom: isMobileOrTablet ? 20 : 0,
    },
    textColumn: {
      flex: 1,
      justifyContent: 'center',
      alignItems: isMobileOrTablet ? 'center' : 'flex-start',
      padding: isSmallDevice ? 5 : 10,
      width: isMobileOrTablet ? '100%' : undefined,
    },
    mainTitle: {
      fontSize: isSmallDevice ? 24 : (isMobileOrTablet ? 32 : 48),
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 8,
      textAlign: isMobileOrTablet ? 'center' : 'left',
    },
    goldSubtitle: {
      fontSize: isSmallDevice ? 24 : (isMobileOrTablet ? 32 : 48),
      fontWeight: 'bold',
      color: '#E1CB7A',
      marginBottom: 16,
      textAlign: isMobileOrTablet ? 'center' : 'left',
    },
    description: {
      fontSize: isSmallDevice ? 14 : 16,
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: 24,
      lineHeight: isSmallDevice ? 20 : 22,
      textAlign: isMobileOrTablet ? 'center' : 'left',
      paddingHorizontal: isSmallDevice ? 5 : 0,
    },
    button: {
      backgroundColor: 'white',
      paddingVertical: 10,
      paddingHorizontal: isSmallDevice ? 30 : (isMobileOrTablet ? 40 : 100),
      borderRadius: 15,
      elevation: 2,
      alignSelf: 'center',
      marginBottom: 20,
    },
    welcomeImage: {
      width: '100%',
      height: isSmallDevice ? 150 : (isMobileOrTablet ? 200 : '80%'),
      maxWidth: 350,
      resizeMode: 'contain',
    },
    logo: {
      width: isSmallDevice ? 150 : (isMobileOrTablet ? 200 : 300),
      height: isSmallDevice ? 150 : (isMobileOrTablet ? 200 : 300),
    },
  });

  return (
    <LinearGradient
      colors={['#C24747', '#7a2a2a', '#260909']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Primera fila - Logo centrado */}
        <View style={styles.logoRow}>
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
                <Text style={styles.buttonText}>Iniciar</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>

      {/* Footer con logos alternados */}
      <View style={styles.footer}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.footerContent}
        >
          {[...Array(30)].map((_, index) => (
            <Image 
              key={index}
              source={index % 2 === 0 
                ? require('../assets/images/image2.png')
                : require('../assets/images/image3.png')} 
              style={styles.footerLogo} 
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
  logoRow: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  footer: {
    backgroundColor: '#B4A673',
    height: 60,
    justifyContent: 'center',
  },
  footerContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  footerLogo: {
    width: 40,
    height: 40,
    marginHorizontal: 15,
  },
  buttonText: {
    color: '#8B0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});