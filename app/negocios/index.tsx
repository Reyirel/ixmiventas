'use client';
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';

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

    console.log('Negocios:', data);
    if (error) {
      console.error('Error al cargar negocios:', error.message);
    } else {
      setNegocios(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNegocios();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/negocios/${item.id}`)}
      style={{
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 3,
      }}
    >
      {item.imagen_url && (
        <Image source={{ uri: item.imagen_url }} style={{ height: 150, borderRadius: 10 }} />
      )}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 5 }}>{item.nombre}</Text>
      <Text>{item.descripcion}</Text>
      <Text style={{ color: 'gray' }}>{item.ubicacion}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
        Negocios disponibles
      </Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={negocios}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}
