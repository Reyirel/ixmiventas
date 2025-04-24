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
  StyleSheet
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

// Habilitar LayoutAnimation en Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// Componente animado para cada item
const AnimatedItem = ({ item, index, onPress }) => {
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

  // Limitar la descripción a 60 caracteres
  const shortDesc = item.descripcion
    ? item.descripcion.length > 60
      ? item.descripcion.slice(0, 60) + '...'
      : item.descripcion
    : '';

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity, transform: [{ scale }], marginBottom: 12 }
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

  const fetchNegocios = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('negocios')
      .select('*')
      .eq('aprobado', true)
      .order('created_at', { ascending: false });

    if (error) console.error('Error al cargar negocios:', error.message);
    else {
      // animar layout
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setNegocios(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNegocios();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Negocios disponibles</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Animated.FlatList
          data={negocios}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <AnimatedItem
              item={item}
              index={index}
              onPress={() => router.push(`/negocios/${item.id}`)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
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
  pressable: { overflow: 'hidden', borderRadius: 12 },
  image: { height: 150, width: '100%' , borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  title: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginHorizontal: 12 },
  desc: { fontSize: 14, color: '#555', marginHorizontal: 12, marginTop: 4 },
  location: { fontSize: 12, color: 'gray', margin: 12 }
});
