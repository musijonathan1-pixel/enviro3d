# Musi Enviro 3D - Desktop Setup Guide

Este proyecto ha sido preparado para ser ejecutado como una aplicación de escritorio nativa utilizando **Electron**.

## Requisitos Previos
1. **Node.js** (v18 o superior recomendado)
2. **Visual Studio Code**
3. **GitHub Desktop** o Git CLI (para subir tu repositorio)

## Instrucciones para Ejecutar en VS Code

1. **Clona tu repositorio**:
   ```bash
   git clone <tu-repo-url>
   cd musi-enviro-3d
   ```

2. **Instala las dependencias**:
   Abre una terminal en VS Code y ejecuta:
   ```bash
   npm install
   ```

3. **Ejecuta en modo desarrollo (Desktop)**:
   Esto abrirá la ventana de Electron vinculada al servidor de desarrollo de Vite:
   ```bash
   npm run electron:dev
   ```

## Cómo Compilar (Crear el .exe o .app)

Para generar el instalador final para Windows, Mac o Linux:

```bash
npm run electron:build
```

El instalador aparecerá en la carpeta `/release`.

## Estructura de Archivos Clave para el Desarrollador
- `electron-main.js`: Configuración de la ventana nativa y diálogos del sistema.
- `src/services/ProjectService.ts`: Lógica de persistencia de datos (formato `.musi3dproj`).
- `src/components/viewport/Viewport3D.tsx`: Visor 3D funcional con Three.js.

## Notas sobre la "Funcionalidad 100%"
- **Importación**: Ya es funcional mediante drag-and-drop.
- **Persistent State**: Los datos del proyecto se guardan automáticamente en el almacenamiento local (simulando archivos en el disco para el MVP).
- **Retopo Engine**: La UI incluye el flujo de ejecución. Para conectar un motor real (como QuadFlow), deberás añadir el binario en la carpeta `/native` y llamarlo desde `electron-main.js` usando `child_process`.
