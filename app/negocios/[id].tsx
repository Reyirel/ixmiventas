import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function NegocioDetalle() {
  const { id } = useLocalSearchParams();
  const [negocio, setNegocio] = useState(null);

  useEffect(() => {
    if (id) {
      supabase.from('negocios').select('*').eq('id', id).single().then(({ data }) => {
        setNegocio(data);
      });
    }
  }, [id]);

  if (!negocio) return <Text>Cargando...</Text>;

  return (
    <View>
      <Text>{negocio.nombre}</Text>
      <Image source={{ uri: negocio.imagen_url }} style={{ height: 200 }} />
      <Text>{negocio.descripcion}</Text>
    </View>
  );
}