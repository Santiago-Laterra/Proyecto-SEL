import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, isAdmin } = useAuth(); // Usamos el "detective"

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Bienvenido a SeloYah</h1>

      {/* Este botón SOLO aparecerá si el rol es 'admin' */}
      {isAdmin && (
        <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg hover:bg-green-700">
          📥 Exportar Base de Datos a Excel
        </button>
      )}

      {!isAdmin && <p className="mt-4 text-gray-500">Eres un usuario visitante.</p>}
    </div>
  );
};

const handleExportExcel = async () => {
  try {
    // Llamamos a la ruta de tu Backend que genera el Excel
    const response = await api.get('/admin/export-excel', {
      responseType: 'blob', // Importante para descargar archivos
    });

    // Crear un link invisible para descargar el archivo en la PC local
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Reporte_Ventas_SeloYah.xlsx');
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error("No se pudo descargar el Excel", error);
  }
};

// Y en tu botón:
<button onClick={handleExportExcel} className="...">
  📥 Exportar Base de Datos a Excel
</button>

export default Home;