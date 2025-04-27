import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Linking, 
  ActivityIndicator,
  useWindowDimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../../lib/supabase';
import { BlurView } from 'expo-blur';

export default function NegocioDetalle() {
  const { id } = useLocalSearchParams();
  const [negocio, setNegocio] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (id) {
      setLoading(true);
      supabase
        .from('negocios')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error) console.error("Error al cargar el negocio:", error);
          setNegocio(data);
          setLoading(false);
        });
    }
  }, [id]);

  const handleContactar = () => {
    if (negocio?.telefono) {
      Linking.openURL(`tel:${negocio.telefono}`);
    }
  };

  const handleUbicacion = () => {
    if (negocio?.ubicacion) {
      Linking.openURL(`https://maps.google.com/?q=${negocio.ubicacion}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF7D1A" />
        <Text style={styles.loadingText}>Cargando información del negocio...</Text>
      </View>
    );
  }

  if (!negocio) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color="#FF3B30" />
        <Text style={styles.errorText}>No se pudo cargar la información</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* Imagen de cabecera con overlay */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: negocio.imagen_url || 'https://via.placeholder.com/400x200?text=Sin+Imagen' }} 
            style={styles.headerImage} 
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
          
          {/* Header con botón de regreso y título */}
          <View style={styles.headerBar}>
            <TouchableOpacity 
              style={styles.backIconButton} 
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle} numberOfLines={1}>{negocio.nombre}</Text>
            </View>
          </View>
          
          {/* Badge de categoría flotante */}
          {negocio.categoria && (
            <View style={styles.floatingCategoryBadge}>
              <Text style={styles.categoryText}>{negocio.categoria}</Text>
            </View>
          )}
        </View>

        <ScrollView 
          style={styles.contentScrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Contenido principal */}
          <View style={styles.contentContainer}>
            {/* Encabezado con calificación */}
            <View style={styles.headerContainer}>
              <Text style={styles.title}>{negocio.nombre}</Text>
              <View style={styles.ratingContainer}>
                {Array(5).fill(0).map((_, i) => (
                  <Ionicons 
                    key={i} 
                    name={i < (negocio.calificacion || 4) ? "star" : "star-outline"} 
                    size={20} 
                    color="#FFD700" 
                    style={styles.starIcon}
                  />
                ))}
                <Text style={styles.ratingText}>
                  {negocio.calificacion?.toFixed(1) || '4.0'} 
                </Text>
              </View>
            </View>

            {/* Botones de acción */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={handleContactar}
              >
                <View style={[styles.actionIconContainer, {backgroundColor: '#FF7D1A'}]}>
                  <Ionicons name="call-outline" size={22} color="white" />
                </View>
                <Text style={styles.actionButtonText}>Llamar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={handleUbicacion}
              >
                <View style={[styles.actionIconContainer, {backgroundColor: '#4CAF50'}]}>
                  <Ionicons name="location-outline" size={22} color="white" />
                </View>
                <Text style={styles.actionButtonText}>Ubicación</Text>
              </TouchableOpacity>
              
              {negocio.sitio_web && (
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => Linking.openURL(negocio.sitio_web)}
                >
                  <View style={[styles.actionIconContainer, {backgroundColor: '#007AFF'}]}>
                    <Ionicons name="globe-outline" size={22} color="white" />
                  </View>
                  <Text style={styles.actionButtonText}>Web</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Info Cards */}
            <View style={styles.infoCards}>
              <View style={styles.infoCard}>
                <Ionicons name="time-outline" size={24} color="#FF7D1A" />
                <View style={styles.infoCardContent}>
                  <Text style={styles.infoCardLabel}>Horario hoy</Text>
                  <Text style={styles.infoCardValue}>{negocio.horario || "9:00 AM - 6:00 PM"}</Text>
                </View>
              </View>
              
              <View style={styles.infoCard}>
                <Ionicons name="location-outline" size={24} color="#FF7D1A" />
                <View style={styles.infoCardContent}>
                  <Text style={styles.infoCardLabel}>Dirección</Text>
                  <Text style={styles.infoCardValue} numberOfLines={2}>
                    {negocio.ubicacion || "Dirección no disponible"}
                  </Text>
                </View>
              </View>
            </View>

            {/* Descripción */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.description}>{negocio.descripcion || "Sin descripción disponible"}</Text>
            </View>

            {/* Productos */}
            {negocio.productos && Array.isArray(negocio.productos) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Productos</Text>
                {negocio.productos.length === 0 ? (
                  <Text style={styles.emptyStateText}>No hay productos registrados</Text>
                ) : (
                  <View style={styles.productsList}>
                    {negocio.productos.map((prod, idx) => (
                      <View key={idx} style={styles.productCard}>
                        <Text style={styles.productName}>{prod.nombre}</Text>
                        <Text style={styles.productPrice}>${prod.precio?.toFixed(2)}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Horarios */}
            {negocio.horarios && typeof negocio.horarios === 'object' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Horarios</Text>
                <View style={styles.scheduleCard}>
                  {Object.keys(negocio.horarios).map((dia) => (
                    <View key={dia} style={styles.scheduleRow}>
                      <Text style={styles.scheduleDay}>
                        {dia.charAt(0).toUpperCase() + dia.slice(1)}
                      </Text>
                      <Text style={styles.scheduleTime}>
                        {negocio.horarios[dia].apertura.hora}:{negocio.horarios[dia].apertura.minuto} {negocio.horarios[dia].apertura.ampm}
                        {' - '}
                        {negocio.horarios[dia].cierre.hora}:{negocio.horarios[dia].cierre.minuto} {negocio.horarios[dia].cierre.ampm}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#555',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    color: '#555',
    textAlign: 'center',
  },
  // Contenedor de imagen mejorado
  imageContainer: {
    position: 'relative',
    height: 240,
    zIndex: 1,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1,
  },
  headerBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    zIndex: 2,
  },
  backIconButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitleContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  floatingCategoryBadge: {
    position: 'absolute',
    bottom: -16,
    right: 20,
    backgroundColor: '#FF7D1A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  // Contenido principal
  contentScrollView: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  scrollViewContent: {
    paddingBottom: 30,
  },
  contentContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 2,
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
  // Botones de acción
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 24,
    paddingVertical: 8,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  actionButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  // Info Cards
  infoCards: {
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  infoCardContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoCardLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  infoCardValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  // Secciones
  section: {
    marginBottom: 28,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
    padding: 4,
    borderBottomWidth: 2,
    borderBottomColor: '#FF7D1A',
    alignSelf: 'flex-start',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  // Productos
  productsList: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9F9F9',
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  productName: {
    fontSize: 16,
    flex: 1,
  },
  productPrice: {
    fontWeight: 'bold',
    color: '#FF7D1A',
    fontSize: 18,
  },
  // Horarios
  scheduleCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  scheduleDay: {
    fontWeight: '600',
    color: '#555',
    width: 100,
  },
  scheduleTime: {
    color: '#333',
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#777',
    fontStyle: 'italic',
    padding: 20,
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    elevation: 2,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  }
});