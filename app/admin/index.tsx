import { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, 
  Alert, ScrollView, useWindowDimensions, Platform, Animated 
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CATEGORIAS = [
  'Restaurante',
  'Tecnología',
  'Ropa',
  'Salud',
  'Educación',
  'Servicios',
  'Supermercado',
  'Entretenimiento',
  'Otro'
];

export default function AdminScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const isMobile = width < 768;

  const [negocios, setNegocios] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [tab, setTab] = useState<'todos' | 'pendientes'>('todos');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNegocio, setSelectedNegocio] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editUbicacion, setEditUbicacion] = useState('');
  const [editTipo, setEditTipo] = useState('');
  const [editProductos, setEditProductos] = useState([]);
  const [editHorarios, setEditHorarios] = useState({});
  const [nuevoProductoNombre, setNuevoProductoNombre] = useState('');
  const [nuevoProductoPrecio, setNuevoProductoPrecio] = useState('');

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    aprobados: 0,
    pendientes: 0,
    categorias: {}
  });

  // Cargar negocios y calcular estadísticas
  const fetchNegocios = async () => {
    try {
      const { data, error } = await supabase.from('negocios').select('*');
      if (error) {
        console.error('Error al obtener negocios:', error.message);
        Alert.alert('Error', 'No se pudieron cargar los negocios.');
        return;
      }

      const negocios = data || [];
      const pendientes = negocios.filter(n => n.aprobado === false);
      const aprobados = negocios.filter(n => n.aprobado === true);
      
      // Calcular estadísticas por categoría
      const categorias = {};
      negocios.forEach(negocio => {
        const cat = negocio.tipo || 'Sin categoría';
        categorias[cat] = (categorias[cat] || 0) + 1;
      });

      setNegocios(negocios);
      setPendientes(pendientes);
      setStats({
        total: negocios.length,
        aprobados: aprobados.length,
        pendientes: pendientes.length,
        categorias
      });

    } catch (err) {
      console.error('Error inesperado:', err);
      Alert.alert('Error', 'Ocurrió un error inesperado al cargar los negocios.');
    }
  };

  useEffect(() => {
    fetchNegocios();
  }, []);

  // Protección de ruta
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth/login');
        return;
      }
      const { data: perfil } = await supabase
        .from('perfiles')
        .select('tipo_usuario')
        .eq('user_id', user.id)
        .single();
      if (!perfil || perfil.tipo_usuario !== 'admin') {
        router.replace('/negocios');
      }
    };
    checkAdmin();
  }, []);

  // Aprobar negocio
  const aprobar = async (id: number) => {
    try {
      const { error } = await supabase
        .from('negocios')
        .update({ aprobado: true })
        .eq('id', id);

      if (error) {
        Alert.alert('Error', 'No se pudo aprobar el negocio.');
        return;
      }

      Alert.alert('Éxito', 'Negocio aprobado correctamente.');
      fetchNegocios();
    } catch (err) {
      Alert.alert('Error', 'Ocurrió un error inesperado.');
    }
  };

  const [confirmarEliminar, setConfirmarEliminar] = useState<{visible: boolean, id?: number}>({visible: false});

  // Eliminar negocio
  const eliminar = async (id: number) => {
    try {
      console.log('Entrando a eliminar con id:', id);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user');
        Alert.alert('Error', 'No estás autenticado');
        return;
      }

      const { data: perfil } = await supabase
        .from('perfiles')
        .select('tipo_usuario')
        .eq('user_id', user.id)
        .single();

      console.log('Perfil obtenido:', perfil);

      if (!perfil || perfil.tipo_usuario !== 'admin') {
        console.log('No es admin');
        Alert.alert('Error', 'No tienes permisos de administrador');
        return;
      }

      // En web, usamos modal propio
      setConfirmarEliminar({visible: true, id});
    } catch (error) {
      console.log('Error general en eliminar:', error);
      Alert.alert('Error', 'Error al verificar permisos');
    }
  };

  const confirmarEliminarNegocio = async () => {
    if (!confirmarEliminar.id) return;
    console.log('Intentando eliminar negocio con id:', confirmarEliminar.id);
    const { error } = await supabase
      .from('negocios')
      .delete()
      .eq('id', confirmarEliminar.id);

    if (error) {
      console.log('Error al eliminar negocio:', error.message);
      Alert.alert('Error', 'No se pudo eliminar el negocio');
    } else {
      console.log('Negocio eliminado correctamente');
      Alert.alert('Éxito', 'Negocio eliminado correctamente');
      fetchNegocios();
    }
    setConfirmarEliminar({visible: false});
  };

  // Abrir modal de edición
  const editar = (negocio) => {
    setSelectedNegocio(negocio);
    setEditNombre(negocio.nombre);
    setEditDescripcion(negocio.descripcion);
    setEditTelefono(negocio.telefono || '');
    setEditUbicacion(negocio.ubicacion || '');
    setEditTipo(negocio.tipo || '');
    setEditProductos(negocio.productos || []);
    setEditHorarios(negocio.horarios || {
      lunes: { apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
      martes: { apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
      miercoles: { apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
      jueves: { apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
      viernes: { apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
      sabado: { apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
      domingo: { apertura: { hora: '', minuto: '', ampm: 'AM' }, cierre: { hora: '', minuto: '', ampm: 'PM' } },
    });
    setModalVisible(true);
  };

  // Agregar producto
  const agregarProducto = () => {
    if (!nuevoProductoNombre.trim() || !nuevoProductoPrecio.trim()) {
      Alert.alert('Error', 'Completa el nombre y precio del producto');
      return;
    }
    
    const nuevoProducto = {
      nombre: nuevoProductoNombre.trim(),
      precio: parseFloat(nuevoProductoPrecio)
    };
    
    setEditProductos([...editProductos, nuevoProducto]);
    setNuevoProductoNombre('');
    setNuevoProductoPrecio('');
  };

  // Eliminar producto
  const eliminarProducto = (index) => {
    const nuevosProductos = editProductos.filter((_, i) => i !== index);
    setEditProductos(nuevosProductos);
  };

  // Guardar cambios de edición
  const guardarEdicion = async () => {
    try {
      if (!selectedNegocio?.id || !editNombre.trim()) {
        Alert.alert('Error', 'Datos incompletos');
        return;
      }

      const { error } = await supabase
        .from('negocios')
        .update({
          nombre: editNombre,
          descripcion: editDescripcion,
          telefono: editTelefono,
          ubicacion: editUbicacion,
          tipo: editTipo,
          productos: editProductos,
          horarios: editHorarios
        })
        .eq('id', selectedNegocio.id);

      if (error) {
        Alert.alert('Error', 'No se pudo actualizar el negocio');
      } else {
        Alert.alert('Éxito', 'Negocio actualizado correctamente');
        setModalVisible(false);
        setSelectedNegocio(null);
        fetchNegocios();
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error inesperado');
    }
  };

  // Componente de estadísticas
  const StatsCard = ({ title, value, icon, color }) => (
    <View style={[styles.statsCard, isDesktop && styles.statsCardDesktop]}>
      <View style={[styles.statsIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#fff" />
      </View>
      <View style={styles.statsContent}>
        <Text style={styles.statsValue}>{value}</Text>
        <Text style={styles.statsTitle}>{title}</Text>
      </View>
    </View>
  );

  // Header del dashboard
  const DashboardHeader = () => (
    <LinearGradient
      colors={['#800020', '#B8001F', '#D4001C']}
      style={[styles.header, isDesktop && styles.headerDesktop]}
    >
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}>
              Panel de Administración
            </Text>
            <Text style={[styles.headerSubtitle, isMobile && styles.headerSubtitleMobile]}>
              Gestiona negocios y solicitudes
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.logoutBtn}
            onPress={() => router.push('/negocios')}
          >
            <Ionicons name="home-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Estadísticas */}
        <View style={[styles.statsContainer, isDesktop && styles.statsContainerDesktop]}>
          <StatsCard 
            title="Total Negocios" 
            value={stats.total} 
            icon="business-outline" 
            color="#4CAF50" 
          />
          <StatsCard 
            title="Aprobados" 
            value={stats.aprobados} 
            icon="checkmark-circle-outline" 
            color="#2196F3" 
          />
          <StatsCard 
            title="Pendientes" 
            value={stats.pendientes} 
            icon="time-outline" 
            color="#FF9800" 
          />
          <StatsCard 
            title="Categorías" 
            value={Object.keys(stats.categorias).length} 
            icon="grid-outline" 
            color="#9C27B0" 
          />
        </View>
      </View>
    </LinearGradient>
  );

  // Render de cada negocio
  const renderNegocio = ({ item }) => (
    <View style={[styles.card, isDesktop && styles.cardDesktop]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          {item.tipo && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.tipo}</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, item.aprobado ? styles.approvedBadge : styles.pendingBadge]}>
          <Ionicons 
            name={item.aprobado ? "checkmark-circle" : "time"} 
            size={16} 
            color="#fff" 
          />
          <Text style={styles.statusText}>
            {item.aprobado ? 'Aprobado' : 'Pendiente'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.cardDescription}>{item.descripcion}</Text>
      
      <View style={styles.cardInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="call-outline" size={16} color="#800020" />
          <Text style={styles.infoText}>{item.telefono || 'Sin teléfono'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="location-outline" size={16} color="#800020" />
          <Text style={styles.infoText}>{item.ubicacion || 'Sin ubicación'}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => editar(item)}>
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => eliminar(item.id)}>
          <Ionicons name="trash-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render de cada pendiente
  const renderPendiente = ({ item }) => (
    <View style={[styles.card, styles.pendingCard, isDesktop && styles.cardDesktop]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          {item.tipo && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.tipo}</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, styles.pendingBadge]}>
          <Ionicons name="time" size={16} color="#fff" />
          <Text style={styles.statusText}>Pendiente</Text>
        </View>
      </View>
      
      <Text style={styles.cardDescription}>{item.descripcion}</Text>
      
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.approveBtn} onPress={() => aprobar(item.id)}>
          <Ionicons name="checkmark-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Aprobar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.editBtn} onPress={() => editar(item)}>
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => eliminar(item.id)}>
          <Ionicons name="trash-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>Rechazar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <DashboardHeader />

      {/* Contenido principal */}
      <View style={[styles.mainContent, isDesktop && styles.mainContentDesktop]}>
        {/* Tabs */}
        <View style={[styles.tabsContainer, isDesktop && styles.tabsContainerDesktop]}>
          <TouchableOpacity
            style={[styles.tab, tab === 'todos' && styles.tabActive, isDesktop && styles.tabDesktop]}
            onPress={() => setTab('todos')}
          >
            <Ionicons 
              name="business-outline" 
              size={20} 
              color={tab === 'todos' ? '#800020' : '#888'} 
            />
            <Text style={tab === 'todos' ? styles.tabTextActive : styles.tabText}>
              Todos ({stats.total})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, tab === 'pendientes' && styles.tabActive, isDesktop && styles.tabDesktop]}
            onPress={() => setTab('pendientes')}
          >
            <Ionicons 
              name="time-outline" 
              size={20} 
              color={tab === 'pendientes' ? '#800020' : '#888'} 
            />
            <Text style={tab === 'pendientes' ? styles.tabTextActive : styles.tabText}>
              Pendientes ({stats.pendientes})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de negocios */}
        <View style={styles.listContainer}>
          {tab === 'todos' ? (
            <FlatList
              data={negocios}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderNegocio}
              contentContainerStyle={styles.list}
              numColumns={isDesktop ? 2 : 1}
              key={isDesktop ? 'desktop' : 'mobile'}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="business-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>No hay negocios registrados</Text>
                </View>
              }
            />
          ) : (
            <FlatList
              data={pendientes}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderPendiente}
              contentContainerStyle={styles.list}
              numColumns={isDesktop ? 2 : 1}
              key={isDesktop ? 'desktop-pending' : 'mobile-pending'}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="checkmark-circle-outline" size={64} color="#4CAF50" />
                  <Text style={styles.emptyText}>¡Excelente! No hay solicitudes pendientes</Text>
                </View>
              }
            />
          )}
        </View>
      </View>

      {/* Modal de edición mejorado */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDesktop && styles.modalContentDesktop]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Negocio</Text>
              <TouchableOpacity 
                style={styles.closeBtn}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#800020" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {/* Información básica */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="information-circle-outline" size={20} color="#800020" />
                  <Text style={styles.sectionTitle}>Información Básica</Text>
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nombre del negocio</Text>
                  <TextInput
                    style={styles.input}
                    value={editNombre}
                    onChangeText={setEditNombre}
                    placeholder="Nombre del negocio"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Descripción</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={editDescripcion}
                    onChangeText={setEditDescripcion}
                    placeholder="Descripción del negocio"
                    multiline
                    numberOfLines={3}
                  />
                </View>
                
                <View style={[styles.row, isDesktop && styles.rowDesktop]}>
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.inputLabel}>Ubicación</Text>
                    <TextInput
                      style={styles.input}
                      value={editUbicacion}
                      onChangeText={setEditUbicacion}
                      placeholder="Dirección"
                    />
                  </View>
                  
                  <View style={[styles.inputGroup, styles.halfWidth]}>
                    <Text style={styles.inputLabel}>Teléfono</Text>
                    <TextInput
                      style={styles.input}
                      value={editTelefono}
                      onChangeText={setEditTelefono}
                      placeholder="Número de teléfono"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>

              {/* Categoría */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="grid-outline" size={20} color="#800020" />
                  <Text style={styles.sectionTitle}>Categoría</Text>
                </View>
                
                <View style={styles.categoryGrid}>
                  {CATEGORIAS.map((categoria) => (
                    <TouchableOpacity
                      key={categoria}
                      style={[
                        styles.categoryButton,
                        editTipo === categoria && styles.categoryButtonSelected
                      ]}
                      onPress={() => setEditTipo(categoria)}
                    >
                      <Text style={[
                        styles.categoryButtonText,
                        editTipo === categoria && styles.categoryButtonTextSelected
                      ]}>
                        {categoria}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Productos */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="storefront-outline" size={20} color="#800020" />
                  <Text style={styles.sectionTitle}>Productos</Text>
                </View>
                
                <View style={styles.addProductContainer}>
                  <TextInput
                    style={[styles.input, styles.productInput]}
                    value={nuevoProductoNombre}
                    onChangeText={setNuevoProductoNombre}
                    placeholder="Nombre del producto"
                  />
                  <TextInput
                    style={[styles.input, styles.priceInput]}
                    value={nuevoProductoPrecio}
                    onChangeText={setNuevoProductoPrecio}
                    placeholder="Precio"
                    keyboardType="numeric"
                  />
                  <TouchableOpacity style={styles.addButton} onPress={agregarProducto}>
                    <Ionicons name="add" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                
                {editProductos.map((producto, index) => (
                  <View key={index} style={styles.productItem}>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{producto.nombre}</Text>
                      <Text style={styles.productPrice}>${producto.precio}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.deleteProductButton}
                      onPress={() => eliminarProducto(index)}
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.saveBtn} onPress={guardarEdicion}>
                  <Ionicons name="checkmark-outline" size={20} color="#fff" />
                  <Text style={styles.btnText}>Guardar Cambios</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Ionicons name="close-outline" size={20} color="#fff" />
                  <Text style={styles.btnText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal visible={confirmarEliminar.visible} transparent animationType="fade">
        <View style={{flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(0,0,0,0.3)'}}>
          <View style={{backgroundColor:'#fff', padding:24, borderRadius:16, width:300}}>
            <Text style={{fontSize:18, fontWeight:'bold', marginBottom:16}}>¿Eliminar negocio?</Text>
            <Text style={{marginBottom:24}}>¿Estás seguro de eliminar este negocio? Esta acción no se puede deshacer.</Text>
            <View style={{flexDirection:'row', justifyContent:'flex-end', gap:12}}>
              <TouchableOpacity onPress={() => setConfirmarEliminar({visible:false})}>
                <Text style={{color:'#800020', fontWeight:'bold'}}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmarEliminarNegocio}>
                <Text style={{color:'#f44336', fontWeight:'bold'}}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
  },
  headerDesktop: {
    paddingTop: 20,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerTitleMobile: {
    fontSize: 24,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  headerSubtitleMobile: {
    fontSize: 14,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
  },

  // Estadísticas
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsContainerDesktop: {
    justifyContent: 'flex-start',
    gap: 20,
  },
  statsCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '48%',
    backdropFilter: 'blur(10px)',
  },
  statsCardDesktop: {
    width: 200,
    marginBottom: 0,
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statsContent: {
    flex: 1,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // Contenido principal
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mainContentDesktop: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  tabsContainerDesktop: {
    alignSelf: 'flex-start',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  tabDesktop: {
    flex: 0,
    minWidth: 200,
  },
  tabActive: {
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  tabText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#800020',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Lista
  listContainer: {
    flex: 1,
  },
  list: {
    paddingBottom: 20,
  },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#800020',
  },
  cardDesktop: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  pendingCard: {
    borderLeftColor: '#FF9800',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryBadge: {
    backgroundColor: '#E1CB7A',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#800020',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  approvedBadge: {
    backgroundColor: '#4CAF50',
  },
  pendingBadge: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardInfo: {
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  approveBtn: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  editBtn: {
    backgroundColor: '#E1CB7A',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  deleteBtn: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  // Estado vacío
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 16,
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContentDesktop: {
    width: 800,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeBtn: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 8,
  },
  modalScroll: {
    flex: 1,
  },

  // Secciones del modal
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#800020',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'column',
    gap: 16,
  },
  rowDesktop: {
    flexDirection: 'row',
  },
  halfWidth: {
    flex: 1,
  },

  // Categorías
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    marginBottom: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#800020',
    borderColor: '#800020',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },

  // Productos
  addProductContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  productInput: {
    flex: 2,
  },
  priceInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#800020',
    borderRadius: 12,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#800020',
  },
  deleteProductButton: {
    backgroundColor: '#f44336',
    borderRadius: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },

  // Acciones del modal
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 24,
  },
  saveBtn: {
    backgroundColor: '#800020',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
  },
  cancelBtn: {
    backgroundColor: '#666',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flex: 1,
  },
});