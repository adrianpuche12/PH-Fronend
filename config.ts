let currentHost = 'localhost'; // Valor por defecto

// Verificar si estamos en un entorno de navegador antes de usar window
if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    currentHost = window.location.hostname;
}

let keycloakAdapterUrl, apiUrl, imageUrl;

if (currentHost === '157.173.204.202') {
    if (window.location.port === '8054') {
        // DESARROLLO (frontend en puerto 8054)
        keycloakAdapterUrl = 'http://157.173.204.202:8092';  // Adapter dev
        apiUrl = 'http://157.173.204.202:8097';              // Backend dev ✅
        imageUrl = 'http://157.173.204.202:3030';
    } else {
        // PRODUCCIÓN (frontend en puerto 8052)
        keycloakAdapterUrl = 'http://157.173.204.202:8089';  // Adapter prod  
        apiUrl = 'http://157.173.204.202:8089';              // Backend prod
        imageUrl = 'http://157.173.204.202:3030';
    }
} else if (currentHost === '178.18.253.253') {
    if (window.location.port === '8054') {
        // DESARROLLO NUEVO SERVIDOR (frontend en puerto 8054)
        keycloakAdapterUrl = 'http://178.18.253.253:8092';   // Nginx proxy a Keycloak Adapter DEV
        apiUrl = 'http://178.18.253.253:8097';               // Backend DEV directo
        imageUrl = 'http://178.18.253.253:3030';             // Servidor de imágenes DEV
    } else {
        // PRODUCCIÓN NUEVO SERVIDOR (frontend en puerto 8052)
        keycloakAdapterUrl = 'http://178.18.253.253:8089';   // Nginx proxy a Keycloak Adapter PROD
        apiUrl = 'http://178.18.253.253:8099';               // Backend PROD directo
        imageUrl = 'http://178.18.253.253:3030';             // Servidor de imágenes PROD
    }
} else if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    // DESARROLLO LOCAL (frontend en localhost)
    keycloakAdapterUrl = 'http://178.18.253.253:8092';      // Adapter dev NUEVO SERVIDOR
    apiUrl = 'http://178.18.253.253:8097';                  // Backend dev NUEVO SERVIDOR ✅
    imageUrl = 'http://178.18.253.253:3030';
} else {
    // FALLBACK - Si no coincide ningún host conocido
    console.warn('Host no reconocido:', currentHost, 'puerto:', window.location.port);
    
    // Detectar por puerto como fallback
    if (typeof window !== 'undefined' && window.location && window.location.port) {
        if (window.location.port === '8054') {
            // Es desarrollo - usar URLs de DEV del nuevo servidor
            keycloakAdapterUrl = 'http://178.18.253.253:8092';
            apiUrl = 'http://178.18.253.253:8097';
            imageUrl = 'http://178.18.253.253:3030';
            console.log('Detectado ambiente DEV por puerto 8054');
        } else if (window.location.port === '8052') {
            // Es producción - usar URLs de PROD del nuevo servidor
            keycloakAdapterUrl = 'http://178.18.253.253:8089';
            apiUrl = 'http://178.18.253.253:8099';
            imageUrl = 'http://178.18.253.253:3030';
            console.log('Detectado ambiente PROD por puerto 8052');
        } else {
            // Puerto desconocido - asumir desarrollo como safe default
            keycloakAdapterUrl = 'http://178.18.253.253:8092';
            apiUrl = 'http://178.18.253.253:8097';
            imageUrl = 'http://178.18.253.253:3030';
            console.log('Puerto desconocido, usando configuración DEV como default');
        }
    } else {
        // Si no hay información de puerto, usar desarrollo como default
        keycloakAdapterUrl = 'http://178.18.253.253:8092';
        apiUrl = 'http://178.18.253.253:8097';
        imageUrl = 'http://178.18.253.253:3030';
        console.log('Información de puerto no disponible, usando configuración DEV como default');
    }
}

// Verificación final - asegurar que las variables estén definidas
if (!keycloakAdapterUrl || !apiUrl) {
    console.error('ERROR: URLs no definidas correctamente');
    console.error('currentHost:', currentHost);
    console.error('port:', typeof window !== 'undefined' ? window.location.port : 'N/A');
    
    // Emergency fallback
    keycloakAdapterUrl = keycloakAdapterUrl || 'http://178.18.253.253:8092';
    apiUrl = apiUrl || 'http://178.18.253.253:8097';
    imageUrl = imageUrl || 'http://178.18.253.253:3030';
}

export const API_KEYCLOAK_ADAPTER_URL = keycloakAdapterUrl;
export const REACT_APP_API_URL = apiUrl;
export const IMAGE_SERVER_URL = imageUrl;

// Solo loguear si estamos en un entorno de navegador
if (typeof window !== 'undefined') {
    console.log('=== CONFIGURACIÓN DE API FINAL ===');
    console.log('Host detectado:', currentHost);
    console.log('Puerto detectado:', window.location.port);
    console.log('URLs configuradas:', {
        API_KEYCLOAK_ADAPTER_URL: keycloakAdapterUrl,
        REACT_APP_API_URL: apiUrl,
        IMAGE_SERVER_URL: imageUrl
    });
    console.log('================================');
}