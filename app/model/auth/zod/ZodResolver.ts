import { type ZodObject} from "zod"
import {isNotBlank} from "~/utils/CompanionObjects";


type RecordType<E> = Record<keyof E, any>;
export const createZodResolver = <V,E  >(schema: ZodObject) => {
    return async (data:V) => {
        const result = await schema.safeParseAsync(data);

        if (result.success) {
            return { values: result.data as V };
        }

        const errors: RecordType<E> = {} as RecordType<E>;
         console.log(result)
        result?.error?.issues?.forEach((error) => {
              error?.path?.forEach(path => {

                  const key = path.toString() as keyof E;

                  let prevMessage:string = Object.create(errors)[key]?.message as string;
                  const notBlank = isNotBlank<string>(prevMessage);
                  prevMessage =  notBlank?`${prevMessage}`:error.message;

                  errors[key] = { message: prevMessage , isError:true};
              });

        });
        return {errors: errors  as E};
    };
};