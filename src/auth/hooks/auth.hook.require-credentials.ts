import { ServiceRegistry, proposals } from '@ords/core';
import { Md5 } from 'ts-md5/dist/md5';

let root = 'auth';

export namespace requireCredentialsErros {
    export const MISSING_PASSWORD = 'password is missing';
}

export class RequireCredentials {

    // signup and patch validate that password is present
    private signUp(request: proposals.Main.Types.Request): void {

        // perform md5 mapping
        request.package.subscribe((val: [string, any]) => {

            // check if meta is being passed
            if (val[0] == 'meta') {

                // check if password is set
                if (val[1].password === undefined) {

                    throw new Error(requireCredentialsErros.MISSING_PASSWORD);
                }
            }

            // return updated value
            return val;
        });
    };
    private signIn(request: proposals.Main.Types.Request): void {

        // flag for passoword has been found
        let passwordFound = false;

        // perform md5 mapping for signin
        request.package.subscribe((val: [string, any]) => {

            // check if meta is being passed
            if (val[0] == 'password') {

                passwordFound = true;
            }

        }, () => { }, () => {

            if (passwordFound === false) {
                throw new Error(requireCredentialsErros.MISSING_PASSWORD)
            }
        });
    };
    constructor(msr: ServiceRegistry) {

        // bind hooks
        msr.addPreHook(root, '/signin/g', this.signIn.bind(this));
        msr.addPreHook(root, '/signup|patch/g', this.signUp.bind(this));

    }
}