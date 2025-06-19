/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BACKEND_API_URL: string;
    readonly VITE_BACKEND_API_PORT: string;
    // Agrega más variables de entorno según sea necesario
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}