import { useAuth } from '../context/AuthContext';
import api from '../services/api'; // Asegurate de importar tu api.js

const Home = () => {
  const { isAdmin } = useAuth();

  // La función DEBE estar adentro del componente para que el botón la vea
  const handleExportExcel = async () => {
    try {
      console.log("Iniciando descarga..."); // Para que veas en la consola que arrancó
      const response = await api.get('/products/export-excel', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Reporte_Ventas_SeloYah.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove(); // Limpiamos el link
    } catch (error) {
      console.error("No se pudo descargar el Excel", error);
      alert("Error al descargar el archivo. Revisa la consola.");
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Bienvenido a SeloYah</h1>

      {isAdmin && (
        <button
          onClick={handleExportExcel} // Ahora sí está conectado
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg hover:bg-green-700 flex items-center gap-2"
        >
          📥 Exportar Base de Datos a Excel
        </button>
      )}

      {!isAdmin && <p className="mt-4 text-gray-500">Eres un usuario visitante.</p>}
    </div>
  );
};

export default Home;