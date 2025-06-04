'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [userType, setUserType] = useState('usuario');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.8)).current;
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768; // Punto de quiebre para móviles
  
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

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow', () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide', () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const validatePassword = () => {
    return password.length >= 6;
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const showSuccessAnimation = () => {
    setShowSuccessModal(true);
    // Resetear valores de animación antes de iniciar
    modalFadeAnim.setValue(0);
    modalScaleAnim.setValue(0.8);
    
    Animated.parallel([
      Animated.timing(modalFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true
      })
    ]).start();
  };

  const hideSuccessModal = () => {
    Animated.parallel([
      Animated.timing(modalFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(modalScaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      setShowSuccessModal(false);
      router.push('/auth/login');
    });
  };

  const handleRegister = async () => {
    if (!validateEmail()) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (!validatePassword()) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    // Activa el loader
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data && data.user) {
        const { error: profileError } = await supabase
          .from('perfiles')
          .insert([
            { 
              user_id: data.user.id, 
              email: email,
              tipo_usuario: userType,
              created_at: new Date().toISOString()
            }
          ]);
        
        if (profileError) {
          console.error('Error al insertar perfil:', profileError);
          // Considera manejar específicamente este error para mostrar un mensaje adecuado
        }
      }
      
      // Mostrar notificación de éxito
      setNotification({
        show: true,
        type: 'success',
        message: `¡Registro exitoso! Te hemos enviado un correo a ${email}`
      });
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
      
    } catch (error) {
      console.log('Error en registro:', error);
      setNotification({
        show: true,
        type: 'error',
        message: error.message || 'No se pudo completar el registro'
      });
    } finally {
      // Desactiva el loader sin importar el resultado
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={[
          isSmallScreen ? styles.columnSmall : styles.row,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}>
          <Animated.View 
            style={[
              isSmallScreen ? styles.leftColumnSmall : styles.leftColumn,
              { opacity: isKeyboardVisible ? 0.4 : fadeAnim }
            ]}
          >
            <View style={styles.circleContainer}>
              <View style={[styles.circle, styles.circle1]} />
              <View style={[styles.circle, styles.circle2]} />
              <View style={[styles.circle, styles.circle3]} />
            </View>
            <Text style={styles.welcomeText}>¡Bienvenido!</Text>
            <Text style={styles.welcomeSubtext}>Únete a la comunidad de comercios en Ixmiquilpan</Text>
          </Animated.View>
          
          <View style={isSmallScreen ? styles.rightColumnSmall : styles.rightColumn}>
            {!isSmallScreen && (
              <View style={styles.titleRow}>
                <Text style={styles.appTitle}>Compra en Ixmiquilpan</Text>
                <Text style={styles.titulo2}>Tai ha Ntsotk ani</Text>
              </View>
            )}
            
            <Animated.View 
              style={[styles.formRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
            >
              <Text style={styles.registerTitle}>Crear cuenta</Text>
              <Text style={styles.subtitle}>Ingresa tus datos para registrarte</Text>
              
              <View style={styles.userTypeContainer}>
                <Text style={styles.userTypeLabel}>Tipo de cuenta:</Text>
                <View style={styles.userTypeOptions}>
                  <TouchableOpacity 
                    style={[
                      styles.userTypeButton, 
                      userType === 'usuario' && styles.userTypeButtonActive
                    ]}
                    onPress={() => setUserType('usuario')}
                  >
                    <Ionicons 
                      name="person" 
                      size={18} 
                      color={userType === 'usuario' ? '#fff' : '#800020'} 
                    />
                    <Text style={[
                      styles.userTypeText,
                      userType === 'usuario' && styles.userTypeTextActive
                    ]}>Usuario</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.userTypeButton, 
                      userType === 'negocio' && styles.userTypeButtonActive
                    ]}
                    onPress={() => setUserType('negocio')}
                  >
                    <Ionicons 
                      name="business" 
                      size={18} 
                      color={userType === 'negocio' ? '#fff' : '#800020'} 
                    />
                    <Text style={[
                      styles.userTypeText,
                      userType === 'negocio' && styles.userTypeTextActive
                    ]}>Negocio</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#800020" style={styles.inputIcon} />
                <TextInput
                  placeholder="Correo electrónico"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {email ? (
                  <Ionicons 
                    name={validateEmail() ? "checkmark-circle" : "alert-circle"} 
                    size={20} 
                    color={validateEmail() ? "#4CAF50" : "#FF5722"} 
                    style={styles.validationIcon} 
                  />
                ) : null}
              </View>
              
              <View style={styles.passwordContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#800020" style={styles.inputIcon} />
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

              <View style={styles.passwordContainer}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#800020" style={styles.inputIcon} />
                <TextInput
                  placeholder="Confirmar contraseña"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  style={styles.passwordInput}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                  style={styles.passwordIcon}
                >
                  <Ionicons 
                    name={showConfirmPassword ? 'eye-off' : 'eye'} 
                    size={24} 
                    color="#800020" 
                  />
                </TouchableOpacity>
              </View>
              
              {password && confirmPassword ? (
                <Text style={[
                  styles.passwordMatch, 
                  {color: password === confirmPassword ? '#4CAF50' : '#FF5722'}
                ]}>
                  {password === confirmPassword 
                    ? '✓ Las contraseñas coinciden' 
                    : '✗ Las contraseñas no coinciden'}
                </Text>
              ) : null}
              
              <TouchableOpacity 
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]} 
                onPress={handleRegister}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.registerButtonText}>Procesando...</Text>
                  </View>
                ) : (
                  <Text style={styles.registerButtonText}>Crear cuenta</Text>
                )}
              </TouchableOpacity>
              
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                  <Text style={styles.loginLink}>Iniciar sesión</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Modal de éxito - Versión mejorada para móviles */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="none"
        onRequestClose={hideSuccessModal}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                opacity: modalFadeAnim,
                transform: [{ scale: modalScaleAnim }]
              }
            ]}
          >
            <View style={styles.successIcon}>
              <Ionicons name="mail" size={50} color="#4CAF50" />
            </View>
            
            <Text style={styles.successTitle}>¡Registro exitoso!</Text>
            
            <Text style={styles.successMessage}>
              Te hemos enviado un correo de confirmación a{'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
            
            <Text style={styles.successSubMessage}>
              Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
            </Text>
            
            <TouchableOpacity 
              style={styles.successButton}
              onPress={hideSuccessModal}
              activeOpacity={0.8}
            >
              <Ionicons name="log-in-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.successButtonText}>Ir al Login</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Notificación temporal */}
      {notification.show && (
        <View style={[
          styles.notification,
          notification.type === 'success' ? styles.notificationSuccess : styles.notificationError
        ]}>
          <Text style={styles.notificationText}>{notification.message}</Text>
          <TouchableOpacity 
            onPress={() => setNotification({ show: false, type: '', message: '' })}
            style={styles.notificationClose}
          >
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    width: '90%',
    height: "80%", 
    backgroundColor: 'transparent',
    gap: 16,
    maxHeight: 700,
  },
  columnSmall: {
    flexDirection: 'column',
    width: '100%',
    backgroundColor: 'transparent',
    gap: 16,
  },
  leftColumn: {
    flex: 2,
    backgroundColor: '#800020',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  leftColumnSmall: {
    width: '100%',
    height: 180,
    backgroundColor: '#800020',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  rightColumn: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 0,
    justifyContent: 'center',
    borderRadius: 20,
  },
  rightColumnSmall: {
    width: '100%',
    backgroundColor: 'transparent',
    padding: 0,
    justifyContent: 'center',
    borderRadius: 20,
  },
  circleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  circle: {
    position: 'absolute',
    borderRadius: 150,
    backgroundColor: 'rgba(225, 203, 122, 0.15)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: 50,
    left: -40,
  },
  circle3: {
    width: 100,
    height: 100,
    bottom: -30,
    right: 40,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#800020',
    textAlign: 'left',
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
    padding: Platform.OS === 'web' ? 32 : 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    width: '100%',
  },
  registerTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: '#222',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fafafa',
    alignItems: 'center',
  },
  inputIcon: {
    paddingLeft: 12,
    paddingRight: 8,
  },
  input: {
    flex: 1,
    padding: 12,
  },
  validationIcon: {
    paddingRight: 12,
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
  passwordMatch: {
    fontSize: 12,
    marginTop: -10,
    marginBottom: 16,
    textAlign: 'right',
    paddingHorizontal: 4,
  },
  registerButton: {
    backgroundColor: '#800020',
    borderRadius: 8,
    paddingVertical: 15,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#800020',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  registerButtonDisabled: {
    backgroundColor: '#a5636e', // Versión más clara del color principal
    opacity: 0.8,
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#555',
  },
  loginLink: {
    color: '#800020',
    fontWeight: 'bold',
  },
  userTypeContainer: {
    marginBottom: 20,
  },
  userTypeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  userTypeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#800020',
    borderRadius: 8,
    gap: 6,
  },
  userTypeButtonActive: {
    backgroundColor: '#800020',
  },
  userTypeText: {
    color: '#800020',
    fontWeight: '500',
  },
  userTypeTextActive: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 20, // Ajuste para Android
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: Platform.OS === 'web' ? '90%' : '95%', // Más ancho en móviles
    maxWidth: Platform.OS === 'web' ? 400 : 350,
    minHeight: 300, // Altura mínima
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    position: 'relative',
  },
  
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 15,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  emailText: {
    fontWeight: 'bold',
    color: '#800020',
  },
  successSubMessage: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  successButton: {
    backgroundColor: '#800020',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#800020',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonIcon: {
    marginRight: 8,
  },
  successButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  notification: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 9999,
    elevation: 30,
  },
  notificationSuccess: {
    backgroundColor: '#4CAF50',
  },
  notificationError: {
    backgroundColor: '#FF5722',
  },
  notificationText: {
    color: '#fff',
    flex: 1,
    fontWeight: '500',
  },
  notificationClose: {
    marginLeft: 10,
  },
  loadingIcon: {
    marginRight: 8,
  },
});
