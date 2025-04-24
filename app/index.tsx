import { View, Text, Image, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  return (
    <LinearGradient
      colors={['#C24747', '#7a2a2a', '#260909']}
      style={styles.container}
    >
      {/* Primera fila - Logo centrado */}
      <View style={styles.logoRow}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      {/* Segunda fila - Imagen y texto con botón */}
      <View style={styles.contentRow}>
        {/* Columna izquierda - Imagen */}
        <View style={styles.imageColumn}>
          <Image
            source={require('../assets/images/image1.png')}
            style={styles.welcomeImage}
            resizeMode="contain"
          />
        </View>
        
        {/* Columna derecha - Texto y botón */}
        <View style={styles.textColumn}>
          <Text style={styles.mainTitle}>Compra en Ixmiquilpan</Text>
          <Text style={styles.goldSubtitle}>Tai ha Ntsotk ani</Text>
          <Text style={styles.description}>
            Explora y apoya los mejores negocios locales de Ixmiquilpan. Conectamos 
            a comerciantes y clientes para impulsar la economía de nuestra región.
          </Text>
          <Link href="/negocios" asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>Iniciar</Text>
            </Pressable>
          </Link>
        </View>
      </View>

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
  logoRow: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  logo: {
    width: 300,
    height: 300,
  },
  contentRow: {
    flex: 3,
    flexDirection: 'row',
    padding: 1,
  },
  imageColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 10,
  },
  welcomeImage: {
    width: '100%',
    height: '80%',
  },
  mainTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'left',
  },
  goldSubtitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#E1CB7A',
    marginBottom: 16,
    textAlign: 'left',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 24,
    lineHeight: 22,
    textAlign: 'left',
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 100,
    borderRadius: 15,
    elevation: 2,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#8B0000',
    fontSize: 16,
    fontWeight: 'bold',
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
  }
});