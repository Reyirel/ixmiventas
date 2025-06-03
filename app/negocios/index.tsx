'use client';
import { useEffect, useState, useRef, useMemo } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  border: '#E4E6EB',
  overlay: 'rgba(0,0,0,0.7)'
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

// Función para generar un seed basado en un identificador de dispositivo
const getDeviceSpecificSeed = async () => {
  try {
    let deviceSeed = await AsyncStorage.getItem('deviceSeed');
    if (!deviceSeed) {
      deviceSeed = Math.random().toString(36).substring(2, 15);
      await AsyncStorage.setItem('deviceSeed', deviceSeed);
    }
    return deviceSeed;
  } catch (e) {
    return new Date().getDate().toString();
  }
};

// Función para aleatorizar array con seed específico
const shuffleArray = (array, seed) => {
  const newArray = [...array];
  const seededRandom = (function () {
    let s = 1779 + seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return function () {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
  })();

  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }

  return newArray;
};

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

const AnimatedItem = React.memo(({ item, index, onPress, isDesktop, isMobile }) => {
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
          marginHorizontal: isDesktop ? 8 : 0,
        },
        isMobile && styles.cardMobile,
        isDesktop && styles.cardDesktop
      ]}
    >
      <Pressable
        android_ripple={{ color: COLORS.lightGray }}
        onPress={onPress}
        style={styles.cardPressable}
      >
        {item.imagen_url ? (
          <Image 
            source={{ uri: item.imagen_url }} 
            style={[styles.image, isMobile && styles.imageMobile, isDesktop && styles.imageDesktop]} 
          />
        ) : (
          <View style={[
            styles.placeholderImage, 
            isMobile && styles.placeholderImageMobile,
            isDesktop && styles.placeholderImageDesktop
          ]}>
            <Ionicons 
              name="business-outline" 
              size={isMobile ? 30 : isDesktop ? 60 : 40} 
              color={COLORS.burgundy} 
            />
          </View>
        )}

        <View style={[styles.cardContent, isMobile && styles.cardContentMobile]}>
          <Text style={[
            styles.title, 
            isMobile && styles.titleMobile,
            isDesktop && styles.titleDesktop
          ]}>{item.nombre}</Text>
          <Text 
            numberOfLines={isDesktop ? 3 : 2} 
            style={[
              styles.description, 
              isMobile && styles.descriptionMobile,
              isDesktop && styles.descriptionDesktop
            ]}
          >
            {item.descripcion}
          </Text>

          <View style={styles.footer}>
            <View style={styles.locationContainer}>
              <Ionicons 
                name="location" 
                size={isMobile ? 12 : isDesktop ? 18 : 14} 
                color={COLORS.burgundy} 
              />
              <Text style={[
                styles.location, 
                isMobile && styles.locationMobile,
                isDesktop && styles.locationDesktop
              ]}>
                {item.ubicacion}
              </Text>
            </View>

            <TouchableOpacity 
              style={[
                styles.viewButton, 
                isMobile && styles.viewButtonMobile,
                isDesktop && styles.viewButtonDesktop
              ]} 
              onPress={onPress}
            >
              <Text style={[
                styles.viewButtonText, 
                isMobile && styles.viewButtonTextMobile,
                isDesktop && styles.viewButtonTextDesktop
              ]}>
                Ver detalles
              </Text>
              <Ionicons 
                name="chevron-forward" 
                size={isMobile ? 12 : isDesktop ? 16 : 14} 
                color={COLORS.primary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const FilterBar = ({ onSearch, activeFilter, setActiveFilter, isMobile }) => {
  const [searchText, setSearchText] = useState('');

  const filters = ['Todos', 'Nombre', 'Descripción', 'Ubicación'];

  const handleSearch = (text = '') => {
    setSearchText(text);
    onSearch(text);
  };

  return (
    <View style={styles.filterContainer}>
      <View style={[styles.searchBar, isMobile && styles.searchBarMobile]}>
        <Ionicons name="search" size={isMobile ? 16 : 20} color={COLORS.gray} />
        <TextInput
          style={[styles.searchInput, isMobile && styles.searchInputMobile]}
          placeholder={isMobile ? "Buscar..." : "Buscar negocios..."}
          placeholderTextColor={COLORS.gray}
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={isMobile ? 16 : 20} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={isMobile ? styles.filterTabsScrollMobile : {}}
      >
        <View style={[styles.filterTabsContainer, isMobile && styles.filterTabsContainerMobile]}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                isMobile && styles.filterTabMobile,
                activeFilter === filter && styles.activeFilterTab
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  isMobile && styles.filterTabTextMobile,
                  activeFilter === filter && styles.activeFilterTabText
                ]}
              >
                {filter}
              </Text>
              {activeFilter === filter && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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

const MobileSidePanel = ({ 
  isVisible, 
  onClose, 
  activeCategory, 
  setActiveCategory,
  topBusinesses,
  router
}) => {
  const panelAnimation = useRef(new Animated.Value(isVisible ? 0 : -300)).current;
  const fadeAnimation = useRef(new Animated.Value(isVisible ? 1 : 0)).current;
  
  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(panelAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(panelAnimation, {
          toValue: -300,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [isVisible]);

  if (!isVisible && fadeAnimation._value === 0) {
    return null;
  }

  return (
    <>
      <Animated.View 
        style={[
          styles.overlay, 
          { opacity: fadeAnimation }
        ]}
        pointerEvents={isVisible ? 'auto' : 'none'}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>
      <Animated.View 
        style={[
          styles.mobilePanel,
          { transform: [{ translateX: panelAnimation }] }
        ]}
      >
        <View style={styles.mobilePanelHeader}>
          <Text style={styles.mobilePanelTitle}>Opciones</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={COLORS.burgundy} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.mobilePanelContent}>
          <Text style={styles.mobileSectionTitle}>Categorías</Text>
          
          <TouchableOpacity
            style={[
              styles.categoryItem,
              activeCategory === 'all' && styles.activeCategoryItem
            ]}
            onPress={() => {
              setActiveCategory('all');
              onClose();
            }}
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
              onPress={() => {
                setActiveCategory(category);
                onClose();
              }}
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

          <View style={styles.sectionSeparator} />

          <Text style={styles.mobileSectionTitle}>Mejor calificados</Text>
          
          {topBusinesses.map((business) => (
            <TouchableOpacity
              key={business.id}
              style={styles.topRatedItem}
              onPress={() => {
                router.push(`/negocios/${business.id}`);
                onClose();
              }}
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
      </Animated.View>
    </>
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
  const [deviceSeed, setDeviceSeed] = useState('');
  const [sidePanelVisible, setSidePanelVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  const isMobile = width < 500;
  const isTablet = width >= 500 && width < 768;
  const isDesktop = width >= 768;
  const isLargeDesktop = width >= 1200;
  const isExtraLargeDesktop = width >= 1600;

  const extractCategories = (data) => {
    const categoriesSet = new Set();
    data.forEach(item => {
      if (item.tipo && CATEGORIAS.includes(item.tipo)) {
        categoriesSet.add(item.tipo);
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

      const originalData = data || [];
      const shuffledData = deviceSeed
        ? shuffleArray(originalData, deviceSeed)
        : originalData;

      setNegocios(shuffledData);
      setFilteredNegocios(shuffledData);

      setCategories(extractCategories(originalData));
      setTopRatedBusinesses(getTopRatedBusinesses(originalData));

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
    const getSeed = async () => {
      const seed = await getDeviceSpecificSeed();
      setDeviceSeed(seed);
    };

    getSeed();
    fetchNegocios();
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);

      if (data?.user) {
        // Buscar el perfil usando user_id, no id
        const { data: perfil, error } = await supabase
          .from('perfiles')
          .select('tipo_usuario')
          .eq('user_id', data.user.id)
          .single();

        if (!error) setUserProfile(perfil);
        else setUserProfile(null);
      } else {
        setUserProfile(null);
      }
    };
    getUser();
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
      filtered = filtered.filter(item => item.tipo === activeCategory);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
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
        <View style={[styles.headerContent, isExtraLargeDesktop && styles.headerContentExtraLarge]}>
          <View style={[styles.headerTop, isMobile && styles.headerTopMobile]}>
            <Text style={[
              styles.header, 
              isMobile && styles.headerMobile,
              isTablet && styles.headerTablet
            ]}>Negocios</Text>
            <View style={[styles.navButtons, isMobile && styles.navButtonsMobile]}>
              {isMobile && (
                <TouchableOpacity
                  style={[styles.navButton, styles.navButtonMobile, styles.menuButton]}
                  onPress={() => setSidePanelVisible(true)}
                >
                  <Ionicons name="menu-outline" size={18} color={COLORS.burgundy} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.navButton, isMobile && styles.navButtonMobile]}
                onPress={() => router.push('/')}
              >
                <Ionicons name="home-outline" size={isMobile ? 16 : 18} color={COLORS.burgundy} />
                {!isMobile && <Text style={styles.navButtonText}>Inicio</Text>}
              </TouchableOpacity>

              {!user ? (
                <TouchableOpacity
                  style={[styles.navButton, isMobile && styles.navButtonMobile]}
                  onPress={() => router.push('/auth/login')}
                >
                  <Ionicons name="log-in-outline" size={isMobile ? 16 : 18} color={COLORS.burgundy} />
                  {!isMobile && <Text style={styles.navButtonText}>Iniciar sesión</Text>}
                </TouchableOpacity>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.navButton, isMobile && styles.navButtonMobile, { backgroundColor: COLORS.burgundy }]}>
                    <Text style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: 16 }}>
                      {user.user_metadata?.nombre
                        ? user.user_metadata.nombre.split(' ')[0][0].toUpperCase()
                        : user.email[0].toUpperCase()}
                    </Text>
                  </View>
                  {/* Botón Dashboard solo si es admin */}
                  {userProfile?.tipo_usuario === 'admin' && (
                    <TouchableOpacity
                      style={[styles.navButton, isMobile && styles.navButtonMobile]}
                      onPress={() => router.push('/admin/dashboard')}
                    >
                      <Ionicons name="speedometer-outline" size={isMobile ? 16 : 18} color={COLORS.burgundy} />
                      {!isMobile && <Text style={styles.navButtonText}>Dashboard</Text>}
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.navButton, isMobile && styles.navButtonMobile]}
                    onPress={handleLogout}
                  >
                    <Ionicons name="log-out-outline" size={isMobile ? 16 : 18} color={COLORS.burgundy} />
                    {!isMobile && <Text style={styles.navButtonText}>Salir</Text>}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <FilterBar
            onSearch={handleSearch}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            isMobile={isMobile}
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
              { opacity: fadeAnim },
              isExtraLargeDesktop && styles.leftPanelExtraLarge
            ]}
          >
            <CategoriesPanel
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          </Animated.View>

          <Animated.ScrollView
            contentContainerStyle={[
              styles.desktopContainer,
              isExtraLargeDesktop && styles.desktopContainerExtraLarge
            ]}
            style={[{ opacity: fadeAnim }, styles.centerPanel]}
          >
            {renderMainContent()}
          </Animated.ScrollView>

          {isLargeDesktop && (
            <Animated.View
              style={[
                styles.rightPanel,
                { opacity: fadeAnim },
                isExtraLargeDesktop && styles.rightPanelExtraLarge
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
              isMobile={isMobile}
            />
          )}
          contentContainerStyle={[
            styles.listContainer,
            isMobile && styles.listContainerMobile
          ]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={isMobile ? 50 : 70} color={COLORS.gray} />
              <Text style={styles.emptyText}>No se encontraron negocios</Text>
              <Text style={styles.emptySubtext}>Intenta con otra búsqueda</Text>
            </View>
          }
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      )}

      {/* Panel lateral móvil */}
      <MobileSidePanel
        isVisible={sidePanelVisible}
        onClose={() => setSidePanelVisible(false)}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        topBusinesses={topRatedBusinesses}
        router={router}
      />
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
  headerContentExtraLarge: {
    maxWidth: 1600,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  headerTopMobile: {
    marginBottom: 8,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.burgundy,
  },
  headerMobile: {
    fontSize: 20,
  },
  headerTablet: {
    fontSize: 22,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButtonsMobile: {
    marginTop: 2,
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
  navButtonMobile: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginLeft: 6,
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
    minHeight: 170,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    width: '100%',
    alignSelf: 'center',
  },
  cardMobile: {
    minHeight: 120,
    maxHeight: 220,
    borderRadius: 6,
    width: 250,
  },
  cardDesktop: {
    minHeight: 300,
    maxHeight: 450,
    width: '100%',
    maxWidth: 800,
    minWidth: 900,
    marginBottom: 25
  },
  cardContent: {
    padding: 14,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardContentMobile: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: COLORS.burgundy,
  },
  titleMobile: {
    fontSize: 16,
    marginBottom: 4,
  },
  titleDesktop: {
    fontSize: 22,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 14,
    lineHeight: 20,
  },
  descriptionMobile: {
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
  },
  descriptionDesktop: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
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
  locationMobile: {
    fontSize: 12,
  },
  locationDesktop: {
    fontSize: 14,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.burgundy,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  viewButtonMobile: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  viewButtonDesktop: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  viewButtonTextMobile: {
    fontSize: 12,
  },
  viewButtonTextDesktop: {
    fontSize: 15,
    marginRight: 6,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    backgroundColor: '#e0e0e0',
  },
  imageMobile: {
    height: 160,
  },
  imageDesktop: {
    height: 280,
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0e6e8',
  },
  placeholderImageMobile: {
    height: 160,
  },
  placeholderImageDesktop: {
    height: 280,
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
  desktopContainerExtraLarge: {
    maxWidth: 1200,
    margin: 'auto',
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
  listContainerMobile: {
    padding: 12,
    paddingTop: 8,
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
  searchBarMobile: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 8,
    color: COLORS.text,
    padding: 0,
    fontWeight: '400',
  },
  searchInputMobile: {
    fontSize: 14,
  },
  filterTabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTabsContainerMobile: {
    paddingRight: 8,
  },
  filterTabsScrollMobile: {
    paddingLeft: 8,
  },
  filterTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: 'relative',
    marginRight: 8,
  },
  filterTabMobile: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  activeFilterTab: {
    borderBottomWidth: 0,
  },
  filterTabText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  filterTabTextMobile: {
    fontSize: 13,
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
  leftPanelExtraLarge: {
    width: 280,
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
  rightPanelExtraLarge: {
    width: 340,
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
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    zIndex: 100,
  },
  mobilePanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    backgroundColor: COLORS.primary,
    zIndex: 101,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  mobilePanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mobilePanelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.burgundy,
  },
  closeButton: {
    padding: 5,
  },
  mobilePanelContent: {
    flex: 1,
    padding: 12,
  },
  mobileSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.burgundy,
    marginVertical: 12,
    paddingHorizontal: 6,
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
    marginHorizontal: 6,
  },
  menuButton: {
    backgroundColor: 'rgba(128, 0, 32, 0.08)',
    marginRight: 6,
  },
});