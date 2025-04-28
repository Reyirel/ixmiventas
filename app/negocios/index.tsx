'use client';
import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  ActivityIndicator,
  Animated,
  LayoutAnimation,
  UIManager,
  Platform,
  StyleSheet,
  useWindowDimensions,
<<<<<<< HEAD
  TextInput
=======
  TextInput,
  TouchableOpacity,
  ScrollView
>>>>>>> 31887404d47f8bd8fc4a755b0683755c7ee2851f
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const isWeb = Platform.OS === 'web';

// Definimos colores para mantener consistencia
const COLORS = {
  primary: '#FFFFFF',
  burgundy: '#800020',
  gold: '#D4AF37',
  text: '#333333',
  lightGray: '#F5F5F5',
  gray: '#888888',
  lightBurgundy: '#f0e6e8',
  darkGold: '#b8941d'
};

// Componente de esqueleto para carga
const SkeletonItem = ({ isDesktop }) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: pulseAnim,
          flex: isDesktop ? 1 : undefined,
          marginHorizontal: isDesktop ? 6 : 0,
          marginBottom: 12
        }
      ]}
    >
      <View style={styles.skeletonImage} />
      <View style={styles.cardContent}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonDesc} />
        <View style={styles.skeletonDesc} />
        <View style={styles.footer}>
          <View style={styles.skeletonLocation} />
          <View style={styles.skeletonButton} />
        </View>
      </View>
    </Animated.View>
  );
};

// Componente separado para cada item de negocio
const AnimatedItem = React.memo(({ item, index, onPress, isDesktop }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay: index * 80,
        useNativeDriver: true
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 500,
        delay: index * 80,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity,
          transform: [{ scale }],
<<<<<<< HEAD
          marginBottom: isDesktop ? 15 : 70, // Aún más espacio en móvil
=======
          marginBottom: 16,
>>>>>>> 31887404d47f8bd8fc4a755b0683755c7ee2851f
          flex: isDesktop ? 1 : undefined,
          marginHorizontal: isDesktop ? 6 : 0,
        }
      ]}
    >
      <Pressable
        android_ripple={{ color: COLORS.lightGray }}
        onPress={onPress}
        style={styles.cardPressable}
      >
        {item.imagen_url ? (
          <Image source={{ uri: item.imagen_url }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="business-outline" size={40} color={COLORS.burgundy} />
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.title}>{item.nombre}</Text>
          <Text numberOfLines={2} style={styles.description}>{item.descripcion}</Text>

          <View style={styles.footer}>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={14} color={COLORS.burgundy} />
              <Text style={styles.location}>{item.ubicacion}</Text>
            </View>

            <TouchableOpacity style={styles.viewButton} onPress={onPress}>
              <Text style={styles.viewButtonText}>Ver detalles</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.gold} />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

// Componente de filtros
const FilterBar = ({ onSearch, activeFilter, setActiveFilter }) => {
  const [expanded, setExpanded] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { width } = useWindowDimensions(); // Añadir esto para detectar tamaño
  
  const filters = ['Todos', 'Nombre', 'Descripción', 'Ubicación'];
  const isMobile = width < 500; // Punto de quiebre para dispositivos muy pequeños
  
  const handleSearch = (text) => {
    setSearchText(text);
    onSearch(text);
  };
  
  return (
    <View style={styles.filterContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.burgundy} />
        <TextInput
          style={styles.searchInput}
          placeholder={isMobile ? "Buscar..." : "Buscar negocios..."}
          placeholderTextColor={COLORS.gray}
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.burgundy} />
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.filterButton} 
        onPress={() => setExpanded(!expanded)}
      >
        <Ionicons name="options-outline" size={22} color={COLORS.burgundy} />
        <Text style={styles.filterButtonText}>Filtros</Text>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.filterOptions}>
          <Text style={styles.filterTitle}>Buscar por:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  activeFilter === filter && styles.activeFilterChip
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    activeFilter === filter && styles.activeFilterChipText
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default function Negocios() {
  const [negocios, setNegocios] = useState<any[]>([]);
  const [filteredNegocios, setFilteredNegocios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
<<<<<<< HEAD
  const [filtro, setFiltro] = useState('');
=======
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
>>>>>>> 31887404d47f8bd8fc4a755b0683755c7ee2851f
  const router = useRouter();
  const { width } = useWindowDimensions();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  // Mejorar la detección de tamaños de pantalla
  const isDesktop = width >= 768;
  const isMobile = width < 500;
  const numColumns = isDesktop ? (width > 1200 ? 4 : 3) : 1;

  const fetchNegocios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('negocios')
      .select('*')
      .eq('aprobado', true)
      .order('created_at', { ascending: false });

    if (error) console.error('Error al cargar negocios:', error.message);
    else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setNegocios(data || []);
      setFilteredNegocios(data || []);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true
        })
      ]).start();
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNegocios();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNegocios();
  }, []);

<<<<<<< HEAD
  // Filtrar negocios por nombre
  const negociosFiltrados = negocios.filter(n =>
    n.nombre?.toLowerCase().includes(filtro.toLowerCase())
  );

  // Renderizar los elementos en filas para vista de escritorio
  const renderDesktopContent = (filteredNegocios) => {
=======
  // Función para filtrar los negocios según la búsqueda y el filtro activo
  const handleSearch = (text) => {
    setSearchQuery(text);
    
    if (!text.trim()) {
      setFilteredNegocios(negocios);
      return;
    }
    
    const lowercasedQuery = text.toLowerCase();
    let filtered = [];
    
    switch (activeFilter) {
      case 'Nombre':
        filtered = negocios.filter(item => 
          item.nombre.toLowerCase().includes(lowercasedQuery)
        );
        break;
      case 'Descripción':
        filtered = negocios.filter(item => 
          item.descripcion.toLowerCase().includes(lowercasedQuery)
        );
        break;
      case 'Ubicación':
        filtered = negocios.filter(item => 
          item.ubicacion.toLowerCase().includes(lowercasedQuery)
        );
        break;
      case 'Todos':
      default:
        filtered = negocios.filter(item => 
          item.nombre.toLowerCase().includes(lowercasedQuery) ||
          item.descripcion.toLowerCase().includes(lowercasedQuery) ||
          item.ubicacion.toLowerCase().includes(lowercasedQuery)
        );
        break;
    }
    
    setFilteredNegocios(filtered);
  };

  useEffect(() => {
    handleSearch(searchQuery);
  }, [activeFilter, negocios]);

  // Renderizar los elementos para el modo escritorio
  const renderDesktopContent = () => {
    if (loading) {
      return (
        <View style={styles.desktopSkeletonContainer}>
          {[...Array(6)].map((_, index) => (
            <SkeletonItem key={`skeleton-${index}`} isDesktop={true} />
          ))}
        </View>
      );
    }
    
>>>>>>> 31887404d47f8bd8fc4a755b0683755c7ee2851f
    const rows = [];
    for (let i = 0; i < filteredNegocios.length; i += 3) {
      const rowItems = filteredNegocios.slice(i, i + 3);
      rows.push(
        <View key={`row-${i}`} style={styles.desktopRow}>
          {rowItems.map((item, index) => (
            <AnimatedItem
              key={item.id}
              item={item}
              index={i + index}
              onPress={() => router.push(`/negocios/${item.id}`)}
              isDesktop={true}
            />
          ))}
          {rowItems.length < 3 && [...Array(3 - rowItems.length)].map((_, j) => (
            <View key={`empty-${j}`} style={{ flex: 1, marginHorizontal: 6 }} />
          ))}
        </View>
      );
    }
    
    if (rows.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={70} color={COLORS.gray} />
          <Text style={styles.emptyText}>No se encontraron negocios</Text>
          <Text style={styles.emptySubtext}>Intenta con otra búsqueda</Text>
        </View>
      );
    }
    
    return rows;
  };

  return (
    <View style={styles.container}>
<<<<<<< HEAD
      {/* Navbar con título */}
      <View style={styles.navbar}>
        <Ionicons name="business" size={28} color={COLORS.burgundy} style={{ marginRight: 10 }} />
        <Text style={styles.header}>Negocios disponibles</Text>
        <View style={{ flex: 1 }} />
        <Pressable
          style={({ pressed }) => [
            styles.navButton,
            pressed && { backgroundColor: COLORS.gold, opacity: 0.85 }
          ]}
          onPress={() => router.push('/')}
        >
          <Ionicons name="home-outline" size={20} color={COLORS.burgundy} />
          <Text style={styles.navButtonText}>Menú</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.navButton,
            pressed && { backgroundColor: COLORS.gold, opacity: 0.85 }
          ]}
          onPress={() => router.push('/auth/login')}
        >
          <Ionicons name="person-circle-outline" size={20} color={COLORS.burgundy} />
          <Text style={styles.navButtonText}>Login</Text>
        </Pressable>
      </View>

      {/* Filtro */}
      <TextInput
        style={styles.filtroInput}
        placeholder="Buscar negocio..."
        value={filtro}
        onChangeText={setFiltro}
        placeholderTextColor={COLORS.gray}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : isDesktop ? (
        <Animated.ScrollView contentContainerStyle={styles.desktopContainer}>
          {/* Usa negociosFiltrados en vez de negocios */}
          {renderDesktopContent(negociosFiltrados)}
        </Animated.ScrollView>
      ) : (
        <Animated.FlatList
          data={negociosFiltrados}
=======
      <Animated.View 
        style={[
          styles.headerContainer, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: translateY }]
          }
        ]}
      >
        <View style={styles.headerContent}>
          <View style={[styles.headerTop, isMobile && styles.headerTopMobile]}>
            <Text style={[styles.header, isMobile && styles.headerMobile]}>Negocios</Text>
            <View style={[styles.navButtons, isMobile && styles.navButtonsMobile]}>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => router.push('/')}
              >
                <Ionicons name="home-outline" size={18} color={COLORS.burgundy} />
                {!isMobile && <Text style={styles.navButtonText}>Inicio</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => router.push('/login')}
              >
                <Ionicons name="log-in-outline" size={18} color={COLORS.burgundy} />
                {!isMobile && <Text style={styles.navButtonText}>Iniciar sesión</Text>}
              </TouchableOpacity>
            </View>
          </View>
          
          <FilterBar 
            onSearch={handleSearch} 
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        </View>
      </Animated.View>
      
      {loading && !isDesktop ? (
        <View style={styles.loadingContainer}>
          {[...Array(3)].map((_, index) => (
            <SkeletonItem key={`skeleton-${index}`} isDesktop={false} />
          ))}
        </View>
      ) : isDesktop ? (
        <Animated.ScrollView 
          contentContainerStyle={styles.desktopContainer}
          style={{ opacity: fadeAnim }}
        >
          {renderDesktopContent()}
        </Animated.ScrollView>
      ) : (
        <Animated.FlatList
          data={filteredNegocios}
>>>>>>> 31887404d47f8bd8fc4a755b0683755c7ee2851f
          keyExtractor={(item) => item.id}
          style={{ opacity: fadeAnim }}
          renderItem={({ item, index }) => (
            <AnimatedItem
              item={item}
              index={index}
              onPress={() => router.push(`/negocios/${item.id}`)}
              isDesktop={false}
            />
          )}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={70} color={COLORS.gray} />
              <Text style={styles.emptyText}>No se encontraron negocios</Text>
              <Text style={styles.emptySubtext}>Intenta con otra búsqueda</Text>
            </View>
          }
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f8f8' 
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,  // Reducir padding horizontal para móviles
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContent: {
    width: '100%',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap', // Permitir envolver elementos si no caben
  },
  headerTopMobile: {
    marginBottom: 12,
  },
  header: { 
    fontSize: 28, 
    fontWeight: 'bold',
    color: COLORS.burgundy,
  },
  headerMobile: {
    fontSize: 24, // Texto más pequeño para móviles
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButtonsMobile: {
    marginTop: 8, // Espacio adicional en móviles
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(128, 0, 32, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 24,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 32, 0.12)',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    color: COLORS.burgundy,
  },
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    height: 'auto',
    minHeight: 280,
    maxHeight: 350, // Limitar altura máxima
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardContent: {
    padding: 16, // Reducir padding para mejor uso del espacio
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18, // Reducir tamaño para evitar desbordamiento
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.burgundy,
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 16,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  location: {
    fontSize: 13,
    color: COLORS.gray,
    marginLeft: 4,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.burgundy,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  viewButtonText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  loadingContainer: {
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
    flex: 1,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray,
    textAlign: 'center',
  },
<<<<<<< HEAD
  
  // Nuevos estilos para el diseño web en grid
  webGridContainer: {
    padding: 15,
    paddingTop: 5,
  },
  webRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  webItemContainer: {
    width: '32%', // Aproximadamente 1/3 del ancho con algo de espacio entre columnas
    marginBottom: 15,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: isWeb ? 20 : 10,
    paddingBottom: 5,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    borderWidth: 1,
    borderColor: COLORS.burgundy,
    shadowColor: COLORS.burgundy,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  navButtonText: {
    marginLeft: 8,
    color: COLORS.burgundy,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.2,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 18,
    marginTop: 18,
    marginBottom: 18,
    shadowColor: COLORS.burgundy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.burgundy,
    textShadowColor: '#d4af3740',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
  },
  pressable: { 
    overflow: 'hidden', 
    borderRadius: 12 
  },
  image: { 
    height: 150, 
    width: '100%', 
    borderTopLeftRadius: 12, 
    borderTopRightRadius: 12 
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginTop: 10, 
    marginHorizontal: 12 
  },
  desc: { 
    fontSize: 14, 
    color: '#555', 
    marginHorizontal: 12, 
    marginTop: 4, 
    marginBottom: 12 
  },
  location: { 
    fontSize: 12, 
    color: 'gray', 
    margin: 12 
=======
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
>>>>>>> 31887404d47f8bd8fc4a755b0683755c7ee2851f
  },
  desktopContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  desktopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Mejor distribución de espacio
    flexWrap: 'wrap', // Permitir envolver para tamaños intermedios
    marginBottom: 16,
  },
  listContainer: {
    padding: 16,
    paddingTop: 10,
  },
  
  // Componentes de búsqueda y filtros
  filterContainer: {
    marginTop: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f5',
    borderRadius: 16,
    paddingHorizontal: 12, // Reducir padding
    paddingVertical: 10,
    marginBottom: 12,
<<<<<<< HEAD
  },
  filtroInput: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginVertical: 12,
    color: COLORS.text,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
=======
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  searchInput: {
    flex: 1,
    fontSize: 15, // Reducir tamaño de fuente
    marginLeft: 8,
    color: COLORS.text,
    padding: 0,
    fontWeight: '400',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(128, 0, 32, 0.08)',
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: 'flex-start', // Para que no ocupe todo el ancho
  },
  // Mejorar la presentación en modo escritorio
  desktopContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  desktopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Mejor distribución de espacio
    flexWrap: 'wrap', // Permitir envolver para tamaños intermedios
    marginBottom: 16,
  },
  listContainer: {
    padding: 16,
    paddingTop: 10,
  },
  
  // Estilos para skeleton loading
  skeletonImage: {
    height: 160,
    backgroundColor: '#e0e0e0',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  skeletonTitle: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginTop: 8,
    width: '70%',
    marginBottom: 12,
  },
  skeletonDesc: {
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
    width: '100%',
  },
  skeletonLocation: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    width: '40%',
  },
  skeletonButton: {
    height: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    width: 100,
  },
  desktopSkeletonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 20,
  }
>>>>>>> 31887404d47f8bd8fc4a755b0683755c7ee2851f
});