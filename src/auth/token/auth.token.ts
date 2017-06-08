import { ServiceRegistry, ShortenAct, proposals } from '@ords/core';
import * as jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';

export class AuthToken implements proposals.Auth.Proposal {
    /**
     * Reference to the ms instance
     */
    private msr: ServiceRegistry
    /**
     * Reference to the resource used in the system
     */
    private resource = '_auth_token_accounts';
    /**
     * The root of for microservices
     */
    private root = 'auth';
    /**
     * JWT encoder
     */
    private encode: string;
    /**
     * Uses the microservice instance to get a hold of a database connection
     * Uses encode to for encryption of jwt
     */
    constructor(msr: ServiceRegistry, encode: string) {

        // bind reference
        this.msr = msr;

        // bind encoded
        this.encode = encode;

        // add services
        this.msr.addMicroService(this.root, 'signup', this.signUp.bind(this));
        this.msr.addMicroService(this.root, 'signin', this.signIn.bind(this));
        this.msr.addMicroService(this.root, 'signout', this.signOut.bind(this));
        this.msr.addMicroService(this.root, 'patch', this.patch.bind(this));
        this.msr.addMicroService(this.root, 'remove', this.remove.bind(this));
        this.msr.addMicroService(this.root, 'validate', this.validate.bind(this));
    }
    /**
     * Sign up a user
     */
    public signUp(request: proposals.Main.Types.Request, mH: proposals.Main.Types.PairObserver, pH: proposals.Main.Types.PairObserver) {

        // set meta complete
        mH.next([proposals.Main.Flag.FLAGSEND, proposals.Main.Flag.DataType.RAW])
        mH.complete();

        /**
         * The package to be used in operation
         */
        let opPackage: proposals.Database.Packages.Create = {
            resource: this.resource,
            data: {},
            query: {}
        };

        /**
         * Package recived in request
         */
        let recived: proposals.Auth.Packages.SignUp = {
            existing: {},
            meta: {}
        }

        // get objects from request
        request.package.subscribe((args: any) => {

            // save the arguments
            if (recived[args[0]] !== undefined) {
                recived[args[0]] = args[1];
            }

            // send back errors and perform action
        }, pH.error, () => {

            // check that any meta is recived
            if (Object.keys(recived.meta).length === 0) {

                // No content provided about the user
                pH.error(new Error('NO information about the user was provided'));

            } else {

                // map the recived to package
                opPackage.data = recived.meta;
                opPackage.query = recived.existing;

                // requret request
                let innerRequest: proposals.Main.Types.Request = {
                    auth: request.auth,
                    package: Observable.pairs(opPackage)
                };

                // perform signup with information
                ShortenAct.tryCatch(this.msr, 'db', 'create', innerRequest, (err: Error, user: any) => {

                    // check if any error
                    if (err) {
                        return pH.error(err);
                    } else if (user == 0) {
                        return pH.error(proposals.Auth.Flag.Error.USER_EXISTS)
                    } else {
                        pH.next([0, user]);
                        pH.complete();
                    }
                });
            }
        });
    }
    /**
     * Patch the user with new information
     */
    public patch(request: proposals.Main.Types.Request, mH: proposals.Main.Types.PairObserver, pH: proposals.Main.Types.PairObserver) {

        // set meta complete
        mH.next([proposals.Main.Flag.FLAGSEND, proposals.Main.Flag.DataType.RAW])
        mH.complete();

        /**
         * The packete to be used in operation
         */
        let opPackage: proposals.Database.Packages.Patch = {
            resource: this.resource,
            data: {},
            query: {}
        };

        /**
         * Package recived in request
         */
        let recived: proposals.Auth.Packages.Patch = {
            user: null,
            meta: {}
        }

        // get objects from request
        request.package.subscribe((args: any) => {

            // save the arguments
            if (recived[args[0]] !== undefined) {
                recived[args[0]] = recived[1];
            }

            // send back errors and perform action
        }, pH.error, () => {

            // check that user has been set
            if (recived.user === null) {

                // No content provided about the user
                pH.error(new Error('NO information about the user was provided'));

            } else {

                // map the recived to package
                opPackage.data = recived.meta;
                opPackage.query = { id: recived.user };

                // requret request
                let innerRequest: proposals.Main.Types.Request = {
                    auth: request.auth,
                    package: Observable.pairs(opPackage)
                };

                ShortenAct.tryCatch(this.msr, 'db', 'patch', innerRequest, (err: Error, user: any) => {

                    // check if any error
                    if (err) {
                        return pH.error(err);
                    } else if (user == 0) {
                        return pH.error(proposals.Auth.Flag.Error.USER_EXISTS)
                    } else {
                        pH.next([0, user]);
                        pH.complete();
                    }
                });
            }
        });
    }
    /**
     * Validate a user session
     */
    public validate(request: proposals.Main.Types.Request, mH: proposals.Main.Types.PairObserver, pH: proposals.Main.Types.PairObserver) {

        // set meta complete
        mH.next([proposals.Main.Flag.FLAGSEND, proposals.Main.Flag.DataType.RAW])
        mH.complete();

        /**
         * The packete to be used in operation
         */
        let token: string;

        // get objects from request
        request.package.subscribe((args: any) => {

            // save the arguments
            token = args[1];

            // send back errors and perform action
        }, pH.error, () => {

            // verify token
            jwt.verify(token, this.encode, (err: Error, decoded) => {

                // if error then send it back that auth information was invalid
                if (err) {
                    pH.error(new Error(proposals.Auth.Flag.Error.NO_VALID_AUTH))
                } else {
                    pH.next([0, decoded]);
                    pH.complete();
                }
            });
        });
    }
    /**
     * Sign up a user
     */
    public signIn(request: proposals.Main.Types.Request, mH: proposals.Main.Types.PairObserver, pH: proposals.Main.Types.PairObserver) {

        // set meta complete
        mH.next([proposals.Main.Flag.FLAGSEND, proposals.Main.Flag.DataType.RAW])
        mH.complete();

        /**
         * The packete to be used in operation
         */
        let opPackage: proposals.Database.Packages.Read = {
            resource: this.resource,
            query: {}
        };

        // get objects from request
        request.package.subscribe((args: any) => {

            // save the arguments
            opPackage.query[args[0]] = args[1];

            // send back errors and perform action
        }, pH.error, () => {

            // set limit to only one
            opPackage.limit = 1;

            // requret request
            let innerRequest: proposals.Main.Types.Request = {
                auth: request.auth, // would probably be undefined
                package: Observable.pairs(opPackage)
            };

            ShortenAct.tryCatch(this.msr, 'db', 'read', innerRequest, (err: Error, user: Array<any>) => {

                // check if any error
                if (err) {
                    return pH.error(err);
                } else if (user[0] === undefined) {
                    return pH.error(proposals.Auth.Flag.Error.NO_USER_FOUND)
                } else {
                    pH.next([0, jwt.sign(user[0].id, this.encode)]);
                    pH.complete();
                }
            });
        });
    }
    /**
     * Sign out a user account
     */
    public signOut(request: proposals.Main.Types.Request, mH: proposals.Main.Types.PairObserver, pH: proposals.Main.Types.PairObserver) {

        // send operation flag back 
        mH.next([proposals.Main.Flag.FLAGSEND, proposals.Main.Flag.DataType.RAW])
        mH.complete();

        // using JWT so signout not really needed
        pH.next([0, true]);
        pH.complete();
    }
    /**
     * Sign up a user
     */
    public remove(request: proposals.Main.Types.Request, mH: proposals.Main.Types.PairObserver, pH: proposals.Main.Types.PairObserver) {

        // set meta complete
        mH.next([proposals.Main.Flag.FLAGSEND, proposals.Main.Flag.DataType.RAW])
        mH.complete();

        /**
         * The packete to be used in operation
         */
        let opPackage: proposals.Database.Packages.Delete = {
            resource: this.resource,
            query: { id: null }
        };

        // get objects from request
        request.package.subscribe((args: any) => {

            // save the argument
            opPackage.query.id = args[1];

            // send back errors and perform action
        }, pH.error, () => {

            // requret request
            let innerRequest: proposals.Main.Types.Request = {
                auth: request.auth,
                package: Observable.pairs(opPackage)
            };

            ShortenAct.tryCatch(this.msr, 'db', 'delete', innerRequest, (err: Error, user: Boolean) => {

                // check if any error
                if (err) {
                    return pH.error(err);
                } else if (user == false) {
                    return pH.error(proposals.Auth.Flag.Error.NO_USER_FOUND)
                } else {
                    pH.next([0, user]);
                    pH.complete();
                }
            });
        });
    }
}
