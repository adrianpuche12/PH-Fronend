
let currentHost = 'localhost'; // Valor por defecto

// Verificar si estamos en un entorno de navegador antes de usar window
if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    currentHost = window.location.hostname;
}

let keycloakAdapterUrl, apiUrl;

if (currentHost === '157.173.204.202') {
    if (window.location.port === '8054') {
        // DESARROLLO (frontend en puerto 8054)
        keycloakAdapterUrl = 'http://157.173.204.202:8092';  // Adapter dev
        apiUrl = 'http://157.173.204.202:8097';              // Backend dev ✅
    } else {
        // PRODUCCIÓN (frontend en puerto 8052)
        keycloakAdapterUrl = 'http://157.173.204.202:8089';  // Adapter prod  
        apiUrl = 'http://157.173.204.202:8099';              // Backend prod
    }
} else if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    // DESARROLLO LOCAL (frontend en localhost)
    keycloakAdapterUrl = 'http://157.173.204.202:8092';  // Adapter dev
    apiUrl = 'http://157.173.204.202:8097';              // Backend dev ✅
}

export const API_KEYCLOAK_ADAPTER_URL = keycloakAdapterUrl;
export const REACT_APP_API_URL = apiUrl;

// Solo loguear si estamos en un entorno de navegador
if (typeof window !== 'undefined') {
    console.log('Configuración de API:', {
        API_KEYCLOAK_ADAPTER_URL: keycloakAdapterUrl,
        REACT_APP_API_URL: apiUrl
    });
}