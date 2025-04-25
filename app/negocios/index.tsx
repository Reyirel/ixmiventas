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

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const AnimatedItem = ({ item, index, onPress, isDesktop }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 100,
        useNativeDriver: true
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const shortDesc = item.descripcion
    ? item.descripcion.length > 60
      ? item.descripcion.slice(0, 60) + '...'
      : item.descripcion
    : '';

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
        onPress={onPress}
        android_ripple={{ color: '#ddd' }}
        style={styles.pressable}
      >
        {item.imagen_url && (
          <Image
            source={{ uri: item.imagen_url }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
        <Text style={styles.title}>{item.nombre}</Text>
        <Text style={styles.desc}>{shortDesc}</Text>
      </Pressable>
    </Animated.View>
  );
};

export default function Negocios() {
  const [negocios, setNegocios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
    }
    setLoading(false);
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
          contentContainerStyle={{ paddingBottom: 20 }}
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
    backgroundColor: '#fff',
    borderRadius: 12,
    // sombra iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevación Android
    elevation: 3
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
