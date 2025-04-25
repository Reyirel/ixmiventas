'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { View, Text, TextInput, Button, Alert, ScrollView, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function NegocioNuevo() {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [imagenLocal, setImagenLocal] = useState<string | null>(null);
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

  const seleccionarImagen = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImagenLocal(result.assets[0].uri);
    }
  };

  const subirImagen = async (): Promise<string | null> => {
    if (!imagenLocal) return null;
    const response = await fetch(imagenLocal);
    const blob = await response.blob();
    const fileName = `negocios_${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from('negocios')
      .upload(fileName, blob, { contentType: 'image/jpeg' });
    if (error) {
      Alert.alert('Error al subir imagen', error.message);
      return null;
    }
    const { data } = supabase.storage.from('negocios').getPublicUrl(fileName);
    return data.publicUrl;
  };

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

    let urlImagen = '';
    if (imagenLocal) {
      const url = await subirImagen();
      if (!url) return;
      urlImagen = url;
    }

    const { error } = await supabase.from('negocios').insert({
      nombre,
      descripcion,
      ubicacion,
      imagen_url: urlImagen,
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

      <Button title="Seleccionar imagen" onPress={seleccionarImagen} />
      {imagenLocal && (
        <View style={{ marginVertical: 10 }}>
          <Text>Imagen seleccionada:</Text>
          <Image source={{ uri: imagenLocal }} style={{ width: 120, height: 120, borderRadius: 8 }} />
        </View>
      )}

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
