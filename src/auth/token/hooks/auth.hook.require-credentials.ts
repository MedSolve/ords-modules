import { ServiceRegistry, proposals } from '@ords/core';
import { Md5 } from 'ts-md5/dist/md5';
import { Observable, Observer } from 'rxjs';

let root = 'auth';

export namespace requireCredentialsErros {
    export const MISSING_PASSWORD = 'password is missing';
    export const MISSING_USERNAME = 'username is missing';
}

export class RequireCredentials {

    // signup and patch validate that password is present
    private signUp(request: proposals.Main.Types.Request): void {

        // the username reference
        let userFound: boolean = false;
        let existing: any = {};

        // perform md5 mapping
        request.package.map((val: [string, any]) => {

            // check if meta is being passed
            if (val[0] == 'meta') {

                // check if password is set
                if (val[1].password === undefined) {

                    throw new Error(requireCredentialsErros.MISSING_PASSWORD);
                }

                // check username is set
                if (val[1].username === undefined) {
                    throw new Error(requireCredentialsErros.MISSING_USERNAME);
                } else if (userFound === undefined) {
                    existing.username = val[1];
                    userFound = true

                    request.package.concat(Observable.create((handler: Observer<[string, string]>) => {

                        // send the username and complete
                        handler.next(['existing', existing]);
                        handler.complete();
                    }));
                }
            } else if (val[0] === 'existing') {
                existing = val[1];
            }

            return val
        });
    };
    private signIn(request: proposals.Main.Types.Request): void {

        // flag for passoword has been found
        let passwordFound = false;

        // flag for username has been found
        let usernameFound = false;

        // perform md5 mapping for signin
        request.package.subscribe((val: [string, any]) => {

            // check if password is being passed
            if (val[0] == 'password') {

                passwordFound = true;
            }

            // check if username is being passed
            if (val[0] == 'username') {

                usernameFound = true;
            }

        }, () => { }, () => {

            if (passwordFound === false) {
                throw new Error(requireCredentialsErros.MISSING_PASSWORD)
            }

            if (usernameFound === false) {
                throw new Error(requireCredentialsErros.MISSING_USERNAME)
            }
        });
    };
    constructor(msr: ServiceRegistry) {

        // bind hooks
        msr.addPreHook(root, '/signin/g', this.signIn.bind(this));
        msr.addPreHook(root, '/signup|patch/g', this.signUp.bind(this));

    }
}