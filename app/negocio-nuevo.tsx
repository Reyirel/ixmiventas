'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { 
  View, Text, TextInput, Alert, ScrollView, 
  Image, StyleSheet, TouchableOpacity, 
  Animated, Dimensions, ActivityIndicator, Platform 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AntDesign, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

export default function NegocioNuevo() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [imagenLocal, setImagenLocal] = useState<string | null>(null);
  const [productoNombre, setProductoNombre] = useState('');
  const [productoPrecio, setProductoPrecio] = useState('');
  const [productos, setProductos] = useState<{ nombre: string; precio: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();

    // Verificar usuario
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        Alert.alert('Debes iniciar sesión');
        router.replace('/auth/login');
      } else {
        setUserId(data.user.id);
      }
    };
    getUser();
  }, []);

  const seleccionarImagen = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      aspect: [4, 3],
    });
    
    if (!result.canceled && result.assets.length > 0) {
      // Animación al seleccionar imagen
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        })
      ]).start();
      
      setImagenLocal(result.assets[0].uri);
    }
  };

  const subirImagen = async (): Promise<string | null> => {
    if (!imagenLocal) return null;
    const response = await fetch(imagenLocal);
    const blob = await response.blob();
    const fileName = `negocios_${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from('negocios')
      .upload(fileName, blob, { contentType: 'image/jpeg' });
    if (error) {
      Alert.alert('Error al subir imagen', error.message);
      return null;
    }
    const { data } = supabase.storage.from('negocios').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const agregarProducto = () => {
    if (!productoNombre || !productoPrecio) {
      // Shake animation para error
      Animated.sequence([
        Animated.timing(slideAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 100, useNativeDriver: true })
      ]).start();
      
      Alert.alert('Faltan datos del producto');
      return;
    }
    
    // Animar la adición del producto
    lottieRef.current?.play(0, 50);
    
    setProductos([
      ...productos,
      { nombre: productoNombre, precio: Number(productoPrecio) },
    ]);
    setProductoNombre('');
    setProductoPrecio('');
  };

  const handleSubmit = async () => {
    if (!nombre || !userId) {
      Alert.alert('Faltan datos obligatorios');
      return;
    }

    if (productos.length === 0) {
      Alert.alert('Agrega al menos un producto');
      return;
    }

    setLoading(true);
    let urlImagen = '';
    if (imagenLocal) {
      const url = await subirImagen();
      if (!url) {
        setLoading(false);
        return;
      }
      urlImagen = url;
    }

    const { error } = await supabase.from('negocios').insert({
      nombre,
      descripcion,
      ubicacion,
      imagen_url: urlImagen,
      productos,
      user_id: userId,
      aprobado: false,
    });

    setLoading(false);
    if (error) {
      Alert.alert('Error al guardar', error.message);
    } else {
      Alert.alert('Negocio enviado', 'Esperando aprobación del administrador');
      router.replace('/negocios');
    }
  };

  // Animación del botón
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[
        styles.header, 
        {opacity: fadeAnim, transform: [{translateY: slideAnim}]}
      ]}>
        <LinearGradient
          colors={['#fff', '#fff']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.headerTitle}>Registrar Nuevo Negocio</Text>
          <Text style={styles.headerSubtitle}>Comparte tu emprendimiento con la comunidad</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.View style={[
        styles.card, 
        {opacity: fadeAnim, transform: [{translateY: slideAnim}, {scale: scaleAnim}]}
      ]}>
        <Text style={styles.sectionTitle}>Información General</Text>
        
        <View style={styles.inputContainer}>
          <MaterialIcons name="business" size={20} color="#000" style={styles.inputIcon} />
          <TextInput 
            value={nombre} 
            onChangeText={setNombre} 
            placeholder="Nombre del negocio" 
            placeholderTextColor="#AAA"
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="description" size={20} color="#000" style={styles.inputIcon} />
          <TextInput 
            value={descripcion} 
            onChangeText={setDescripcion} 
            placeholder="Describe el negocio" 
            placeholderTextColor="#AAA"
            style={[styles.input, styles.textArea]} 
            multiline 
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="location-on" size={20} color="#000" style={styles.inputIcon} />
          <TextInput 
            value={ubicacion} 
            onChangeText={setUbicacion} 
            placeholder="Dirección del negocio" 
            placeholderTextColor="#AAA"
            style={styles.input}
          />
        </View>
      </Animated.View>

      <Animated.View style={[
        styles.card, 
        {opacity: fadeAnim, transform: [{translateY: slideAnim}, {scale: scaleAnim}]}
      ]}>
        <Text style={styles.sectionTitle}>Imagen del Negocio</Text>
        
        <TouchableOpacity 
          style={styles.imagePicker} 
          onPress={seleccionarImagen}
          activeOpacity={0.7}
        >
          {imagenLocal ? (
            <Image source={{ uri: imagenLocal }} style={styles.previewImage} />
          ) : (
            <Animated.View style={{transform: [{rotate: spin}]}}>
              <View style={styles.imagePickerInner}>
                <MaterialIcons name="add-photo-alternate" size={40} color="#000" />
                <Text style={styles.imagePickerText}>Seleccionar imagen</Text>
              </View>
            </Animated.View>
          )}
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[
        styles.card, 
        {opacity: fadeAnim, transform: [{translateY: slideAnim}, {scale: scaleAnim}]}
      ]}>
        <Text style={styles.sectionTitle}>Productos</Text>
        
        <View style={styles.inputContainer}>
          <FontAwesome5 name="shopping-basket" size={18} color="#000" style={styles.inputIcon} />
          <TextInput 
            value={productoNombre} 
            onChangeText={setProductoNombre} 
            placeholder="Nombre del producto" 
            placeholderTextColor="#AAA"
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <FontAwesome5 name="dollar-sign" size={18} color="#000" style={styles.inputIcon} />
          <TextInput 
            value={productoPrecio} 
            onChangeText={setProductoPrecio} 
            placeholder="Precio" 
            placeholderTextColor="#AAA"
            style={styles.input}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity 
          style={styles.addProductButton} 
          onPress={agregarProducto}
          activeOpacity={0.8}
        >
          <Text style={styles.addProductButtonText}>Agregar producto</Text>
          <AntDesign name="plus" size={20} color="#FFF" />
        </TouchableOpacity>

        {/* Referencia para la animación de Lottie */}

        {productos.length > 0 && (
          <View style={styles.productList}>
            <Text style={styles.productListTitle}>Productos agregados:</Text>
            {productos.map((p, idx) => (
              <Animated.View 
                key={idx} 
                style={styles.productItem}
                entering={Animated.FadeInUp?.(idx * 100)}
              >
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{p.nombre}</Text>
                  <Text style={styles.productPrice}>${p.precio.toFixed(2)}</Text>
                </View>
                <View style={styles.productBadge}>
                  <Text style={styles.productBadgeText}>{idx + 1}</Text>
                </View>
              </Animated.View>
            ))}
          </View>
        )}
      </Animated.View>

      <Animated.View 
        style={{transform: [{scale: scaleAnim}], marginTop: 20, marginBottom: 40}}
      >
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={() => {
            animateButton();
            handleSubmit();
          }}
          activeOpacity={0.8}
          disabled={loading}
        >
          <LinearGradient
            colors={['#8B0000', '#800000']}
            style={styles.submitButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Enviar Negocio</Text>
                <MaterialIcons name="send" size={20} color="#FFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    padding: 25,
    paddingTop: Platform.OS === 'ios' ? 60 : 35,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B0000',
    textAlign: 'center',
    marginBottom: 5,
    textShadowColor: 'transparent',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFD700',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#8B0000',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  imagePicker: {
    height: 180,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imagePickerInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
  },
  imagePickerText: {
    marginTop: 10,
    color: '#888',
    fontSize: 14,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  addProductButton: {
    backgroundColor: '#8B0000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addProductButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginRight: 10,
  },
  productList: {
    marginTop: 20,
  },
  productListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 8,
    padding: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#8B0000',
    fontWeight: 'bold',
    marginTop: 4,
  },
  productBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productBadgeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  submitButton: {
    marginHorizontal: 15,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  submitButtonGradient: {
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
    letterSpacing: 0.5,
  }
});
