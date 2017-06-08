import { setType, lib } from '@ords/obj-schema';

let requiredString: lib.SingleElementDefinition = {
    numValues: 1,
    maxNumValues: 1,
    customValidator: (data: any) => {

        // just convert to string
        return data.toString();
    }
}

export namespace schemas {

    // Define our client schema
    export const CLIENT = {
        name: setType(requiredString),
        id: setType(requiredString),
        secret: setType(requiredString),
        userId: setType(requiredString)
    };

}
