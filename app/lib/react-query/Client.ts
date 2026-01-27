import {MutationCache, QueryClient} from "@tanstack/react-query";

export const queryClient = new QueryClient({
    mutationCache: new MutationCache({
        onError: (error, variables, context, mutation) => {
            const invalidateQueries = mutation.meta?.invalidateOnError;
            if (invalidateQueries) {
                queryClient.invalidateQueries(invalidateQueries);
            }
        },
        onSettled:(data, error) => {
            queryClient.invalidateQueries({ queryKey: ['userLogin'] })
        }
    })
});
