'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { View, Text, TextInput, Button, Alert, ScrollView } from 'react-native';

export default function NegocioNuevo() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [productoNombre, setProductoNombre] = useState('');
  const [productoPrecio, setProductoPrecio] = useState('');
  const [productos, setProductos] = useState<{ nombre: string; precio: number }[]>([]);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        Alert.alert('Debes iniciar sesión');
        router.replace('/auth/login');
      } else {
        setUserId(data.user.id);
      }
    };
    getUser();
  }, []);

  const agregarProducto = () => {
    if (!productoNombre || !productoPrecio) {
      Alert.alert('Faltan datos del producto');
      return;
    }
    setProductos([
      ...productos,
      { nombre: productoNombre, precio: Number(productoPrecio) },
    ]);
    setProductoNombre('');
    setProductoPrecio('');
  };

  const handleSubmit = async () => {
    if (!nombre || !userId) {
      Alert.alert('Faltan datos obligatorios');
      return;
    }

    if (productos.length === 0) {
      Alert.alert('Agrega al menos un producto');
      return;
    }

    const { error } = await supabase.from('negocios').insert({
      nombre,
      descripcion,
      ubicacion,
      imagen_url: imagenUrl,
      productos,
      user_id: userId,
      aprobado: false,
    });

    if (error) {
      Alert.alert('Error al guardar', error.message);
    } else {
      Alert.alert('Negocio enviado', 'Esperando aprobación del administrador');
      router.replace('/negocios');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Registrar nuevo negocio</Text>

      <Text>Nombre</Text>
      <TextInput value={nombre} onChangeText={setNombre} placeholder="Nombre del negocio" />

      <Text>Descripción</Text>
      <TextInput value={descripcion} onChangeText={setDescripcion} placeholder="Describe el negocio" multiline />

      <Text>Ubicación</Text>
      <TextInput value={ubicacion} onChangeText={setUbicacion} placeholder="Calle, ciudad..." />

      <Text>Imagen (URL)</Text>
      <TextInput value={imagenUrl} onChangeText={setImagenUrl} placeholder="https://..." />

      <Text style={{ marginTop: 20, fontWeight: 'bold' }}>Agregar producto</Text>
      <Text>Nombre del producto</Text>
      <TextInput value={productoNombre} onChangeText={setProductoNombre} placeholder="Ej: Pan" />
      <Text>Precio</Text>
      <TextInput value={productoPrecio} onChangeText={setProductoPrecio} placeholder="Ej: 12" keyboardType="numeric" />
      <Button title="Agregar producto" onPress={agregarProducto} />

      {productos.length > 0 && (
        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontWeight: 'bold' }}>Productos agregados:</Text>
          {productos.map((p, idx) => (
            <Text key={idx}>{p.nombre} - ${p.precio}</Text>
          ))}
        </View>
      )}

      <Button title="Enviar negocio" onPress={handleSubmit} />
    </ScrollView>
  );
}
