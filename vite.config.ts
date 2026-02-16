import {reactRouter} from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import {defineConfig, loadEnv} from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig(({mode}) => {

    const env = loadEnv(mode, process.cwd(), '')

    return {
        plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./app"),
            },
        },
        define: {
            // This string-replaces 'process.env' with an empty object or specific vars
            'process.env': {
                'process.env.VITE_API_BASE_URL': env.VITE_API_BASE_URL,
                'process.env.VITE_API_TIMEOUT': env.VITE_API_TIMEOUT,
                'process.env.VITE_API_RETRIES': env.VITE_API_RETRIES,
                'process.env.VITE_CUSTOM_HEADERS': env.VITE_CUSTOM_HEADERS,
                'process.env.VITE_REALM': env.VITE_REALM,
                'process.env.VITE_INTERNAL_BASE_URL': env.VITE_INTERNAL_BASE_URL,

            }
        }
    }
})

