import { defineConfig } from "orval";

export default defineConfig({
    branchLocatorApi: {
        input: './app/resources/contract/location-api.yaml',
        output: {
            mode: 'tags-split',
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
    // userApi: {
    //     input: './app/resources/contract/user-api.yaml',
    //     output: {
    //         mode: 'tags-split',
    //         target: './app/api/user/generated/endpoints',
    //         schemas: './app/domain/user/generated/model',
    //         client: 'react-query',
    //         clean: true,
    //         prettier: true,
    //         override: {
    //             mutator: {
    //                 path: './app/lib/axios/default-axios.ts',
    //                 name: 'axiosJSONContentDefaultInstanceWrapper'
    //             }
    //         }
    //     }
    // },
    // userApiZod: {
    //     input: './app/resources/contract/user-api.yaml',
    //     output: {
    //         target: './app/domain/user/generated/zod/index.ts',
    //         client: 'zod',
    //         clean: true,
    //         prettier: true
    //     }
    // }
});
