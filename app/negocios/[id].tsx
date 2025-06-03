import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
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
  Platform,
  Alert,
  TextInput,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../../lib/supabase';
import { BlurView } from 'expo-blur';

export default function NegocioDetalle() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [negocio, setNegocio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [comentarios, setComentarios] = useState([]);
  const [expandedComment, setExpandedComment] = useState(false);
  const { width, height } = useWindowDimensions();

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const commentExpansion = useRef(new Animated.Value(0)).current;
  const starAnimations = useRef([...Array(5)].map(() => new Animated.Value(1))).current;

  // Responsividad
  const isTablet = width > 768;
  const isDesktop = width > 1024;
  const maxWidth = isDesktop ? 1200 : width;
  const contentPadding = isTablet ? 32 : 20;
  const imageHeight = isDesktop ? 400 : isTablet ? 320 : 240;

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      })
    ]).start();

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

      // Cargar comentarios
      supabase
        .from('calificaciones')
        .select('valor, comentario, usuario_id')
        .eq('negocio_id', id)
        .then(({ data }) => {
          setComentarios(data || []);
        });
    }

    // Obtener usuario logueado y su calificación/comentario
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data?.user || null);
      if (data?.user && id) {
        const { data: calif } = await supabase
          .from('calificaciones')
          .select('valor, comentario')
          .eq('negocio_id', id)
          .eq('usuario_id', data.user.id)
          .single();
        if (calif) {
          setUserRating(calif.valor);
          setUserComment(calif.comentario || '');
        }
      }
    });
  }, [id]);

  const animateStars = (rating) => {
    starAnimations.forEach((anim, index) => {
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1.3,
          duration: 150,
          delay: index * 50,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    });
  };

  const toggleCommentExpansion = () => {
    setExpandedComment(!expandedComment);
    Animated.timing(commentExpansion, {
      toValue: expandedComment ? 0 : 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

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

  const handleSetRating = async (rating) => {
    if (!user) return;
    
    animateStars(rating);
    setUserRating(rating);

    // Upsert calificación
    const { error } = await supabase
      .from('calificaciones')
      .upsert([
        {
          negocio_id: id,
          usuario_id: user.id,
          valor: rating,
          comentario: userComment
        }
      ], { onConflict: ['negocio_id', 'usuario_id'] });

    if (error) {
      Alert.alert('Error', 'No se pudo guardar la calificación');
      return;
    }

    // Recalcular promedio
    const { data: calificaciones } = await supabase
      .from('calificaciones')
      .select('valor')
      .eq('negocio_id', id);

    if (calificaciones && calificaciones.length > 0) {
      const promedio = calificaciones.reduce((acc, curr) => acc + curr.valor, 0) / calificaciones.length;
      await supabase
        .from('negocios')
        .update({ calificacion: promedio })
        .eq('id', id);

      setNegocio({ ...negocio, calificacion: promedio });
    }

    // Recargar comentarios
    const { data: nuevosComentarios } = await supabase
      .from('calificaciones')
      .select('valor, comentario, usuario_id')
      .eq('negocio_id', id);
    setComentarios(nuevosComentarios || []);
  };

  const handleSaveComment = async () => {
    if (!user) return;

    const valor = typeof userRating === 'number' && !isNaN(userRating) ? userRating : 0;

    const { error } = await supabase
      .from('calificaciones')
      .upsert([
        {
          negocio_id: Number(id),
          usuario_id: user.id,
          valor: valor,
          comentario: userComment
        }
      ], { onConflict: ['negocio_id', 'usuario_id'] });

    if (error) {
      Alert.alert('Error', 'No se pudo guardar el comentario');
      console.error(error);
      return;
    }
    Alert.alert('¡Gracias!', 'Tu comentario ha sido guardado.');

    // Recargar comentarios
    const { data: nuevosComentarios } = await supabase
      .from('calificaciones')
      .select('valor, comentario, usuario_id')
      .eq('negocio_id', id);
    setComentarios(nuevosComentarios || []);
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/negocios');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.loadingContent, { opacity: fadeAnim }]}>
          <ActivityIndicator size="large" color="#FF7D1A" />
          <Text style={styles.loadingText}>Cargando información del negocio...</Text>
        </Animated.View>
      </View>
    );
  }

  if (!negocio) {
    return (
      <View style={styles.errorContainer}>
        <Animated.View style={[styles.errorContent, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Ionicons name="alert-circle" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>No se pudo cargar la información</Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleGoBack}
          >
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  const containerStyle = isDesktop ? [styles.container, styles.desktopContainer] : styles.container;

  return (
    <>
      <StatusBar style="light" />
      <View style={containerStyle}>
        <View style={[styles.contentWrapper, { maxWidth }]}>
          {/* Imagen de cabecera con overlay */}
          <Animated.View 
            style={[
              styles.imageContainer, 
              { height: imageHeight, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
            ]}
          >
            <Image 
              source={{ uri: negocio.imagen_url || 'https://via.placeholder.com/400x200?text=Sin+Imagen' }} 
              style={styles.headerImage} 
              resizeMode="cover"
            />
            <View style={styles.imageOverlay} />
            
            {/* Header con botón de regreso y título */}
            <View style={[styles.headerBar, { paddingHorizontal: contentPadding }]}>
              <TouchableOpacity 
                style={styles.backIconButton} 
                onPress={handleGoBack}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <Text style={[styles.headerTitle, isTablet && styles.headerTitleTablet]} numberOfLines={1}>
                  {negocio.nombre}
                </Text>
              </View>
            </View>
            
            {/* Badge de categoría flotante */}
            {negocio.categoria && (
              <Animated.View 
                style={[
                  styles.floatingCategoryBadge, 
                  { 
                    right: contentPadding,
                    transform: [{ translateY: slideAnim }] 
                  }
                ]}
              >
                <Text style={styles.categoryText}>{negocio.categoria}</Text>
              </Animated.View>
            )}
          </Animated.View>

          <ScrollView 
            style={styles.contentScrollView} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollViewContent,
              isDesktop && styles.scrollViewContentDesktop
            ]}
          >
            {/* Contenido principal */}
            <Animated.View 
              style={[
                styles.contentContainer,
                { 
                  paddingHorizontal: contentPadding,
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {/* Grid Layout para Desktop */}
              <View style={isDesktop ? styles.desktopGrid : styles.mobileLayout}>
                
                {/* Columna Principal */}
                <View style={isDesktop ? styles.mainColumn : styles.fullWidth}>
                  {/* Encabezado con calificación */}
                  <View style={styles.headerContainer}>
                    <Text style={[styles.title, isTablet && styles.titleTablet]}>
                      {negocio.nombre}
                    </Text>
                    {negocio.tipo && (
                      <Text style={[styles.businessType, isTablet && styles.businessTypeTablet]}>
                        {negocio.tipo}
                      </Text>
                    )}
                    <View style={styles.ratingContainer}>
                      {Array(5).fill(0).map((_, i) => (
                        <Animated.View
                          key={i}
                          style={{ transform: [{ scale: starAnimations[i] }] }}
                        >
                          <TouchableOpacity
                            onPress={user ? () => handleSetRating(i + 1) : undefined}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name={i < (user ? userRating : (negocio.calificacion || 4)) ? "star" : "star-outline"}
                              size={isTablet ? 24 : 20}
                              color="#FFD700"
                              style={styles.starIcon}
                            />
                          </TouchableOpacity>
                        </Animated.View>
                      ))}
                      <Text style={[styles.ratingText, isTablet && styles.ratingTextTablet]}>
                        {negocio.calificacion?.toFixed(1) || '4.0'}
                      </Text>
                    </View>
                    
                    {!user && (
                      <Text style={[styles.loginPrompt, isTablet && styles.loginPromptTablet]}>
                        Inicia sesión para calificar y comentar este negocio
                      </Text>
                    )}
                    
                    {user && (
                      <Animated.View style={[styles.commentSection, { opacity: fadeAnim }]}>
                        <TouchableOpacity
                          style={styles.commentToggle}
                          onPress={toggleCommentExpansion}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.commentToggleText}>
                            {expandedComment ? 'Ocultar comentario' : 'Agregar comentario'}
                          </Text>
                          <Ionicons 
                            name={expandedComment ? "chevron-up" : "chevron-down"} 
                            size={20} 
                            color="#FF7D1A" 
                          />
                        </TouchableOpacity>
                        
                        <Animated.View
                          style={[
                            styles.commentInputContainer,
                            {
                              maxHeight: commentExpansion.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 200],
                              }),
                              opacity: commentExpansion,
                            }
                          ]}
                        >
                          <TextInput
                            placeholder="Escribe tu comentario..."
                            value={userComment}
                            onChangeText={setUserComment}
                            style={[styles.commentInput, isTablet && styles.commentInputTablet]}
                            multiline
                            numberOfLines={4}
                          />
                          <TouchableOpacity
                            style={[styles.saveCommentButton, isTablet && styles.saveCommentButtonTablet]}
                            onPress={handleSaveComment}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.saveCommentButtonText}>Guardar comentario</Text>
                          </TouchableOpacity>
                        </Animated.View>
                      </Animated.View>
                    )}
                  </View>

                  {/* Descripción */}
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>
                      Descripción
                    </Text>
                    <Text style={[styles.description, isTablet && styles.descriptionTablet]}>
                      {negocio.descripcion || "Sin descripción disponible"}
                    </Text>
                  </View>

                  {/* Productos */}
                  {negocio.productos && Array.isArray(negocio.productos) && (
                    <View style={styles.section}>
                      <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>
                        Productos
                      </Text>
                      {negocio.productos.length === 0 ? (
                        <Text style={styles.emptyStateText}>No hay productos registrados</Text>
                      ) : (
                        <View style={[styles.productsList, isTablet && styles.productsListTablet]}>
                          {negocio.productos.map((prod, idx) => (
                            <Animated.View 
                              key={idx} 
                              style={[
                                styles.productCard,
                                isTablet && styles.productCardTablet,
                                {
                                  opacity: fadeAnim,
                                  transform: [{
                                    translateX: slideAnim.interpolate({
                                      inputRange: [0, 50],
                                      outputRange: [0, idx * 20],
                                    })
                                  }]
                                }
                              ]}
                            >
                              <Text style={[styles.productName, isTablet && styles.productNameTablet]}>
                                {prod.nombre}
                              </Text>
                              <Text style={[styles.productPrice, isTablet && styles.productPriceTablet]}>
                                ${prod.precio?.toFixed(2)}
                              </Text>
                            </Animated.View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  {/* Comentarios */}
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>
                      Comentarios
                    </Text>
                    {comentarios.length === 0 ? (
                      <Text style={styles.emptyStateText}>No hay comentarios aún.</Text>
                    ) : (
                      <View style={styles.commentsList}>
                        {comentarios.map((c, idx) => (
                          <Animated.View 
                            key={idx} 
                            style={[
                              styles.commentCard,
                              isTablet && styles.commentCardTablet,
                              {
                                opacity: fadeAnim,
                                transform: [{
                                  translateY: slideAnim.interpolate({
                                    inputRange: [0, 50],
                                    outputRange: [0, idx * 10],
                                  })
                                }]
                              }
                            ]}
                          >
                            <View style={styles.commentRating}>
                              {Array(5).fill(0).map((_, i) => (
                                <Ionicons
                                  key={i}
                                  name={i < c.valor ? "star" : "star-outline"}
                                  size={16}
                                  color="#FFD700"
                                  style={styles.commentStar}
                                />
                              ))}
                            </View>
                            <Text style={[styles.commentText, isTablet && styles.commentTextTablet]}>
                              {c.comentario || <Text style={styles.noComment}>Sin comentario</Text>}
                            </Text>
                          </Animated.View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                {/* Columna Lateral (Desktop/Tablet) */}
                <View style={isDesktop ? styles.sideColumn : styles.fullWidth}>
                  {/* Botones de acción */}
                  <Animated.View 
                    style={[
                      styles.actionButtonsContainer,
                      isDesktop && styles.actionButtonsDesktop,
                      { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
                    ]}
                  >
                    <TouchableOpacity 
                      style={[styles.actionButton, isTablet && styles.actionButtonTablet]} 
                      onPress={handleContactar}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.actionIconContainer, styles.callButton]}>
                        <Ionicons name="call-outline" size={isTablet ? 26 : 22} color="white" />
                      </View>
                      <Text style={[styles.actionButtonText, isTablet && styles.actionButtonTextTablet]}>
                        Llamar
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.actionButton, isTablet && styles.actionButtonTablet]}
                      onPress={handleUbicacion}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.actionIconContainer, styles.locationButton]}>
                        <Ionicons name="location-outline" size={isTablet ? 26 : 22} color="white" />
                      </View>
                      <Text style={[styles.actionButtonText, isTablet && styles.actionButtonTextTablet]}>
                        Ubicación
                      </Text>
                    </TouchableOpacity>
                    
                    {negocio.sitio_web && (
                      <TouchableOpacity 
                        style={[styles.actionButton, isTablet && styles.actionButtonTablet]}
                        onPress={() => Linking.openURL(negocio.sitio_web)}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.actionIconContainer, styles.webButton]}>
                          <Ionicons name="globe-outline" size={isTablet ? 26 : 22} color="white" />
                        </View>
                        <Text style={[styles.actionButtonText, isTablet && styles.actionButtonTextTablet]}>
                          Web
                        </Text>
                      </TouchableOpacity>
                    )}
                  </Animated.View>

                  {/* Info Cards */}
                  <Animated.View 
                    style={[
                      styles.infoCards,
                      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                  >
                    <View style={[styles.infoCard, isTablet && styles.infoCardTablet]}>
                      <Ionicons name="time-outline" size={isTablet ? 28 : 24} color="#FF7D1A" />
                      <View style={styles.infoCardContent}>
                        <Text style={[styles.infoCardLabel, isTablet && styles.infoCardLabelTablet]}>
                          Horario hoy
                        </Text>
                        <Text style={[styles.infoCardValue, isTablet && styles.infoCardValueTablet]}>
                          {negocio.horario || "9:00 AM - 6:00 PM"}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={[styles.infoCard, isTablet && styles.infoCardTablet]}>
                      <Ionicons name="location-outline" size={isTablet ? 28 : 24} color="#FF7D1A" />
                      <View style={styles.infoCardContent}>
                        <Text style={[styles.infoCardLabel, isTablet && styles.infoCardLabelTablet]}>
                          Dirección
                        </Text>
                        <Text style={[styles.infoCardValue, isTablet && styles.infoCardValueTablet]} numberOfLines={2}>
                          {negocio.ubicacion || "Dirección no disponible"}
                        </Text>
                      </View>
                    </View>
                  </Animated.View>

                  {/* Horarios */}
                  {negocio.horarios && typeof negocio.horarios === 'object' && (
                    <Animated.View 
                      style={[
                        styles.section,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                      ]}
                    >
                      <Text style={[styles.sectionTitle, isTablet && styles.sectionTitleTablet]}>
                        Horarios
                      </Text>
                      <View style={[styles.scheduleCard, isTablet && styles.scheduleCardTablet]}>
                        {Object.keys(negocio.horarios).map((dia) => (
                          <View key={dia} style={styles.scheduleRow}>
                            <Text style={[styles.scheduleDay, isTablet && styles.scheduleDayTablet]}>
                              {dia.charAt(0).toUpperCase() + dia.slice(1)}
                            </Text>
                            <Text style={[styles.scheduleTime, isTablet && styles.scheduleTimeTablet]}>
                              {negocio.horarios[dia].apertura.hora}:{negocio.horarios[dia].apertura.minuto} {negocio.horarios[dia].apertura.ampm}
                              {' - '}
                              {negocio.horarios[dia].cierre.hora}:{negocio.horarios[dia].cierre.minuto} {negocio.horarios[dia].cierre.ampm}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </Animated.View>
                  )}
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // Contenedores principales
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  desktopContainer: {
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
  
  // Estados de carga y error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingContent: {
    alignItems: 'center',
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
  errorContent: {
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
    color: '#555',
    textAlign: 'center',
  },
  
  // Imagen de cabecera
  imageContainer: {
    position: 'relative',
    zIndex: 1,
    borderRadius: 0,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    zIndex: 2,
  },
  backIconButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 28,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  headerTitleContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  headerTitleTablet: {
    fontSize: 22,
  },
  floatingCategoryBadge: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: '#FF7D1A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    zIndex: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // Contenido principal
  contentScrollView: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  scrollViewContentDesktop: {
    paddingBottom: 60,
  },
  contentContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
    paddingTop: 32,
    paddingBottom: 40,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  
  // Layouts responsivos
  desktopGrid: {
    flexDirection: 'row',
    gap: 40,
  },
  mobileLayout: {
    flexDirection: 'column',
  },
  mainColumn: {
    flex: 2,
  },
  sideColumn: {
    flex: 1,
    minWidth: 320,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Header del contenido
  headerContainer: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 38,
  },
  titleTablet: {
    fontSize: 36,
  },
  businessType: {
    fontSize: 16,
    color: '#FF7D1A',
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  businessTypeTablet: {
    fontSize: 18,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starIcon: {
    marginRight: 4,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 18,
    color: '#333',
    fontWeight: '700',
  },
  ratingTextTablet: {
    fontSize: 20,
  },
  loginPrompt: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
  loginPromptTablet: {
    fontSize: 16,
  },
  
  // Sección de comentarios
  commentSection: {
    marginTop: 20,
  },
  commentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  commentToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF7D1A',
  },
  commentInputContainer: {
    overflow: 'hidden',
  },
  commentInput: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    minHeight: 80,
    fontSize: 16,
    backgroundColor: '#fafafa',
    textAlignVertical: 'top',
  },
  commentInputTablet: {
    fontSize: 18,
    minHeight: 100,
  },
  saveCommentButton: {
    backgroundColor: '#FF7D1A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  saveCommentButtonTablet: {
    padding: 20,
  },
  saveCommentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // Botones de acción
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 32,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    marginHorizontal: -8,
  },
  actionButtonsDesktop: {
    flexDirection: 'column',
    marginHorizontal: 0,
    gap: 16,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  actionButtonTablet: {
    padding: 12,
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  callButton: {
    backgroundColor: '#FF7D1A',
  },
  locationButton: {
    backgroundColor: '#4CAF50',
  },
  webButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  actionButtonTextTablet: {
    fontSize: 16,
  },
  
  // Info Cards
  infoCards: {
    marginBottom: 32,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#FF7D1A',
  },
  infoCardTablet: {
    padding: 24,
  },
  infoCardContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoCardLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCardLabelTablet: {
    fontSize: 14,
  },
  infoCardValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    lineHeight: 22,
  },
  infoCardValueTablet: {
    fontSize: 18,
  },
  
  // Secciones
  section: {
    marginBottom: 32,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 3,
    borderBottomColor: '#FF7D1A',
    alignSelf: 'flex-start',
  },
  sectionTitleTablet: {
    fontSize: 28,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: '#444',
    textAlign: 'justify',
  },
  descriptionTablet: {
    fontSize: 18,
    lineHeight: 28,
  },
  
  // Productos
  productsList: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  productsListTablet: {
    borderRadius: 20,
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#FF7D1A',
  },
  productCardTablet: {
    padding: 24,
  },
  productName: {
    fontSize: 16,
    flex: 1,
    fontWeight: '500',
    color: '#333',
  },
  productNameTablet: {
    fontSize: 18,
  },
  productPrice: {
    fontWeight: '800',
    color: '#FF7D1A',
    fontSize: 18,
  },
  productPriceTablet: {
    fontSize: 20,
  },
  
  // Horarios
  scheduleCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scheduleCardTablet: {
    padding: 24,
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  scheduleDay: {
    fontWeight: '700',
    color: '#555',
    width: 100,
    fontSize: 14,
  },
  scheduleDayTablet: {
    fontSize: 16,
  },
  scheduleTime: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  scheduleTimeTablet: {
    fontSize: 16,
  },
  
  // Comentarios
  commentsList: {
    gap: 16,
  },
  commentCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD700',
  },
  commentCardTablet: {
    padding: 24,
  },
  commentRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentStar: {
    marginRight: 2,
  },
  commentText: {
    color: '#333',
    fontSize: 15,
    lineHeight: 22,
  },
  commentTextTablet: {
    fontSize: 17,
  },
  noComment: {
    color: '#aaa',
    fontStyle: 'italic',
  },
  
  // Estados vacíos
  emptyStateText: {
    textAlign: 'center',
    color: '#777',
    fontStyle: 'italic',
    padding: 24,
    fontSize: 16,
  },
  
  // Botón de regreso
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});