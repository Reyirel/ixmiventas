'use client';
import { useEffect, useState, useRef } from 'react';
import { 
  View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator,
  StyleSheet, Animated, Dimensions, RefreshControl, Platform
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

const { width } = Dimensions.get('window');

// Helper para detectar si estamos en web
const isWeb = Platform.OS === 'web';

// Definimos colores para mantener consistencia
const COLORS = {
  primary: '#FFFFFF',
  burgundy: '#800020',
  gold: '#D4AF37',
  text: '#333333',
  lightGray: '#F5F5F5',
  gray: '#888888'
};

// Componente separado para cada item de negocio
const NegocioItem = React.memo(({ item, index, onPress, isWeb }) => {
  const itemAnimation = useRef(new Animated.Value(50)).current;
  const itemOpacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Animación secuencial con retraso basado en posición
    Animated.parallel([
      Animated.timing(itemAnimation, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true
      }),
      Animated.timing(itemOpacity, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true
      })
    ]).start();
  }, []);
  
  return (
    <Animated.View
      style={[
        styles.itemContainer,
        isWeb && styles.webItemContainer,
        {
          opacity: itemOpacity,
          transform: [{ translateY: itemAnimation }]
        }
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.card}
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
            
            <View style={styles.viewButton}>
              <Text style={styles.viewButtonText}>Ver</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.gold} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default function Negocios() {
  const [negocios, setNegocios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  const fetchNegocios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('negocios')
      .select('*')
      .eq('aprobado', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error al cargar negocios:', error.message);
    } else {
      setNegocios(data || []);
      
      // Animación de entrada
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

  // En web usamos un grid con 3 columnas
  const renderItem = ({ item, index }) => (
    <NegocioItem 
      item={item} 
      index={index} 
      onPress={() => router.push(`/negocios/${item.id}`)}
      isWeb={isWeb}
    />
  );

  const renderHeader = () => (
    <Animated.View 
      style={[
        styles.header, 
        {opacity: fadeAnim, transform: [{translateY: translateY}]}
      ]}
    >
      <View style={styles.titleContainer}>
        <Ionicons name="storefront" size={28} color={COLORS.burgundy} />
        <Text style={styles.headerTitle}>Negocios Disponibles</Text>
      </View>
      <Text style={styles.subtitle}>Encuentra los mejores establecimientos locales</Text>
    </Animated.View>
  );

  // Barra de navegación
  const renderNavbar = () => (
    <View style={styles.navbar}>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => router.push('/')}
      >
        <Ionicons name="home-outline" size={22} color={COLORS.burgundy} />
        <Text style={styles.navButtonText}>Inicio</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => router.push('/auth/login')}
      >
        <Ionicons name="log-in-outline" size={22} color={COLORS.burgundy} />
        <Text style={styles.navButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );

  // Para web, implementamos un grid personalizado
  const renderWebGrid = () => {
    if (!isWeb) return null;
    
    // Organizamos los negocios en filas de 3 columnas
    const rows = [];
    for (let i = 0; i < negocios.length; i += 3) {
      const rowItems = negocios.slice(i, i + 3);
      rows.push(
        <View key={i} style={styles.webRow}>
          {rowItems.map((item, idx) => (
            <NegocioItem
              key={item.id}
              item={item}
              index={i + idx}
              onPress={() => router.push(`/negocios/${item.id}`)}
              isWeb={true}
            />
          ))}
        </View>
      );
    }
    
    return (
      <Animated.ScrollView
        contentContainerStyle={styles.webGridContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.burgundy, COLORS.gold]}
            tintColor={COLORS.burgundy}
          />
        }
      >
        {renderHeader()}
        {rows}
        {negocios.length === 0 && !loading && (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={60} color={COLORS.gray} />
            <Text style={styles.emptyText}>No hay negocios disponibles</Text>
          </View>
        )}
      </Animated.ScrollView>
    );
  };

  // Renderizado condicional basado en la plataforma
  return (
    <View style={styles.container}>
      {renderNavbar()}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.burgundy} />
          <Text style={styles.loadingText}>Cargando negocios...</Text>
        </View>
      ) : isWeb ? (
        renderWebGrid()
      ) : (
        <Animated.FlatList
          data={negocios}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.burgundy, COLORS.gold]}
              tintColor={COLORS.burgundy}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={60} color={COLORS.gray} />
              <Text style={styles.emptyText}>No hay negocios disponibles</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Estilos originales
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.primary,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 38,
    marginBottom: 10,
  },
  listContainer: {
    padding: 15,
    paddingTop: 5,
  },
  itemContainer: {
    marginBottom: 15,
  },
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    height: '100%', // Para asegurar que todas las cards tengan misma altura en web
  },
  image: {
    height: 160,
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderImage: {
    height: 160,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 15,
    flex: 1, // Para que el contenido se estire y el footer quede abajo
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: COLORS.text,
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 13,
    color: COLORS.gray,
    marginLeft: 4,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderColor: COLORS.burgundy,
    borderWidth: 0.5,
  },
  viewButtonText: {
    fontSize: 12,
    color: COLORS.burgundy,
    fontWeight: '600',
    marginRight: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.burgundy,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  
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
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
  },
  navButtonText: {
    marginLeft: 6,
    color: COLORS.burgundy,
    fontWeight: '600',
    fontSize: 15,
  },
});
