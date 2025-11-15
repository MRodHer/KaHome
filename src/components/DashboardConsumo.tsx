import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ConsumoData {
  name: string;
  consumo: number;
}

export function DashboardConsumo() {
  const [data, setData] = useState<ConsumoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsumoData();
  }, []);

  const fetchConsumoData = async () => {
    setLoading(true);
    const { data: consumo, error } = await supabase
      .from('consumo_alimentos')
      .select(`
        cantidad,
        mascotas (nombre)
      `);

    if (error) {
      console.error('Error fetching consumo data:', error);
      setLoading(false);
      return;
    }

    // Process data for the chart
    const processedData = consumo.reduce((acc, curr) => {
      const mascotaNombre = curr.mascotas.nombre;
      if (!acc[mascotaNombre]) {
        acc[mascotaNombre] = { name: mascotaNombre, consumo: 0 };
      }
      acc[mascotaNombre].consumo += curr.cantidad;
      return acc;
    }, {} as { [key: string]: ConsumoData });

    setData(Object.values(processedData));
    setLoading(false);
  };

  if (loading) {
    return <div className="p-6">Cargando datos del dashboard...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard de Consumo de Alimentos</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Consumo Total por Mascota (gramos)</h2>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="consumo" fill="#8884d8" name="Consumo (gr)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}