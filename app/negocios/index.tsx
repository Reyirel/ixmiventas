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
  useWindowDimensions
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

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
const AnimatedItem = React.memo(({ item, index, onPress, isDesktop }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true
      }),
      Animated.timing(scale, {
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
        styles.card,
        {
          opacity,
          transform: [{ scale }],
          marginBottom: 12,
          flex: isDesktop ? 1 : undefined,
          marginHorizontal: isDesktop ? 6 : 0,
        }
      ]}
    >
      <Pressable
        android_ripple={{ color: COLORS.lightGray }}
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
      </Pressable>
    </Animated.View>
  );
});

export default function Negocios() {
  const [negocios, setNegocios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  // Determinar si es pantalla de escritorio (más de 768px generalmente se considera tablet/desktop)
  const isDesktop = width >= 768;
  const numColumns = isDesktop ? 3 : 1;

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

  // Renderizar los elementos en filas para vista de escritorio
  const renderDesktopContent = () => {
    const rows = [];
    for (let i = 0; i < negocios.length; i += 3) {
      const rowItems = negocios.slice(i, i + 3);
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
          {/* Agregar elementos vacíos para mantener el alineamiento si la última fila está incompleta */}
          {rowItems.length < 3 && [...Array(3 - rowItems.length)].map((_, j) => (
            <View key={`empty-${j}`} style={{ flex: 1, marginHorizontal: 6 }} />
          ))}
        </View>
      );
    }
    return rows;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Negocios disponibles</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : isDesktop ? (
        <Animated.ScrollView contentContainerStyle={styles.desktopContainer}>
          {renderDesktopContent()}
        </Animated.ScrollView>
      ) : (
        <Animated.FlatList
          data={negocios}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <AnimatedItem
              item={item}
              index={index}
              onPress={() => router.push(`/negocios/${item.id}`)}
              isDesktop={false}
            />
          )}
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
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#f5f5f5' 
  },
  header: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 16 
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
  },
  desktopContainer: {
    paddingBottom: 20,
  },
  desktopRow: {
    flexDirection: 'row',
    marginBottom: 12,
  }
});