import { defineConfig } from "orval";

export default defineConfig({
    branchLocatorApi: {
        input: './app/resources/contract/location-api.yaml',
        output: {
            mode: 'tags-split',
            baseUrl: '/api/v1/locations/branches',
            target: './app/api/branch-locator/generated/endpoints',
            schemas: './app/domain/branch-locator/generated/model',
            client: 'react-query',
            clean: true,
            prettier: true,
            override: {
                mutator: {
                    path: './app/lib/axios/default-axios.ts',
                    name: 'axiosJSONContentDefaultInstanceWrapper'
                }
            }
        }
    },
    branchLocatorApiZod: {
        input: './app/resources/contract/location-api.yaml',
        output: {
            target: './app/domain/branch-locator/generated/zod/index.ts',
            client: 'zod',
            clean: true,
            prettier: true
        }
    },
    userApi: {
        input: './app/resources/contract/user-api.yaml',
        output: {
            mode: 'tags-split',
            baseUrl: '/api/v1/locations/branches',
            target: './app/api/user/generated/endpoints',
            schemas: './app/domain/user/generated/model',
            client: 'react-query',
            clean: true,
            prettier: true,
            override: {
                mutator: {
                    path: './app/lib/axios/default-axios.ts',
                    name: 'axiosJSONContentDefaultInstanceWrapper'
                }
            }
        }
    },
    userApiZod: {
        input: './app/resources/contract/user-api.yaml',
        output: {
            target: './app/domain/user/generated/zod/index.ts',
            client: 'zod',
            clean: true,
            prettier: true
        }
    },
    authenticationApi: {
        input: './app/resources/contract/auth-api.yaml',
        output: {
            mode: 'tags-split',
            baseUrl: '/api/v1/auth',
            target: './app/api/auth/generated/endpoints',
            schemas: './app/domain/auth/generated/model',
            client: 'react-query',
            clean: true,
            prettier: true,
            override: {
                mutator: {
                    path: './app/lib/axios/default-axios.ts',
                    name: 'axiosJSONContentDefaultInstanceWrapper'
                }
            }
        }
    },
    authenticationApiZod: {
        input: './app/resources/contract/auth-api.yaml',
        output: {
            target: './app/domain/auth/generated/zod/index.ts',
            client: 'zod',
            clean: true,
            prettier: true
        }
    }
});
