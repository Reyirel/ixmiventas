'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { 
  View, Text, TextInput, Alert, ScrollView, 
  Image, StyleSheet, TouchableOpacity, 
  Animated, Dimensions, ActivityIndicator, Platform, useWindowDimensions
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
  const [telefono, setTelefono] = useState('');
  const [horarios, setHorarios] = useState<{ 
    [dia: string]: { 
      apertura: { hora: string; minuto: string; ampm: string }, 
      cierre: { hora: string; minuto: string; ampm: string } 
    } 
  }>({
    lunes:    { apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
    martes:   { apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
    miercoles:{ apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
    jueves:   { apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
    viernes:  { apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
    sabado:   { apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
    domingo:  { apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
  });

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef<LottieView>(null);
  const { width: windowWidth } = useWindowDimensions();
  const isSmallScreen = windowWidth < 600;

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
      telefono,
      horarios, // <-- Agregado aquí, se guarda como JSON
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
      contentContainerStyle={[
        styles.container,
        { paddingHorizontal: isSmallScreen ? 0 : 30 }
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[
        styles.header, 
        {opacity: fadeAnim, transform: [{translateY: slideAnim}]}
      ]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Mi Emprendimiento</Text>
          <Text style={styles.headerSubtitle}>Forma parte de nuestra comunidad de negocios locales</Text>
        </View>
      </Animated.View>

      <Animated.View style={[
        styles.card, 
        {opacity: fadeAnim, transform: [{translateY: slideAnim}, {scale: scaleAnim}]}
      ]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="business" size={22} color="#8B0000" />
          <Text style={styles.sectionTitle}>Datos Principales</Text>
        </View>
        
        <View style={styles.inputContainer}>
          <MaterialIcons name="storefront" size={20} color="#555" style={styles.inputIcon} />
          <TextInput 
            value={nombre} 
            onChangeText={setNombre} 
            placeholder="Nombre del negocio" 
            placeholderTextColor="#AAA"
            style={styles.input}
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons name="description" size={20} color="#555" style={styles.inputIcon} />
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

        <View style={styles.rowContainer}>
          <View style={[styles.inputContainer, {flex: 1, marginRight: 8}]}>
            <MaterialIcons name="location-on" size={20} color="#555" style={styles.inputIcon} />
            <TextInput 
              value={ubicacion} 
              onChangeText={setUbicacion} 
              placeholder="Dirección" 
              placeholderTextColor="#AAA"
              style={styles.input}
            />
          </View>

          <View style={[styles.inputContainer, {flex: 1, marginLeft: 8}]}>
            <MaterialIcons name="phone" size={20} color="#555" style={styles.inputIcon} />
            <TextInput 
              value={telefono} 
              onChangeText={setTelefono} 
              placeholder="Teléfono" 
              placeholderTextColor="#AAA"
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </Animated.View>

      <View style={[
        styles.twoColumnLayout,
        isSmallScreen && { flexDirection: 'column' }
      ]}>
        <Animated.View style={[
          styles.card, 
          styles.columnCard,
          isSmallScreen && { marginBottom: 15, marginRight: 0, width: '100%' },
          {opacity: fadeAnim, transform: [{translateY: slideAnim}, {scale: scaleAnim}]}
        ]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="image" size={22} color="#8B0000" />
            <Text style={styles.sectionTitle}>Imagen</Text>
          </View>
          
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
                  <MaterialIcons name="add-photo-alternate" size={40} color="#8B0000" />
                  <Text style={styles.imagePickerText}>Seleccionar imagen</Text>
                </View>
              </Animated.View>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[
          styles.card,
          styles.columnCard,
          isSmallScreen && { marginLeft: 0, width: '100%' },
          {opacity: fadeAnim, transform: [{translateY: slideAnim}, {scale: scaleAnim}]}
        ]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="shopping-cart" size={22} color="#8B0000" />
            <Text style={styles.sectionTitle}>Productos</Text>
          </View>
          
          <View style={styles.rowContainer}>
            <View style={[styles.inputContainer, {flex: 1, marginRight: 8}]}>
              <FontAwesome5 name="shopping-basket" size={18} color="#555" style={styles.inputIcon} />
              <TextInput 
                value={productoNombre} 
                onChangeText={setProductoNombre} 
                placeholder="Nombre producto" 
                placeholderTextColor="#AAA"
                style={styles.input}
              />
            </View>

            <View style={[styles.inputContainer, {flex: 0.6, marginLeft: 8}]}>
              <FontAwesome5 name="dollar-sign" size={18} color="#555" style={styles.inputIcon} />
              <TextInput 
                value={productoPrecio} 
                onChangeText={setProductoPrecio} 
                placeholder="Precio" 
                placeholderTextColor="#AAA"
                style={styles.input}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.addProductButton} 
            onPress={agregarProducto}
            activeOpacity={0.8}
          >
            <Text style={styles.addProductButtonText}>Agregar producto</Text>
            <AntDesign name="plus" size={20} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {productos.length > 0 && (
        <Animated.View style={[
          styles.card, 
          {opacity: fadeAnim, transform: [{translateY: slideAnim}, {scale: scaleAnim}]}
        ]}>
          <View style={styles.cardHeader}>
            <FontAwesome5 name="list" size={20} color="#8B0000" />
            <Text style={styles.sectionTitle}>Lista de Productos</Text>
          </View>
          
          <View style={styles.productList}>
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
        </Animated.View>
      )}

      <Animated.View style={[
        styles.card, 
        {opacity: fadeAnim, transform: [{translateY: slideAnim}, {scale: scaleAnim}]}
      ]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="access-time" size={22} color="#8B0000" />
          <Text style={styles.sectionTitle}>Horarios</Text>
        </View>
        
        {Object.keys(horarios).map((dia) => (
          <View key={dia} style={styles.horarioContainer}>
            <View style={styles.horarioDayHeader}>
              <Text style={styles.horarioDayText}>{dia.charAt(0).toUpperCase() + dia.slice(1)}</Text>
            </View>
            
            <View style={styles.horarioRow}>
              <View style={styles.horarioColumn}>
                <Text style={styles.horarioLabel}>Apertura:</Text>
                <View style={styles.horarioInputGroup}>
                  <TextInput
                    value={horarios[dia].apertura.hora}
                    onChangeText={text => setHorarios(prev => ({
                      ...prev, [dia]: { ...prev[dia], apertura: { ...prev[dia].apertura, hora: text } }
                    }))}
                    placeholder="hh"
                    keyboardType="numeric"
                    style={styles.horarioInput}
                    maxLength={2}
                  />
                  <Text style={styles.horarioSeparator}>:</Text>
                  <TextInput
                    value={horarios[dia].apertura.minuto}
                    onChangeText={text => setHorarios(prev => ({
                      ...prev, [dia]: { ...prev[dia], apertura: { ...prev[dia].apertura, minuto: text } }
                    }))}
                    placeholder="mm"
                    keyboardType="numeric"
                    style={styles.horarioInput}
                    maxLength={2}
                  />
                  <TouchableOpacity
                    onPress={() => setHorarios(prev => ({
                      ...prev, [dia]: { ...prev[dia], apertura: { ...prev[dia].apertura, ampm: prev[dia].apertura.ampm === 'AM' ? 'PM' : 'AM' } }
                    }))}
                    style={styles.ampmButton}
                  >
                    <Text style={styles.ampmButtonText}>{horarios[dia].apertura.ampm}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.horarioColumn}>
                <Text style={styles.horarioLabel}>Cierre:</Text>
                <View style={styles.horarioInputGroup}>
                  <TextInput
                    value={horarios[dia].cierre.hora}
                    onChangeText={text => setHorarios(prev => ({
                      ...prev, [dia]: { ...prev[dia], cierre: { ...prev[dia].cierre, hora: text } }
                    }))}
                    placeholder="hh"
                    keyboardType="numeric"
                    style={styles.horarioInput}
                    maxLength={2}
                  />
                  <Text style={styles.horarioSeparator}>:</Text>
                  <TextInput
                    value={horarios[dia].cierre.minuto}
                    onChangeText={text => setHorarios(prev => ({
                      ...prev, [dia]: { ...prev[dia], cierre: { ...prev[dia].cierre, minuto: text } }
                    }))}
                    placeholder="mm"
                    keyboardType="numeric"
                    style={styles.horarioInput}
                    maxLength={2}
                  />
                  <TouchableOpacity
                    onPress={() => setHorarios(prev => ({
                      ...prev, [dia]: { ...prev[dia], cierre: { ...prev[dia].cierre, ampm: prev[dia].cierre.ampm === 'AM' ? 'PM' : 'AM' } }
                    }))}
                    style={styles.ampmButton}
                  >
                    <Text style={styles.ampmButtonText}>{horarios[dia].cierre.ampm}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}
      </Animated.View>

      <Animated.View 
        style={{transform: [{scale: scaleAnim}], marginVertical: 30}}
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
          <View style={styles.submitButtonContent}>
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Registrar Negocio</Text>
                <MaterialIcons name="send" size={20} color="#FFF" />
              </>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    backgroundColor: '#F5F5F5',
    minHeight: '100%',
  },
  header: {
    backgroundColor: '#8B0000',
    marginBottom: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerContent: {
    padding: 25,
    paddingTop: Platform.OS === 'ios' ? 60 : 35,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFFCC',
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
    borderLeftWidth: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  twoColumnLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 15,
    gap: 15, // Añade espacio entre columnas
  },
  columnCard: {
    flex: 1,
    marginHorizontal: 0,
    minWidth: 0,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minWidth: 0,
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
    width: '100%',
    minWidth: 120,
    minHeight: 120,
    alignSelf: 'center',
  },
  imagePickerInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  imagePickerText: {
    marginTop: 10,
    color: '#666',
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
    marginTop: 8,
  },
  addProductButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginRight: 10,
  },
  productList: {
    marginTop: 0,
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
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 8,
    padding: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#8B0000',
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
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#8B0000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productBadgeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  horarioContainer: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  horarioDayHeader: {
    marginBottom: 10,
  },
  horarioDayText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  horarioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  horarioColumn: {
    flex: 1,
  },
  horarioLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  horarioInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horarioInput: {
    width: 40,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    textAlign: 'center',
  },
  horarioSeparator: {
    marginHorizontal: 5,
    fontSize: 18,
    color: '#333',
  },
  ampmButton: {
    marginLeft: 8,
    padding: 8,
    backgroundColor: '#8B0000',
    borderRadius: 6,
    minWidth: 45,
    alignItems: 'center',
  },
  ampmButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  submitButton: {
    marginHorizontal: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#8B0000',
    shadowColor: '#8B0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    minWidth: 120,
  },
  submitButtonContent: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 10,
    letterSpacing: 0.5,
  }
});
