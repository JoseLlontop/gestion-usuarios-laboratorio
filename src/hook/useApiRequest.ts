import { useEffect, useState } from 'react';
import axios from 'axios';

// Asegúrate de que `useApiRequest` acepte un tipo genérico
export const useApiRequest = <T,>(URL: string, method = 'GET', body: any = null) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!URL) { 
      setIsLoading(false);
      return; 
    }

    const makeRequest = async () => {
      try {
        const config = {
          method, // Método HTTP (GET, POST, PUT, etc.)
          url: URL, // URL de la API
          data: body, // Datos opcionales para métodos como POST o PUT
        };

        const response = await axios(config);
        setData(response.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setIsLoading(false); // Finaliza el estado de carga
      }
    };

    makeRequest();
  }, [URL, method, body]); // Se ejecuta si la URL, método o body cambian

  return { data, isLoading, error };
};
