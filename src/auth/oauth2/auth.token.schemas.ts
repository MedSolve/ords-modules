import { setType, lib } from '@ords/obj-schema';

// http://scottksmith.com/blog/2014/07/02/beer-locker-building-a-restful-api-with-node-oauth2-server/

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
