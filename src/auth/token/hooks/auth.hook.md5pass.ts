import { ServiceRegistry, proposals } from '@ords/core';
import { Md5 } from 'ts-md5/dist/md5';

let root = 'auth';

export class MD5Pass {

    // signup and patch validate that password is present
    private signUp(request: proposals.Main.Types.Request): proposals.Main.Types.Request {

        // perform md5 mapping
        request.package = request.package.map((val: [string, any]) => {

            // check if meta is being passed
            if (val[0] == 'meta') {

                // check if password is set
                if (val[1].password !== undefined) {

                    // update value of password
                    val[1].password = Md5.hashStr(val[1].password);
                }
            }

            // return updated value
            return val;
        });

        return request;
    };
    private signIn(request: proposals.Main.Types.Request): proposals.Main.Types.Request {

        // perform md5 mapping for signin
        request.package = request.package.map((val: [string, any]) => {

            // check if meta is being passed
            if (val[0] == 'password') {

                // update value of password
                val[1] = Md5.hashStr(val[1]);
            }

            // return updated value
            return val;
        });

        return request;
    };
    constructor(msr: ServiceRegistry) {

        // bind hooks
        msr.addPreHook(root, '/signin/g', this.signIn.bind(this));
        msr.addPreHook(root, '/signup|patch/g', this.signUp.bind(this));

    }
}