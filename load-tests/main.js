import http from 'k6/http';
import { sleep, check } from 'k6';

// Configuración de la prueba
export const options = {
  // Configuración de los diferentes escenarios de carga
  stages: [
    { duration: '30s', target: 60 }, // Rampa de subida: Llega a 60 usuarios concurrentes en 30 segundos
    { duration: '2m', target: 60 },  // Meseta: Mantiene 60 usuarios concurrentes por 2 minutos
    { duration: '30s', target: 0 },  // Rampa de bajada: Reduce a 0 usuarios en 30 segundos
  ],
  // Umbrales de éxito de la prueba
  thresholds: {
    // El 95% de las peticiones deben completarse en menos de 500ms
    http_req_duration: ['p(95)<500'],
    // La tasa de error debe ser menor al 1%
    http_req_failed: ['rate<0.01'], 
  },
};

// Reemplaza esto con la URL de tu entorno de producción o staging cuando vayas a probar fuera de local
const BASE_URL = 'http://127.0.0.1:5173/Citara/';

export default function () {
  // 1. Simular carga de la página principal (Frontend)
  const res = http.get(BASE_URL);
  
  check(res, {
    'estado es 200 (OK)': (r) => r.status === 200,
    'carga inicial rapida': (r) => r.timings.duration < 500,
  });

  // Simulamos un tiempo de lectura/espera del usuario (entre 1 y 3 segundos)
  sleep(Math.random() * 2 + 1);

  // 2. Aquí puedes añadir peticiones específicas a Supabase u otros endpoints
  // Ejemplo: si tienes un endpoint para guardar un documento
  /*
  const payload = JSON.stringify({
    title: 'Documento de prueba',
    content: 'Contenido...',
  });
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer TU_TOKEN_DE_PRUEBA' 
  };
  
  const saveRes = http.post(`${BASE_URL}/api/save`, payload, { headers });
  
  check(saveRes, {
    'documento guardado correctamente': (r) => r.status === 200 || r.status === 201,
  });
  
  sleep(2);
  */
}
