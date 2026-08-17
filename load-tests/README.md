# Pruebas de Carga con K6

Este documento describe la configuración, propósito y ejecución de las pruebas de carga para el proyecto utilizando K6.

## ¿Qué es K6?

[K6](https://k6.io/) es una herramienta de código abierto desarrollada por Grafana Labs para realizar pruebas de carga y rendimiento en aplicaciones web, APIs y microservicios. Permite simular tráfico de usuarios concurrentes de forma sencilla y eficiente utilizando scripts escritos en JavaScript. Está diseñada para ser amigable con los desarrolladores, de alto rendimiento y fácilmente integrable en flujos de CI/CD.

## Descarga e Instalación

K6 se puede instalar en múltiples sistemas operativos. A continuación, se muestra cómo descargarlo:

- **Enlace de descarga oficial:** [Página de instalación de K6](https://grafana.com/docs/k6/latest/set-up/install-k6/)

### Instalación en Windows
Puedes descargarlo utilizando el administrador de paquetes Chocolatey o descargando el instalador oficial (MSI).
Si tienes Chocolatey instalado, puedes ejecutar en tu consola (PowerShell/CMD):
```bash
choco install k6
```
Alternativamente, puedes instalarlo con Winget:
```bash
winget install k6
```

### Instalación en macOS (Homebrew)
```bash
brew install k6
```

### Instalación en Linux (Debian/Ubuntu)
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

## Funcionamiento del archivo `main.js`

El archivo `main.js` contiene el script de prueba principal. Se compone de dos partes principales: **Configuración** y **Comportamiento del usuario**.

### 1. Configuración (`options`)
El objeto exportado `options` define los parámetros de la prueba:

- **`stages` (Fases de carga):**
  - **Rampa de subida:** `duration: '30s', target: 60`. Incrementa progresivamente la cantidad de usuarios concurrentes hasta llegar a 60 en un periodo de 30 segundos.
  - **Meseta:** `duration: '2m', target: 60`. Mantiene una carga constante de 60 usuarios concurrentes durante 2 minutos.
  - **Rampa de bajada:** `duration: '30s', target: 0`. Disminuye progresivamente los usuarios concurrentes hasta llegar a 0 en 30 segundos.
- **`thresholds` (Umbrales de éxito):** Define los criterios de aceptación para que la prueba se considere exitosa.
  - `http_req_duration: ['p(95)<500']`: El 95% de las peticiones deben completarse en menos de 500 milisegundos.
  - `http_req_failed: ['rate<0.01']`: La tasa de peticiones fallidas debe ser menor al 1%.

### 2. Comportamiento del usuario (`export default function()`)
La función por defecto (default function) define lo que hará cada usuario virtual (VU) durante la prueba:

1. **Petición Principal:** Hace una solicitud HTTP GET a la página principal (`http://127.0.0.1:5173/Citara/`).
2. **Validaciones (`check`):** Comprueba que:
   - El estado de la respuesta HTTP sea `200 (OK)`.
   - La respuesta sea rápida, es decir, tome menos de 500 milisegundos.
3. **Pausa (`sleep`):** Simula un tiempo de lectura de un usuario real, pausando la ejecución entre 1 y 3 segundos de manera aleatoria.

*Nota: El archivo contiene código comentado preparado para testear otros endpoints futuros (ej. solicitudes POST a una API).*

## ¿Cómo ejecutar las pruebas?

Una vez tengas K6 instalado y tu entorno de desarrollo o servidor ejecutándose (en el caso de este archivo, la aplicación debe estar corriendo en `http://127.0.0.1:5173/Citara/`), puedes ejecutar las pruebas de carga abriendo una terminal en la carpeta `load-tests` y ejecutando el siguiente comando:

```bash
k6 run main.js
```

### Opciones adicionales útiles:
- **Para sobrescribir la cantidad de usuarios virtuales (VUs) y duración desde la consola:**
  ```bash
  k6 run --vus 10 --duration 30s main.js
  ```
- **Para generar un reporte en formato JSON:**
  ```bash
  k6 run --out json=resultados.json main.js
  ```
- **Para generar un reporte en formato HTML:** (Requiere usar un módulo adicional o exportar los resultados).
