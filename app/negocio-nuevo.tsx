'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { 
  View, Text, TextInput, Alert, ScrollView, 
  Image, StyleSheet, TouchableOpacity, 
  Animated, Dimensions, ActivityIndicator, Platform, useWindowDimensions,
  FlatList, Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AntDesign, MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CATEGORIAS = [
  'Restaurante',
  'Tecnología',
  'Ropa',
  'Salud',
  'Educación',
  'Servicios',
  'Supermercado',
  'Entretenimiento',
  'Otro'
];

export default function NegocioPage() {
  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [imagenLocal, setImagenLocal] = useState<string | null>(null);
  const [imagenBase64, setImagenBase64] = useState<string | null>(null);
  const [productoNombre, setProductoNombre] = useState('');
  const [productoPrecio, setProductoPrecio] = useState('');
  const [productos, setProductos] = useState<{ nombre: string; precio: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [telefono, setTelefono] = useState('');
  const [tipoNegocio, setTipoNegocio] = useState('');
  
  // Estados de navegación y datos
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [misNegocios, setMisNegocios] = useState([]);
  const [tab, setTab] = useState<'mis-negocios' | 'nuevo'>('mis-negocios');
  const [selectedNegocio, setSelectedNegocio] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showTipoModal, setShowTipoModal] = useState(false);

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
  const { width: windowWidth } = useWindowDimensions();
  const isSmallScreen = windowWidth < 600;
  const isDesktop = windowWidth >= 1024;

  useEffect(() => {
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

    // Verificar usuario y cargar negocios
    const getUser = async () => {
      console.log('🔐 Verificando usuario...');
      
      const { data } = await supabase.auth.getUser();
      
      console.log('👤 Datos de usuario:', {
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role
        } : null
      });
      
      if (!data.user) {
        console.log('❌ Usuario no autenticado, redirigiendo...');
        Alert.alert('Debes iniciar sesión');
        router.replace('/auth/login');
      } else {
        console.log('✅ Usuario autenticado:', data.user.id);
        setUserId(data.user.id);
        await fetchMisNegocios(data.user.id);
      }
    };
    getUser();
  }, []);

  // Cargar mis negocios
  const fetchMisNegocios = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('negocios')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al cargar negocios:', error);
        return;
      }

      setMisNegocios(data || []);
    } catch (error) {
      console.error('Error inesperado:', error);
    }
  };

  const seleccionarImagen = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      aspect: [4, 3],
      base64: true,
    });
    
    if (!result.canceled && result.assets.length > 0) {
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
      setImagenBase64(result.assets[0].base64 || null);
    }
  };

  const subirImagen = async (): Promise<string | null> => {
    if (!imagenLocal || !imagenBase64) return null;
    
    try {
      const fileName = `negocio_${userId}_${Date.now()}.jpg`;
      
      const binaryString = atob(imagenBase64);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const { data, error } = await supabase.storage
        .from('negocios')
        .upload(fileName, bytes, {
          contentType: 'image/jpeg',
          upsert: false
        });
        
      if (error) {
        Alert.alert('Error al subir imagen', error.message);
        return null;
      }
      
      const { data: urlData } = supabase.storage
        .from('negocios')
        .getPublicUrl(fileName);
        
      return urlData.publicUrl;
      
    } catch (error) {
      if (error.message.includes('Network request failed')) {
        Alert.alert(
          'Error de conexión', 
          'Verifica tu conexión a internet y vuelve a intentar'
        );
      } else {
        Alert.alert('Error', 'No se pudo subir la imagen. Intenta de nuevo.');
      }
      
      return null;
    }
  };

  const agregarProducto = () => {
    if (!productoNombre || !productoPrecio) {
      Alert.alert('Faltan datos del producto');
      return;
    }
    
    setProductos([
      ...productos,
      { nombre: productoNombre, precio: Number(productoPrecio) },
    ]);
    setProductoNombre('');
    setProductoPrecio('');
  };

  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setUbicacion('');
    setImagenLocal(null);
    setImagenBase64(null);
    setProductoNombre('');
    setProductoPrecio('');
    setProductos([]);
    setTelefono('');
    setTipoNegocio('');
    setHorarios({
      lunes:    { apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
      martes:   { apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
      miercoles:{ apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
      jueves:   { apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
      viernes:  { apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
      sabado:   { apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
      domingo:  { apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
    });
  };

  const handleSubmit = async () => {
    console.log('🚀 Iniciando envío de negocio...');
    
    if (!nombre || !userId || !descripcion || !ubicacion || !telefono || !tipoNegocio) {
      Alert.alert('Faltan datos obligatorios');
      return;
    }

    if (productos.length === 0) {
      Alert.alert('Agrega al menos un producto');
      return;
    }

    for (const dia of Object.keys(horarios)) {
      const h = horarios[dia];
      if (!h.apertura.hora || !h.apertura.minuto || !h.cierre.hora || !h.cierre.minuto) {
        Alert.alert('Completa los horarios de todos los días');
        return;
      }
    }

    setLoading(true);
    
    try {
      let urlImagen = '';
      if (imagenLocal) {
        console.log('📸 Procesando imagen...');
        const url = await subirImagen();
        if (!url) {
          console.log('❌ No se pudo subir la imagen');
          setLoading(false);
          return;
        }
        urlImagen = url;
        console.log('✅ Imagen procesada:', urlImagen);
      }

      console.log('💾 Guardando negocio...');
      const { error } = await supabase.from('negocios').insert({
        nombre,
        descripcion,
        ubicacion,
        imagen_url: urlImagen,
        productos,
        user_id: userId,
        aprobado: false,
        telefono,
        horarios,
        tipo: tipoNegocio, 
      });

      if (error) {
        console.error('❌ Error guardando:', error);
        Alert.alert('Error al guardar', error.message);
      } else {
        console.log('✅ Negocio guardado exitosamente');
        Alert.alert('Negocio enviado', 'Esperando aprobación del administrador');
        limpiarFormulario();
        await fetchMisNegocios(userId!);
        setTab('mis-negocios');
      }
    } catch (error) {
      console.error('💥 Error inesperado:', error);
      Alert.alert('Error', 'Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      console.log('🏁 Finalizando proceso...');
      setLoading(false);
    }
  };

  const verDetalle = (negocio) => {
    setSelectedNegocio(negocio);
    setModalVisible(true);
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [negocioToDelete, setNegocioToDelete] = useState(null);

  const eliminarNegocio = async (id: number) => {
    console.log('🗑️ Iniciando eliminación de negocio...');
    console.log('🔍 ID del negocio a eliminar:', id);
    console.log('👤 Usuario actual ID:', userId);
    
    // Verificar que el negocio existe y pertenece al usuario
    const negocioAEliminar = misNegocios.find(negocio => negocio.id === id);
    console.log('📄 Negocio encontrado:', negocioAEliminar);
    
    // Para web, usar modal personalizado
    if (Platform.OS === 'web') {
      setNegocioToDelete(negocioAEliminar);
      setShowDeleteConfirm(true);
      return;
    }
    
    // Para móvil, usar Alert nativo
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de eliminar este negocio? También se eliminarán todas las calificaciones asociadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => ejecutarEliminacion(id)
        }
      ]
    );
  };

  const ejecutarEliminacion = async (id: number) => {
    console.log('🚀 Ejecutando eliminación...');
    
    try {
      // Verificar el estado de autenticación
      const { data: authData, error: authError } = await supabase.auth.getUser();
      console.log('🔐 Estado de autenticación:', { 
        user: authData.user?.id, 
        error: authError 
      });

      if (authError || !authData.user) {
        console.error('❌ Usuario no autenticado');
        if (Platform.OS === 'web') {
          alert('Sesión expirada. Inicia sesión nuevamente.');
        } else {
          Alert.alert('Error', 'Sesión expirada. Inicia sesión nuevamente.');
        }
        return;
      }
      
      // Verificar los permisos de la tabla
      console.log('🔐 Verificando permisos de eliminación...');
      
      const { data: checkData, error: checkError } = await supabase
        .from('negocios')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      
      console.log('📊 Resultado de verificación:', { checkData, checkError });
      
      if (checkError) {
        console.error('❌ Error al verificar el negocio:', checkError);
        const errorMsg = `No se pudo verificar el negocio: ${checkError.message}`;
        if (Platform.OS === 'web') {
          alert(errorMsg);
        } else {
          Alert.alert('Error', errorMsg);
        }
        return;
      }
      
      if (!checkData) {
        console.error('❌ El negocio no existe o no te pertenece');
        const errorMsg = 'El negocio no existe o no tienes permisos para eliminarlo';
        if (Platform.OS === 'web') {
          alert(errorMsg);
        } else {
          Alert.alert('Error', errorMsg);
        }
        return;
      }
      
      console.log('✅ Negocio verificado, procediendo con la eliminación...');
      
      // PASO 1: Eliminar todas las calificaciones asociadas
      console.log('🗑️ Eliminando calificaciones asociadas...');
      const { error: calificacionesError } = await supabase
        .from('calificaciones')
        .delete()
        .eq('negocio_id', id);
    
      if (calificacionesError) {
        console.error('❌ Error eliminando calificaciones:', calificacionesError);
        const errorMsg = `No se pudieron eliminar las calificaciones: ${calificacionesError.message}`;
        if (Platform.OS === 'web') {
          alert(errorMsg);
        } else {
          Alert.alert('Error', errorMsg);
        }
        return;
      }
    
      console.log('✅ Calificaciones eliminadas exitosamente');
    
      // PASO 2: Ahora eliminar el negocio
      console.log('🗑️ Eliminando negocio...');
      const { data, error, count } = await supabase
        .from('negocios')
        .delete({ count: 'exact' })
        .eq('id', id)
        .eq('user_id', userId)
        .select();
    
      console.log('📤 Resultado completo de eliminación:', { 
        data, 
        error, 
        count,
        eliminatedRecords: data?.length || 0
      });
    
      if (error) {
        console.error('❌ Error de Supabase al eliminar:', error);
        console.error('📋 Detalles del error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        const errorMsg = `No se pudo eliminar el negocio: ${error.message}`;
        if (Platform.OS === 'web') {
          alert(errorMsg);
        } else {
          Alert.alert('Error', errorMsg);
        }
      } else if (count === 0) {
        console.error('⚠️ No se eliminó ningún registro');
        const warningMsg = 'No se eliminó ningún registro. Verifica los permisos.';
        if (Platform.OS === 'web') {
          alert(warningMsg);
        } else {
          Alert.alert('Advertencia', warningMsg);
        }
      } else {
        console.log(`✅ ${count} negocio(s) eliminado(s) exitosamente`);
        
        // Actualizar inmediatamente la lista local
        console.log('🔄 Actualizando lista local inmediatamente...');
        setMisNegocios(prevNegocios => prevNegocios.filter(negocio => negocio.id !== id));
        
        // Mostrar mensaje de éxito
        const successMsg = 'Negocio y calificaciones eliminados correctamente';
        if (Platform.OS === 'web') {
          alert(successMsg);
          // Recargar desde el servidor para confirmar
          console.log('🔄 Recargando desde servidor...');
          await fetchMisNegocios(userId!);
          console.log('✅ Lista actualizada desde servidor');
        } else {
          Alert.alert('Éxito', successMsg, [
            {
              text: 'OK',
              onPress: async () => {
                // Recargar desde el servidor para confirmar
                console.log('🔄 Recargando desde servidor...');
                await fetchMisNegocios(userId!);
                console.log('✅ Lista actualizada desde servidor');
              }
            }
          ]);
        }
      }
    } catch (error) {
      console.error('💥 Error inesperado durante eliminación:', error);
      const errorMsg = `Ocurrió un error inesperado: ${error.message}`;
      if (Platform.OS === 'web') {
        alert(errorMsg);
      } else {
        Alert.alert('Error', errorMsg);
      }
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Header del dashboard
  const DashboardHeader = () => (
    <LinearGradient
      colors={['#800020', '#B8001F', '#D4001C']}
      style={[styles.header, isDesktop && styles.headerDesktop]}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, isSmallScreen && styles.headerTitleMobile]}>
              Mi Negocio
            </Text>
            <Text style={[styles.headerSubtitle, isSmallScreen && styles.headerSubtitleMobile]}>
              Gestiona tus emprendimientos locales
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.homeBtn}
            onPress={() => router.push('/negocios')}
          >
            <Ionicons name="home-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  // Render de cada negocio del usuario
  const renderMiNegocio = ({ item }) => (
    <View style={[styles.card, isDesktop && styles.cardDesktop]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          {item.tipo && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.tipo}</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, item.aprobado ? styles.approvedBadge : styles.pendingBadge]}>
          <Ionicons 
            name={item.aprobado ? "checkmark-circle" : "time"} 
            size={16} 
            color="#fff" 
          />
          <Text style={styles.statusText}>
            {item.aprobado ? 'Aprobado' : 'Pendiente'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.cardDescription} numberOfLines={2}>{item.descripcion}</Text>
      
      <View style={styles.cardInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="call-outline" size={16} color="#800020" />
          <Text style={styles.infoText}>{item.telefono || 'Sin teléfono'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={16} color="#800020" />
          <Text style={styles.infoText}>{item.ubicacion || 'Sin ubicación'}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.viewBtn} onPress={() => verDetalle(item)}>
          <Ionicons name="eye-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Ver detalle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => eliminarNegocio(item.id)}>
          <Ionicons name="trash-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <DashboardHeader />

      {/* Contenido principal */}
      <View style={[styles.mainContent, isDesktop && styles.mainContentDesktop]}>
        {/* Tabs */}
        <View style={[styles.tabsContainer, isDesktop && styles.tabsContainerDesktop]}>
          <TouchableOpacity
            style={[styles.tab, tab === 'mis-negocios' && styles.tabActive, isDesktop && styles.tabDesktop]}
            onPress={() => setTab('mis-negocios')}
          >
            <Ionicons 
              name="business-outline" 
              size={20} 
              color={tab === 'mis-negocios' ? '#800020' : '#888'} 
            />
            <Text style={tab === 'mis-negocios' ? styles.tabTextActive : styles.tabText}>
              Mis Negocios ({misNegocios.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, tab === 'nuevo' && styles.tabActive, isDesktop && styles.tabDesktop]}
            onPress={() => setTab('nuevo')}
          >
            <Ionicons 
              name="add-circle-outline" 
              size={20} 
              color={tab === 'nuevo' ? '#800020' : '#888'} 
            />
            <Text style={tab === 'nuevo' ? styles.tabTextActive : styles.tabText}>
              Nuevo Negocio
            </Text>
          </TouchableOpacity>
        </View>

        {/* Contenido según tab */}
        {tab === 'mis-negocios' ? (
          <View style={styles.listContainer}>
            <FlatList
              data={misNegocios}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderMiNegocio}
              contentContainerStyle={styles.list}
              numColumns={isDesktop ? 2 : 1}
              key={isDesktop ? 'desktop' : 'mobile'}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="business-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>No tienes negocios registrados</Text>
                  <TouchableOpacity 
                    style={styles.emptyButton} 
                    onPress={() => setTab('nuevo')}
                  >
                    <Text style={styles.emptyButtonText}>Crear mi primer negocio</Text>
                  </TouchableOpacity>
                </View>
              }
            />
          </View>
        ) : (
          // Formulario de nuevo negocio
          <ScrollView 
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[
              styles.card, 
              {opacity: fadeAnim, transform: [{translateY: slideAnim}, {scale: scaleAnim}]}
            ]}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="business" size={22} color="#800020" />
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
                <MaterialIcons name="category" size={20} color="#555" style={styles.inputIcon} />
                <TouchableOpacity 
                  style={styles.customSelect}
                  onPress={() => setShowTipoModal(true)}
                >
                  <Text style={[styles.selectText, !tipoNegocio && styles.selectPlaceholder]}>
                    {tipoNegocio || "Selecciona una opción"}
                  </Text>
                  <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
                </TouchableOpacity>
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
                  <MaterialIcons name="image" size={22} color="#800020" />
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
                        <MaterialIcons name="add-photo-alternate" size={40} color="#800020" />
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
                  <MaterialIcons name="shopping-cart" size={22} color="#800020" />
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
                  <FontAwesome5 name="list" size={20} color="#800020" />
                  <Text style={styles.sectionTitle}>Lista de Productos</Text>
                </View>
                
                <View style={styles.productList}>
                  {productos.map((p, idx) => (
                    <View key={idx} style={styles.productItem}>
                      <View style={styles.productInfo}>
                        <Text style={styles.productName}>{p.nombre}</Text>
                        <Text style={styles.productPrice}>${p.precio.toFixed(2)}</Text>
                      </View>
                      <View style={styles.productBadge}>
                        <Text style={styles.productBadgeText}>{idx + 1}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </Animated.View>
            )}

            <Animated.View style={[
              styles.card, 
              {opacity: fadeAnim, transform: [{translateY: slideAnim}, {scale: scaleAnim}]}
            ]}>
              <View style={styles.cardHeader}>
                <MaterialIcons name="access-time" size={22} color="#800020" />
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
                onPress={handleSubmit}
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
        )}
      </View>

      {/* Modal de detalle */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDesktop && styles.modalContentDesktop]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedNegocio?.nombre}</Text>
              <TouchableOpacity 
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#800020" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              {selectedNegocio && (
                <>
                  {selectedNegocio.imagen_url && (
                    <Image 
                      source={{ uri: selectedNegocio.imagen_url }} 
                      style={styles.modalImage} 
                    />
                  )}
                  
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Información</Text>
                    <Text style={styles.modalText}>{selectedNegocio.descripcion}</Text>
                    <Text style={styles.modalLabel}>Ubicación: {selectedNegocio.ubicacion}</Text>
                    <Text style={styles.modalLabel}>Teléfono: {selectedNegocio.telefono}</Text>
                    <Text style={styles.modalLabel}>Categoría: {selectedNegocio.tipo}</Text>
                  </View>

                  {selectedNegocio.productos && selectedNegocio.productos.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Productos</Text>
                      {selectedNegocio.productos.map((producto, index) => (
                        <View key={index} style={styles.modalProductItem}>
                          <Text style={styles.modalProductName}>{producto.nombre}</Text>
                          <Text style={styles.modalProductPrice}>${producto.precio}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para seleccionar tipo */}
      <Modal visible={showTipoModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.selectModal}>
            <View style={styles.selectModalHeader}>
              <Text style={styles.selectModalTitle}>Seleccionar tipo de negocio</Text>
              <TouchableOpacity onPress={() => setShowTipoModal(false)}>
                <Ionicons name="close" size={24} color="#800020" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {CATEGORIAS.map(tipo => (
                <TouchableOpacity
                  key={tipo}
                  style={styles.selectOption}
                  onPress={() => {
                    setTipoNegocio(tipo);
                    setShowTipoModal(false);
                  }}
                >
                  <Text style={styles.selectOptionText}>{tipo}</Text>
                  {tipoNegocio === tipo && (
                    <Ionicons name="checkmark" size={20} color="#800020" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación de eliminación para web */}
      {Platform.OS === 'web' && (
        <Modal visible={showDeleteConfirm} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModal}>
              <View style={styles.confirmModalHeader}>
                <Text style={styles.confirmModalTitle}>Confirmar eliminación</Text>
              </View>
              
              <View style={styles.confirmModalBody}>
                <Ionicons name="warning" size={48} color="#ff6b35" style={styles.warningIcon} />
                <Text style={styles.confirmModalText}>
                  ¿Estás seguro de eliminar el negocio "{negocioToDelete?.nombre}"?
                </Text>
                <Text style={styles.confirmModalSubtext}>
                  También se eliminarán todas las calificaciones asociadas. Esta acción no se puede deshacer.
                </Text>
              </View>
              
              <View style={styles.confirmModalActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowDeleteConfirm(false);
                    setNegocioToDelete(null);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.confirmDeleteButton}
                  onPress={async () => {
                    setShowDeleteConfirm(false);
                    const id = negocioToDelete?.id;
                    setNegocioToDelete(null);
                    if (id) {
                      await ejecutarEliminacion(id);
                    }
                  }}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={styles.confirmDeleteButtonText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
  },
  headerDesktop: {
    paddingTop: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerTitleMobile: {
    fontSize: 24,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  headerSubtitleMobile: {
    fontSize: 14,
  },
  homeBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
  },

  // Contenido principal
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mainContentDesktop: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  tabsContainerDesktop: {
    alignSelf: 'flex-start',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  tabDesktop: {
    flex: 0,
    minWidth: 200,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  tabText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#800020',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Lista
  listContainer: {
    flex: 1,
  },
  list: {
    paddingBottom: 20,
  },

  // Estado vacío
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#800020',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Cards
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#800020',
  },
  cardDesktop: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: '#E1CB7A',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#800020',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  approvedBadge: {
    backgroundColor: '#4CAF50',
  },
  pendingBadge: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardInfo: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  viewBtn: {
    backgroundColor: '#800020',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  deleteBtn: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Formulario
  formContainer: {
    flex: 1,
  },
  twoColumnLayout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  columnCard: {
    flex: 1,
    marginHorizontal: 0,
    minWidth: 0,
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
  customSelect: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FFF',
  },
  selectText: {
    fontSize: 16,
    color: '#333',
  },
  selectPlaceholder: {
    color: '#AAA',
  },
  selectModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '70%',
    marginHorizontal: '5%',
  },
  selectModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  selectOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectOptionText: {
    fontSize: 16,
    color: '#333',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    backgroundColor: '#800020',
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
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 8,
    padding: 15,
    borderLeftWidth: 3,
    borderLeftColor: '#800020',
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
    color: '#800020',
    fontWeight: 'bold',
    marginTop: 4,
  },
  productBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#800020',
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
    backgroundColor: '#800020',
    borderRadius: 6,
    minWidth: 45,
    alignItems: 'center',
  },
  ampmButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  submitButton: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#800020',
    shadowColor: '#800020',
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
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContentDesktop: {
    width: 600,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeBtn: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 8,
  },
  modalScroll: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  modalSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#800020',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  modalProductItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalProductName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  modalProductPrice: {
    fontSize: 16,
    color: '#800020',
    fontWeight: 'bold',
  },

  // Estilos para el modal de confirmación web
  confirmModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  confirmModalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  confirmModalBody: {
    padding: 20,
    alignItems: 'center',
  },
  warningIcon: {
    marginBottom: 16,
  },
  confirmModalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  confirmModalSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  confirmModalActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  confirmDeleteButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f44336',
    borderBottomRightRadius: 16,
    flexDirection: 'row',
    gap: 8,
  },
  confirmDeleteButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
