import { ServiceRegistry, proposals } from '@ords/core';
import { Md5 } from 'ts-md5/dist/md5';
import { Observable, Observer } from 'rxjs';
import * as EventEmitter from 'events';

let root = 'auth';

export namespace requireCredentialsErros {
    export const MISSING_PASSWORD = 'password is missing';
    export const MISSING_USERNAME = 'username is missing';
}

export class RequireCredentials {

    // signup and patch validate that password is present
    private signUp(request: proposals.Main.Types.Request): proposals.Main.Types.Request {

        // tmp holder for pre this hook results from request so far
        let tmp: any = {};

        // tmp holder handler to the observer that is gonna be extended
        let handler: Observer<[string, any]> = undefined;

        // flag to indicate how many things are done
        let isDone = 0;

        // function that perform the next once something is done in this function
        let next = () => {

            // count one more thing done
            isDone += 1;

            // check if suffcient amount of thigns are done
            if (isDone === 2) {

                if (tmp.existing === undefined) {
                    tmp.existing = {};
                }
                tmp.existing.username = tmp.meta.username;

                // send next results
                handler.next(['existing', tmp.existing]);
                handler.complete();
            }
        }

        // check that username and password is provided
        request.package.subscribe(
            (x) => {
                tmp[x[0]] = x[1];
            },
            () => { },
            () => {

                if (tmp.meta.password === undefined) {
                    throw new Error(requireCredentialsErros.MISSING_PASSWORD)
                }

                if (tmp.meta.username === false) {
                    throw new Error(requireCredentialsErros.MISSING_USERNAME)
                }

                // send found existing query to be emittet
                next();
            });

        // now map the 'existing' field to contain correct values
        request.package = request.package.concat(Observable.create((h: Observer<[string, any]>) => {

            // set reference for handler
            handler = h;
            next();
        }));

        return request;
    };
    private signIn(request: proposals.Main.Types.Request): proposals.Main.Types.Request {

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

        return request;
    };
    constructor(msr: ServiceRegistry) {

        // bind hooks
        msr.addPreHook(root, '/signin/g', this.signIn.bind(this));
        msr.addPreHook(root, '/signup|patch/g', this.signUp.bind(this));

    }
}