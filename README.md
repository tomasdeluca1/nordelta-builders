# Nordelta Builders

**Nordelta Builders** es una comunidad digital diseñada para conectar a los profesionales, emprendedores y entusiastas de la tecnología que viven o trabajan en Nordelta. El objetivo es crear un espacio de networking, colaboración y crecimiento profesional dentro de la comunidad.

## 🚀 Características Principales

- **Diseño Moderno y Profesional**: Interfaz limpia con estética "Tech/Builder", utilizando una paleta de colores oscuros (Negro, Gris, Verde Neón) y tipografía moderna.
- **Landing Page Interactiva**: Sección de "Hero" con animaciones CSS, efectos de partículas y un grid interactivo.
- **Formulario de Registro**: Integración con Google Sheets para capturar leads y miembros de la comunidad.
- **Sección de Proyectos**: Galería para mostrar proyectos desarrollados por los miembros.
- **Eventos y Meetups**: Calendario para organizar encuentros presenciales y virtuales.
- **Blog/News**: Artículos y noticias relevantes para la comunidad tech de Nordelta.
- **Responsive Design**: Optimizado para móviles, tablets y escritorios.

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica.
- **CSS3**: Estilos avanzados, animaciones y diseño responsivo.
- **JavaScript (Vanilla)**: Lógica del formulario, validaciones y efectos interactivos.
- **Google Sheets API**: Backend para almacenamiento de datos del formulario.

## 📂 Estructura del Proyecto

```
/nordelta-builders
├── index.html              # Página principal (Landing Page)
├── css/
│   └── style.css           # Estilos globales y animaciones
├── js/
│   ├── form.js             # Lógica del formulario y Google Sheets API
│   └── particles.js        # (Opcional) Script para partículas avanzadas
├── assets/
│   ├── images/             # Imágenes y logos
│   └── fonts/              # Fuentes personalizadas (si aplica)
└── README.md               # Documentación del proyecto
```

## ⚙️ Configuración

### 1. Configurar Google Sheets

Para que el formulario funcione, necesitas crear un Google Sheet y habilitar la API.

1.  **Crear Google Sheet**: Crea una hoja con las siguientes columnas:
    `Timestamp`, `Nombre`, `Email`, `Rol`, `Skills`, `Proyecto`, `Referido`, `Fecha Registro`.
2.  **Habilitar Google Sheets API**:
    - Ve a Google Cloud Console.
    - Crea un nuevo proyecto.
    - Busca "Google Sheets API" y habilítala.
    - Crea credenciales (API Key o OAuth 2.0).
3.  **Configurar `form.js`**:
    - Reemplaza `YOUR_API_KEY` en `form.js` con tu API Key.
    - Asegúrate de que la URL de la API apunte a tu hoja de cálculo.

### 2. Instalar Dependencias

Este proyecto es principalmente "vanilla", pero si usas herramientas de desarrollo:

```bash
# Si usas npm para gestión de paquetes
npm install
```

## 🏃‍♂️ Ejecución

Para probar el proyecto localmente:

```bash
# Opción 1: Abrir index.html directamente en el navegador
# Opción 2: Usar un servidor local (recomendado)
python -m http.server 8000
# o
npx serve .
```

Luego abre `http://localhost:8000` en tu navegador.

## 🎨 Personalización

- **Colores**: Edita las variables CSS en `css/style.css` para cambiar la paleta.
- **Tipografía**: Ajusta las fuentes en la sección `:root`.
- **Animaciones**: Modifica los keyframes en `style.css` para ajustar tiempos y efectos.

## 🤝 Contribuir

1.  Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`).
2.  Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`).
3.  Push a la rama (`git push origin feature/AmazingFeature`).
4.  Abre un Pull Request.

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
