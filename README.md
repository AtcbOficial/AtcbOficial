# ATCB Oficial - Sitio Web + Firebase

Catálogo y sitio de @AtcbOficial (Luis Bonilla) — Refrigeración Comercial e Industrial.

## Firebase

Proyecto: **atcboficial-catalogo**

### Qué se guarda en Firebase

| Dato | Dónde |
|------|--------|
| Historia, teléfono, WhatsApp, Instagram, clave admin | Firestore → config/site |
| Productos | Firestore → colección products |
| Galería / proyectos | Firestore → colección gallery |
| Imágenes de productos y proyectos | Firebase Storage → products/ y gallery/ |
| Carrito del cliente | Solo en el navegador (localStorage) |

### Configuración obligatoria en Firebase Console

1. Firestore Database → Crear base de datos (modo producción o prueba).
2. Storage → Activar.
3. Reglas temporales (para que funcione ya):

Firestore → Rules:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}

Storage → Rules:
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}

Luego puedes endurecer las reglas (Auth, etc.).

4. Publica el sitio (GitHub Pages u otro hosting).

### Primera carga

La primera vez que alguien abra el sitio, se crean automáticamente los datos iniciales en Firestore.

### Admin

- Acceso: clic en el punto del footer (o #admin en la URL).
- Clave por defecto: atcb2024
- Al agregar/editar, las imágenes van a Firebase Storage.
