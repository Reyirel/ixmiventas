'use client';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

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
    } else if (!data.session) {
      Alert.alert('Verifica tu correo', 'Debes confirmar tu cuenta antes de iniciar sesión.');
    } else {
      router.push('/negocio-nuevo');
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
      // Abre el navegador para el flujo OAuth
      await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {/* Columna izquierda: ahora con dos filas */}
        <View style={styles.leftColumn}>
          {/* Fila superior: solo el título, transparente y sin bordes */}
          <View style={styles.titleRow}>
            <Text style={styles.appTitle}>Compra en Ixmiquilpan </Text>
            <Text style={styles.titulo2}>Tai ha Ntsotk ani</Text>
          </View>
          {/* Fila inferior: formulario, con bordes redondeados y sombra */}
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
            <Text style={styles.orText}>O inicia sesión con</Text>
            <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
              <View style={styles.googleButtonContent}>
                <Image
                  source={{
                    uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg',
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
        {/* Columna derecha: fondo guinda */}
        <View style={styles.rightColumn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    width: '90%',
    height: "70%",
    backgroundColor: 'transparent',
    gap: 16, // Espacio entre las columnas
  },
  leftColumn: {
    flex: 1,
    backgroundColor: 'transparent', // ahora transparente
    padding: 0,
    justifyContent: 'center',
    borderRadius: 20,
  },
  rightColumn: {
    flex: 2,
    backgroundColor: '#800020', // guinda
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
  titleContainer: {
    marginBottom: 20,
  },
  formContainer: {
    marginTop: 20,
  },
  titleRow: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    marginBottom: 16,
    paddingHorizontal: 32,
    paddingTop: 32,
    paddingBottom: 0,
    // Sin sombra ni bordes
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