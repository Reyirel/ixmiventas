import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function BusinessCard({ negocio }: any) {
  return (
    <Link href={`/negocios/${negocio.id}`} asChild>
      <TouchableOpacity>
        <View style={{ padding: 10 }}>
          <Image source={{ uri: negocio.imagen_url }} style={{ height: 100 }} />
          <Text>{negocio.nombre}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
}