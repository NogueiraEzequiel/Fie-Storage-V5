# Fie-Storage

**Fie-Storage** es un repositorio digital diseñado para estudiantes de la Facultad de Ingeniería del Ejército Argentino. Su propósito es permitir a los estudiantes subir trabajos que han entregado, los cuales los profesores pueden comentar y puntuar. Estos trabajos sirven como referencia para estudiantes futuros que cursen las mismas materias.

## Estructura del Repositorio

- **Navegación por Carpetas**: Los usuarios pueden navegar por las distintas carpetas de las materias, organizadas por carrera y año lectivo.
- **Filtrado por Carrera**: Existe una opción para filtrar las carpetas por carrera, facilitando la búsqueda de material relevante.
- **Años Lectivos**: Dentro de cada materia, se pueden ver los trabajos realizados en años anteriores, proporcionando una visión histórica del contenido.

## Funcionalidades Principales

### Gestión de Archivos y Carpetas

- **Subida de Archivos**: Los estudiantes pueden subir archivos con metadatos como carrera, materia y año académico. Solo se permiten archivos PDF, Word e imágenes.
- **Eliminación de Archivos**: Los archivos pueden ser eliminados tanto del almacenamiento de Firebase como de Firestore.
- **Listado de Archivos**: Se listan archivos y carpetas, excluyendo archivos `.keep` y la carpeta `files`.
- **Creación de Carpetas**: Se crean carpetas mediante la subida de un archivo `.keep` vacío.
- **Renombrar Carpetas**: Se renombran carpetas moviendo todos los archivos y actualizando las referencias en Firestore.
- **Eliminación de Carpetas**: Se eliminan carpetas borrando todos los archivos dentro y luego la referencia en Firestore.

### Autenticación y Roles de Usuario

- **Autenticación**: Se utiliza `AuthContext` para gestionar la autenticación de usuarios.
- **Roles**: Los usuarios tienen roles que determinan sus permisos, como crear carpetas o gestionar usuarios.

### Comentarios y Puntuaciones

- **Comentarios**: Los profesores pueden agregar comentarios a los trabajos subidos.
- **Puntuaciones**: Se pueden asignar puntuaciones a los trabajos, proporcionando retroalimentación a los estudiantes.

### Funcionalidades de Administrador

- **Gestión de Usuarios**: Los administradores pueden gestionar usuarios y sus permisos.
- **Filtrado por Materia**: Los administradores tienen la capacidad de filtrar el contenido por materia.

## Tecnologías Utilizadas

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Firebase (Firestore para la base de datos, Storage para archivos)
- **Autenticación**: Firebase Authentication

## Estructura del Proyecto

```
Fie-Storage-V5/
├── src/
│   ├── components/
│   │   ├── ActivityHistory.tsx
│   │   ├── AdminFilters.tsx
│   │   ├── Breadcrumb.tsx
│   │   ├── CommentModal.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── FileActivity.tsx
│   │   ├── FileCard.tsx
│   │   ├── FileUploadButton.tsx
│   │   ├── Filters.tsx
│   │   ├── FolderCard.tsx
│   │   ├── FolderManagementDialog.tsx
│   │   ├── Navbar.tsx
│   │   ├── PrivateRoute.tsx
│   │   ├── ProfileDialog.tsx
│   │   ├── ProfileHeader.tsx
│   │   └── UserManagement.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── lib/
│   │   └── firebase.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── FileUpload.tsx
│   │   ├── FileView.tsx
│   │   ├── Login.tsx
│   │   ├── Profile.tsx
│   │   └── Register.tsx
│   ├── utils/
│   │   └── storage.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── types.ts
│   └── vite-env.d.ts
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

Este README proporciona una visión general de cómo funciona **Fie-Storage**, su estructura y las tecnologías empleadas. Para más detalles sobre la implementación, consulte los archivos de código fuente.
