import { useEffect, useState } from 'react';
import { View, Button, Text, FlatList } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function AdminScreen() {
  const [negocios, setNegocios] = useState([]);

  useEffect(() => {
    supabase.from('negocios').select('*').then(({ data }) => {
      if (data) setNegocios(data);
    });
  }, []);

  const aprobar = async (id: number) => {
    await supabase.from('negocios').update({ aprobado: true }).eq('id', id);
  };

  return (
    <FlatList
      data={negocios}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View>
          <Text>{item.nombre}</Text>
          <Button title="Aprobar" onPress={() => aprobar(item.id)} />
        </View>
      )}
    />
  );
}