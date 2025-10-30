
let currentHost = 'localhost'; // Valor por defecto

// Verificar si estamos en un entorno de navegador antes de usar window
if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    currentHost = window.location.hostname;
}

let keycloakAdapterUrl, apiUrl, imageUrl;

if (currentHost === '178.18.253.253') {
    if (window.location.port === '8054') {
        // DESARROLLO (frontend en puerto 8054)
        keycloakAdapterUrl = 'http://178.18.253.253:8092';  // Adapter dev
        apiUrl = 'http://178.18.253.253:8097';              // Backend dev
        imageUrl = 'http://178.18.253.253:3030';
    } else {
        // PRODUCCIÓN (frontend en puerto 8052)
        keycloakAdapterUrl = 'http://178.18.253.253:8089';  // Nginx proxy (CORREGIDO)
        apiUrl = 'http://178.18.253.253:8099';              // Backend prod (puerto 8099)
        imageUrl = 'http://178.18.253.253:3030';
    }
} else {
    // DESARROLLO LOCAL (frontend en localhost) y CUALQUIER OTRO HOST
    keycloakAdapterUrl = 'http://178.18.253.253:8089';  // Nginx proxy (CORREGIDO)
    apiUrl = 'http://178.18.253.253:8099';              // Backend prod
    imageUrl = 'http://178.18.253.253:3030';
}

export const API_KEYCLOAK_ADAPTER_URL = keycloakAdapterUrl;
export const REACT_APP_API_URL = apiUrl;
export const IMAGE_SERVER_URL = imageUrl;

// Solo loguear si estamos en un entorno de navegador
if (typeof window !== 'undefined') {
    console.log('Configuración de API:', {
        API_KEYCLOAK_ADAPTER_URL: keycloakAdapterUrl,
        REACT_APP_API_URL: apiUrl
    });
}