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
  TextInput,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const isWeb = Platform.OS === 'web';

const COLORS = {
  primary: '#FFFFFF',
  burgundy: '#800020',
  gold: '#D4AF37',
  text: '#333333',
  lightGray: '#F5F5F5',
  gray: '#888888',
  lightBurgundy: '#f0e6e8',
  darkGold: '#b8941d',
  background: '#F0F2F5',
  border: '#E4E6EB'
};

const CATEGORIAS = [
  'Restaurante',
  'Tienda',
  'Servicios',
  'Entretenimiento',
  'Salud',
  'Tecnología',
  'Hogar',
  'Educación',
  'Ropa',
  'Supermercado',
  'Otro'
];

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

const AnimatedItem = React.memo(({ item, index, onPress, isDesktop }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

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
          marginBottom: 16,
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
              <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const FilterBar = ({ onSearch, activeFilter, setActiveFilter }) => {
  const [searchText, setSearchText] = useState('');
  const { width } = useWindowDimensions();
  
  const filters = ['Todos', 'Nombre', 'Descripción', 'Ubicación'];
  const isMobile = width < 500;
  
  const handleSearch = (text) => {
    setSearchText(text);
    onSearch(text);
  };
  
  return (
    <View style={styles.filterContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder={isMobile ? "Buscar..." : "Buscar negocios..."}
          placeholderTextColor={COLORS.gray}
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.filterTabsContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              activeFilter === filter && styles.activeFilterTab
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === filter && styles.activeFilterTabText
              ]}
            >
              {filter}
            </Text>
            {activeFilter === filter && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const CategoriesPanel = ({ activeCategory, setActiveCategory }) => {
  return (
    <View style={styles.categoriesPanel}>
      <View style={styles.categoriesHeader}>
        <Text style={styles.categoriesPanelTitle}>Categorías</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          style={[
            styles.categoryItem, 
            activeCategory === 'all' && styles.activeCategoryItem
          ]}
          onPress={() => setActiveCategory('all')}
        >
          <View style={[styles.categoryIcon, { backgroundColor: COLORS.burgundy }]}>
            <Ionicons name="grid-outline" size={18} color={COLORS.primary} />
          </View>
          <Text 
            style={[
              styles.categoryText, 
              activeCategory === 'all' && styles.activeCategoryText
            ]}
          >
            Todos los negocios
          </Text>
        </TouchableOpacity>
        
        {CATEGORIAS.map((category) => (
          <TouchableOpacity 
            key={category} 
            style={[
              styles.categoryItem, 
              activeCategory === category && styles.activeCategoryItem
            ]}
            onPress={() => setActiveCategory(category)}
          >
            <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(category) }]}>
              <Ionicons name={getCategoryIcon(category)} size={18} color={COLORS.primary} />
            </View>
            <Text 
              style={[
                styles.categoryText, 
                activeCategory === category && styles.activeCategoryText
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const TopRatedPanel = ({ topBusinesses, router }) => {
  return (
    <View style={styles.topRatedPanel}>
      <View style={styles.topRatedHeader}>
        <Text style={styles.topRatedTitle}>Mejor calificados</Text>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {topBusinesses.map((business) => (
          <TouchableOpacity
            key={business.id}
            style={styles.topRatedItem}
            onPress={() => router.push(`/negocios/${business.id}`)}
          >
            <View style={styles.topRatedImageContainer}>
              {business.imagen_url ? (
                <Image source={{ uri: business.imagen_url }} style={styles.topRatedImage} />
              ) : (
                <View style={styles.topRatedPlaceholder}>
                  <Ionicons name="business-outline" size={16} color={COLORS.burgundy} />
                </View>
              )}
            </View>
            
            <View style={styles.topRatedContent}>
              <Text style={styles.topRatedName} numberOfLines={1}>
                {business.nombre}
              </Text>
              <View style={styles.topRatedRating}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons
                    key={i}
                    name={i < Math.round(business.calificacion || 0) ? "star" : "star-outline"}
                    size={12}
                    color={COLORS.gold}
                    style={styles.topRatedStar}
                  />
                ))}
                <Text style={styles.topRatedScore}>
                  {business.calificacion?.toFixed(1) || '0.0'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const getCategoryIcon = (category) => {
  const icons = {
    'Restaurante': 'restaurant-outline',
    'Tienda': 'cart-outline',
    'Servicios': 'briefcase-outline',
    'Entretenimiento': 'film-outline',
    'Salud': 'medical-outline',
    'Tecnología': 'hardware-chip-outline',
    'Hogar': 'home-outline',
    'Educación': 'school-outline',
    'Ropa': 'shirt-outline',
    'Supermercado': 'basket-outline',
    'Otro': 'apps-outline'
  };
  
  return icons[category] || 'apps-outline';
};

const getCategoryColor = (category) => {
  const colors = {
    'Restaurante': '#E91E63',
    'Tienda': '#2196F3',
    'Servicios': '#4CAF50',
    'Entretenimiento': '#9C27B0',
    'Salud': '#00BCD4',
    'Tecnología': '#3F51B5',
    'Hogar': '#FF9800',
    'Educación': '#607D8B',
    'Ropa': '#795548',
    'Supermercado': '#009688',
    'Otro': '#757575'
  };
  
  return colors[category] || COLORS.burgundy;
};

export default function Negocios() {
  const [negocios, setNegocios] = useState<any[]>([]);
  const [filteredNegocios, setFilteredNegocios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [topRatedBusinesses, setTopRatedBusinesses] = useState([]);
  const router = useRouter();
  const { width } = useWindowDimensions();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const isDesktop = width >= 768;
  const isLargeDesktop = width >= 1200;
  const isMobile = width < 500;

  const extractCategories = (data) => {
    // Extraemos solo las categorías que están en nuestra lista predefinida
    const categoriesSet = new Set();
    data.forEach(item => {
      if (item.categoria && CATEGORIAS.includes(item.categoria)) {
        categoriesSet.add(item.categoria);
      }
    });
    return Array.from(categoriesSet);
  };

  const getTopRatedBusinesses = (data) => {
    return [...data]
      .sort((a, b) => (b.calificacion || 0) - (a.calificacion || 0))
      .slice(0, 5);
  };

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
      
      setCategories(extractCategories(data || []));
      setTopRatedBusinesses(getTopRatedBusinesses(data || []));
      
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

  const handleSearch = (text) => {
    setSearchQuery(text);
    
    if (!text.trim() && activeCategory === 'all') {
      setFilteredNegocios(negocios);
      return;
    }
    
    const lowercasedQuery = text.toLowerCase();
    let filtered = negocios;
    
    if (activeCategory !== 'all') {
      filtered = filtered.filter(item => item.categoria === activeCategory);
    }
    
    if (text.trim()) {
      switch (activeFilter) {
        case 'Nombre':
          filtered = filtered.filter(item => 
            item.nombre.toLowerCase().includes(lowercasedQuery)
          );
          break;
        case 'Descripción':
          filtered = filtered.filter(item => 
            item.descripcion.toLowerCase().includes(lowercasedQuery)
          );
          break;
        case 'Ubicación':
          filtered = filtered.filter(item => 
            item.ubicacion.toLowerCase().includes(lowercasedQuery)
          );
          break;
        case 'Todos':
        default:
          filtered = filtered.filter(item => 
            item.nombre.toLowerCase().includes(lowercasedQuery) ||
            item.descripcion.toLowerCase().includes(lowercasedQuery) ||
            item.ubicacion.toLowerCase().includes(lowercasedQuery)
          );
          break;
      }
    }
    
    setFilteredNegocios(filtered);
  };

  useEffect(() => {
    handleSearch(searchQuery);
  }, [activeFilter, activeCategory, negocios]);

  const renderMainContent = () => {
    if (loading) {
      return (
        <View style={styles.feedContainer}>
          {[...Array(6)].map((_, index) => (
            <SkeletonItem key={`skeleton-${index}`} isDesktop={true} />
          ))}
        </View>
      );
    }
    
    if (filteredNegocios.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={70} color={COLORS.gray} />
          <Text style={styles.emptyText}>No se encontraron negocios</Text>
          <Text style={styles.emptySubtext}>Intenta con otra búsqueda</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.feedContainer}>
        {filteredNegocios.map((item, index) => (
          <AnimatedItem
            key={item.id}
            item={item}
            index={index}
            onPress={() => router.push(`/negocios/${item.id}`)}
            isDesktop={true}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
                onPress={() => router.push('/auth/login')}
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
        <View style={styles.threeColumnLayout}>
          <Animated.View 
            style={[
              styles.leftPanel, 
              { opacity: fadeAnim }
            ]}
          >
            <CategoriesPanel 
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          </Animated.View>
          
          <Animated.ScrollView 
            contentContainerStyle={styles.desktopContainer}
            style={[{ opacity: fadeAnim }, styles.centerPanel]}
          >
            {renderMainContent()}
          </Animated.ScrollView>
          
          {isLargeDesktop && (
            <Animated.View 
              style={[
                styles.rightPanel, 
                { opacity: fadeAnim }
              ]}
            >
              <TopRatedPanel 
                topBusinesses={topRatedBusinesses}
                router={router}
              />
            </Animated.View>
          )}
        </View>
      ) : (
        <Animated.FlatList
          data={filteredNegocios}
          keyExtractor={(item) => item.id}
          style={[{ opacity: fadeAnim }, styles.scrollContent]}
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
    backgroundColor: COLORS.background 
  },
  headerContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  headerContent: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  headerTopMobile: {
    marginBottom: 10,
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold',
    color: COLORS.burgundy,
  },
  headerMobile: {
    fontSize: 22,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButtonsMobile: {
    marginTop: 4,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(128, 0, 32, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginLeft: 10,
    borderWidth: 0,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
    color: COLORS.burgundy,
  },
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    height: 'auto',
    minHeight: 200,
    maxHeight: 350,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    width: '100%',
    maxWidth: 730,
    alignSelf: 'center',
  },
  cardContent: {
    padding: 14,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: COLORS.burgundy,
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
    borderRadius: 6,
  },
  viewButtonText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    backgroundColor: '#e0e0e0',
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0e6e8',
  },
  loadingContainer: {
    padding: 16,
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
  desktopContainer: {
    padding: 16,
    paddingBottom: 30,
    alignItems: 'center',
  },
  feedContainer: {
    width: '100%',
    maxWidth: 650,
    alignSelf: 'center',
  },
  scrollContent: {
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: 16,
    paddingTop: 10,
    alignItems: 'center',
  },
  filterContainer: {
    marginBottom: 0,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 8,
    color: COLORS.text,
    padding: 0,
    fontWeight: '400',
  },
  filterTabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: 'relative',
    marginRight: 8,
  },
  activeFilterTab: {
    borderBottomWidth: 0,
  },
  filterTabText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: COLORS.burgundy,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.burgundy,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  skeletonImage: {
    height: 200,
    backgroundColor: '#e0e0e0',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
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
    borderRadius: 6,
    width: 100,
  },
  threeColumnLayout: {
    flexDirection: 'row',
    flex: 1,
    backgroundColor: COLORS.background,
  },
  leftPanel: {
    width: 260,
    backgroundColor: COLORS.primary,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    paddingTop: 16,
    display: 'flex',
  },
  centerPanel: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  rightPanel: {
    width: 300,
    backgroundColor: COLORS.primary,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    paddingTop: 16,
  },
  categoriesPanel: {
    flex: 1,
    padding: 8,
  },
  categoriesHeader: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  categoriesPanelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.burgundy,
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 4,
    borderRadius: 8,
  },
  activeCategoryItem: {
    backgroundColor: COLORS.lightBurgundy,
  },
  categoryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  activeCategoryText: {
    color: COLORS.burgundy,
    fontWeight: 'bold',
  },
  topRatedPanel: {
    flex: 1,
    padding: 8,
  },
  topRatedHeader: {
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  topRatedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.burgundy,
    marginBottom: 16,
  },
  topRatedItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topRatedImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  topRatedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topRatedPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.lightBurgundy,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topRatedContent: {
    flex: 1,
    justifyContent: 'center',
  },
  topRatedName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.burgundy,
    marginBottom: 4,
  },
  topRatedRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topRatedStar: {
    marginRight: 2,
  },
  topRatedScore: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 4,
  }
});