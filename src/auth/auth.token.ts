import { ServiceRegistry, proposals } from '@ords/core';
import * as jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { Md5 } from 'ts-md5/dist/md5';

export class AuthToken implements proposals.Auth.Proposal {
    /**
     * Reference to the ms instance
     */
    private ms: ServiceRegistry
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
    constructor(ms: ServiceRegistry, encode: string) {

        // bind reference
        this.ms = ms;

        // bind encoded
        this.encode = encode;

        // add services
        this.ms.addMicroService(this.root, 'signup', this.signUp.bind(this));
        this.ms.addMicroService(this.root, 'signin', this.signIn.bind(this));
        this.ms.addMicroService(this.root, 'signout', this.signOut.bind(this));
        this.ms.addMicroService(this.root, 'patch', this.patch.bind(this));
        this.ms.addMicroService(this.root, 'remove', this.remove.bind(this));
        this.ms.addMicroService(this.root, 'validate', this.validate.bind(this));

    }
    /**
     * Sign up a user
     */
    public signUp(request: proposals.Main.Types.Request, mH: proposals.Main.Types.PairObserver, pH: proposals.Main.Types.PairObserver) {

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

            // map the recived to package
            opPackage.data = recived.meta;
            opPackage.query = recived.existing;

            // check if password field exists and hash it
            if (opPackage.data.password) {
                opPackage.data.password = Md5.hashStr(opPackage.data.password);
            }

            // requret request
            let innerRequest: proposals.Main.Types.Request = {
                auth: request.auth,
                package: Observable.pairs(opPackage)
            };

            // perform signup with information
            let action = this.ms.act('db', 'create', innerRequest);
            action.meta.subscribe(
                (val) => { mH.next([val[0], val[1]]) },
                (err) => { mH.error(err) },
                () => { mH.complete() }
            );

            // user created
            let user: any = undefined;

            action.package.subscribe(
                (val) => {
                    user = val[1];
                }, 
                (err) => { 
                    pH.error(err)
                }, 
                () => {
                    // skip meta and send back found value
                    if (user == 0) {
                        pH.error(proposals.Auth.Flag.Error.USER_EXISTS)
                    } else {
                        pH.next([0, user]);
                        pH.complete();
                    }
                });
        });
    }
    /**
     * Patch the user so that 
     */
    public patch(request: proposals.Main.Types.Request, mH: proposals.Main.Types.PairObserver, pH: proposals.Main.Types.PairObserver) {

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

            // map the recived to package
            opPackage.data = recived.meta;
            opPackage.query = { id: recived.user };

            if (opPackage.data.password) {
                opPackage.data.password = Md5.hashStr(opPackage.data.password);
            }

            // requret request
            let innerRequest: proposals.Main.Types.Request = {
                auth: request.auth,
                package: Observable.pairs(opPackage)
            };

            let action = this.ms.act('db', 'patch', innerRequest);
            action.meta.subscribe(mH.next, mH.error, mH.complete);
            action.package.subscribe(pH.next, pH.error, pH.complete);
        });
    }
    /**
     * Validate a user session
     */
    public validate(request: proposals.Main.Types.Request, mH: proposals.Main.Types.PairObserver, pH: proposals.Main.Types.PairObserver) {

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
                    pH.next(decoded);
                    pH.complete();
                }
            });
        });
    }
    /**
     * Sign up a user
     */
    public signIn(request: proposals.Main.Types.Request, mH: proposals.Main.Types.PairObserver, pH: proposals.Main.Types.PairObserver) {

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
            opPackage.query._limit = 1;

            if (opPackage.query.password) {
                opPackage.query.password = Md5.hashStr(opPackage.query.password);
            }

            // requret request
            let innerRequest: proposals.Main.Types.Request = {
                auth: request.auth, // would probably be undefined
                package: Observable.pairs(opPackage)
            };

            let action = this.ms.act('db', 'read', innerRequest);
            action.meta.subscribe(
                (val) => { mH.next([val[0], val[1]]) },
                (err) => { mH.error(err) },
                () => { mH.complete() }
            );

            // set the found user
            let foundUser: any = undefined;

            action.package.subscribe(
                (value) => {
                    foundUser = value[1];
                },
                (err) => { pH.error(err) },
                () => {

                    // check that a user is found
                    if (foundUser !== undefined) {
                        // send signed token back
                        pH.next([0, jwt.sign(foundUser.id, this.encode)]);
                        pH.complete()
                    } else {
                        pH.error(proposals.Auth.Flag.Error.NO_USER_FOUND);
                    }
                }
            );
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

            let action = this.ms.act('db', 'delete', innerRequest);
            action.meta.subscribe(mH.next, mH.error, mH.complete);
            action.package.subscribe(pH.next, pH.error, pH.complete);
        });
    }
}
