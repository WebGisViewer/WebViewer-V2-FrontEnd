/// <reference types="vite/client" />

/**
 * TypeScript declaration for environment variables
 */
interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_MAPBOX_ACCESS_TOKEN: string;
    readonly VITE_APP_TITLE: string;
    readonly VITE_USE_MOCK_API: string;
    readonly VITE_ANALYTICS_ID: string;
    readonly VITE_MAX_UPLOAD_SIZE: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}