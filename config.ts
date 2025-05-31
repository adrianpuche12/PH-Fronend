//export const API_KEYCLOAK_ADAPTER_URL = 'http://localhost:8088';
//export const REACT_APP_API_URL = 'http://localhost:8080';

//export const API_KEYCLOAK_ADAPTER_URL = 'http://157.173.204.202:8085/auth';
//export const REACT_APP_API_URL = 'http://157.173.204.202:8085/api';


//export const API_KEYCLOAK_ADAPTER_URL = 'http://157.173.204.202:8089';
//export const REACT_APP_API_URL = 'http://157.173.204.202:8099';






// config.ts
// Detectar el entorno y establecer el host actual
let currentHost = 'localhost'; // Valor por defecto

// Verificar si estamos en un entorno de navegador antes de usar window
if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    currentHost = window.location.hostname;
}

// Configurar URLs basadas en el host
let keycloakAdapterUrl, apiUrl;

/*
if (currentHost === '157.173.204.202') {
    // Configuración para el servidor original
    keycloakAdapterUrl = 'http://157.173.204.202:8089';
    apiUrl = 'http://157.173.204.202:8099';
} else if (currentHost === '178.18.253.253') {
    // Configuración para el nuevo servidor
    keycloakAdapterUrl = 'http://178.18.253.253:8089';
    apiUrl = 'http://178.18.253.253:8099';
} else {
    // Configuración para desarrollo local u otros entornos
    keycloakAdapterUrl = 'http://localhost:8088';
    apiUrl = 'http://localhost:8080';
}
*/


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
}

// Exportar las constantes
export const API_KEYCLOAK_ADAPTER_URL = keycloakAdapterUrl;
export const REACT_APP_API_URL = apiUrl;

// Solo loguear si estamos en un entorno de navegador
if (typeof window !== 'undefined') {
    console.log('Configuración de API:', {
        API_KEYCLOAK_ADAPTER_URL: keycloakAdapterUrl,
        REACT_APP_API_URL: apiUrl
    });
}