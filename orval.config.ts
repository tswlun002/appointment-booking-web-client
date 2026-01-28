import { defineConfig } from "orval";

export default defineConfig({
    branchLocatorApi: {
        input: './app/resourses/contract/location-api.yaml',
        output: {
            mode: 'tags-split', // Create a folder per Swagger tag
            target: './app/api/generated/endpoints', // Path for hooks
            schemas: './app/api/generated/model', // Separate folder for TypeScript types
            client: 'react-query',
            clean: true, // Automatically delete old files before generating
            prettier: true, // Use your project's formatting
            override: {
                mutator: {
                    path: './app/lib/axios/default-axios.ts',
                    name: 'axiosJSONContentDefaultInstanceWrapper'
                }
            }
        }
    }
});