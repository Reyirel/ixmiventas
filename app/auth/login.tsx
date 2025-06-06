'use client';
import { useState, useRef, useEffect } from 'react';
import { Animated, View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, useWindowDimensions, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  
  const { width, height } = useWindowDimensions();
  const [isMobile, setIsMobile] = useState(width < 768);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    setIsMobile(width < 768);
  }, [width]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true
      })
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos requeridos', 'Por favor ingresa tu email y contraseña.');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    const { data: perfilData, error: perfilError } = await supabase
      .from('perfiles')
      .select('tipo_usuario')
      .eq('user_id', data.user.id)
      .single();

    if (perfilError || !perfilData) {
      Alert.alert('Error', 'No se pudo obtener el perfil');
      return;
    }

    if (perfilData.tipo_usuario === 'admin') {
      router.replace('/admin');
    } else if (perfilData.tipo_usuario === 'negocio') {
      router.replace('/negocio-nuevo');
    } else {
      router.replace('/negocios');
    }
  };

  const handleGoogleLogin = async () => {
    const redirectTo = Linking.createURL('/auth/callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) {
      Alert.alert('Error', error.message);
    } else if (data?.url) {
      await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    }
  };

  // Renderizado para móvil
  if (isMobile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.mobileContainer}>
          <Animated.View
            style={[
              styles.mobileContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            {/* Header móvil con gradiente */}
            <View style={styles.mobileHeader}>
              <TouchableOpacity 
                style={styles.mobileBackButton} 
                onPress={() => router.push('/')}
              >
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.mobileAppTitle}>
                Compra en Ixmiquilpan 
              </Text>
              <Text style={styles.mobileTitulo2}>
                Tai ha Ntsotk ani
              </Text>
            </View>

            {/* Formulario móvil */}
            <View style={styles.mobileForm}>
              <Text style={styles.mobileLoginTitle}>Iniciar sesión</Text>
              <Text style={styles.mobileSubtitle}>Ingresa tus credenciales para continuar</Text>
              
              <TextInput
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                style={styles.mobileInput}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholderTextColor="#999"
              />
              
              <View style={styles.mobilePasswordContainer}>
                <TextInput
                  placeholder="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.mobilePasswordInput}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)} 
                  style={styles.mobilePasswordIcon}
                >
                  <Ionicons 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={22} 
                    color="#800020" 
                  />
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={styles.mobileLoginButton} onPress={handleLogin}>
                <Text style={styles.mobileLoginButtonText}>Iniciar Sesión</Text>
              </TouchableOpacity>
              
              <Text style={styles.mobileOrText}>- O inicia sesión con -</Text>
              
              <TouchableOpacity style={styles.mobileGoogleButton} onPress={handleGoogleLogin}>
                <View style={styles.mobileGoogleButtonContent}>
                  <Image
                    source={{
                      uri: 'https://static.vecteezy.com/system/resources/previews/022/613/027/non_2x/google-icon-logo-symbol-free-png.png',
                    }}
                    style={styles.mobileGoogleIcon}
                  />
                  <Text style={styles.mobileGoogleButtonText}>Google</Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.mobileRegisterContainer}>
                <Text style={styles.mobileRegisterText}>¿No tienes cuenta? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/register')}>
                  <Text style={styles.mobileRegisterLink}>Regístrate</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  // Renderizado para desktop/tablet (código existente)
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.row,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              flexDirection: 'row',
              width: '100%',
              maxWidth: 1200,
              height: "75%",
              alignSelf: 'center'
            }
          ]}
        >
          <View style={styles.leftColumn}>
            <View style={styles.titleRow}>
              <Text style={styles.appTitle}>
                Compra en Ixmiquilpan 
              </Text>
              <Text style={styles.titulo2}>
                Tai ha Ntsotk ani
              </Text>
            </View>
            <View style={styles.formRow}>
              <Text style={styles.loginTitle}>Iniciar sesión</Text>
              <Text style={styles.subtitle}>Ingresa tus credenciales para continuar</Text>
              <TextInput
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  placeholder="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={styles.passwordInput}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)} 
                  style={styles.passwordIcon}
                >
                  <Ionicons 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={24} 
                    color="#800020" 
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
              </TouchableOpacity>
              <Text style={styles.orText}>- O inicia sesión con -</Text>
              <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                <View style={styles.googleButtonContent}>
                  <Image
                    source={{
                      uri: 'https://static.vecteezy.com/system/resources/previews/022/613/027/non_2x/google-icon-logo-symbol-free-png.png',
                    }}
                    style={styles.googleIcon}
                  />
                  <Text style={styles.googleButtonText}>Google</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.registerContainer}>
                <Text>¿No tienes cuenta? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/register')}>
                  <Text style={styles.registerText}>Regístrate</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View style={styles.rightColumn} />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: Platform.OS === 'web' ? 16 : 8,
  },
  
  // Estilos móviles
  mobileContainer: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  mobileContent: {
    flex: 1,
  },
  mobileHeader: {
    backgroundColor: '#800020',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
  },
  mobileBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  mobileAppTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 20,
  },
  mobileTitulo2: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E1CB7A',
    textAlign: 'center',
  },
  mobileForm: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  mobileLoginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  mobileSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  mobileInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  mobilePasswordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  mobilePasswordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  mobilePasswordIcon: {
    paddingHorizontal: 16,
  },
  mobileLoginButton: {
    backgroundColor: '#800020',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#800020',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  mobileLoginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  mobileOrText: {
    textAlign: 'center',
    marginVertical: 16,
    color: '#888',
    fontSize: 14,
  },
  mobileGoogleButton: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mobileGoogleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileGoogleIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  mobileGoogleButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
  mobileRegisterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  mobileRegisterText: {
    color: '#666',
    fontSize: 16,
  },
  mobileRegisterLink: {
    color: '#800020',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mobileBackButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 8,
  },

  // Estilos desktop existentes
  row: {
    gap: 16,
    backgroundColor: 'transparent',
  },
  leftColumn: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 0,
    justifyContent: 'center',
    borderRadius: 20,
  },
  rightColumn: {
    flex: 2,
    backgroundColor: '#800020',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#800020',
    textAlign: 'left',
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    color: '#222',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fafafa',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
  },
  passwordIcon: {
    paddingHorizontal: 12,
  },
  loginButton: {
    backgroundColor: '#800020',
    borderRadius: 8,
    paddingVertical: 15,
    marginVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 12,
    color: '#888',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
  },
  googleButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  registerText: {
    color: '#800020',
    fontWeight: 'bold',
  },
  titulo2: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#E1CB7A',
    textAlign: 'left',
  },
  titleRow: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    marginBottom: 16,
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 0,
  },
  formRow: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 0,
  },
});