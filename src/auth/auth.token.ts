import { Auth, Database, Main } from '../../proposals';
import { ServiceRegistry } from '../../main';
import * as jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';

export class AuthToken implements Auth.Proposal {
    /**
     * Reference to the ms instance
     */
    private ms: ServiceRegistry
    /**
     * Reference to the resource used in the system
     */
    private resource: '_auth_token_accounts';
    /**
     * The root of for microservices
     */
    private root: 'auth';
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
        this.ms.addMicroService(this.root, 'signup', this.signOut.bind(this));
        this.ms.addMicroService(this.root, 'signin', this.signIn.bind(this));
        this.ms.addMicroService(this.root, 'signout', this.signOut.bind(this));
        this.ms.addMicroService(this.root, 'patch', this.patch.bind(this));
        this.ms.addMicroService(this.root, 'remove', this.remove.bind(this));
        this.ms.addMicroService(this.root, 'validate', this.validate.bind(this));

    }
    /**
     * Sign up a user
     */
    public signUp(request: Main.Types.Request, mH: Main.Types.PairObserver, pH: Main.Types.PairObserver) {

        /**
         * The package to be used in operation
         */
        let opPackage: Database.Packages.Create = {
            resource: this.resource,
            data: {},
            query: {}
        };

        /**
         * Package recived in request
         */
        let recived: Auth.Packages.SignUp = {
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

            // requret request
            let innerRequest: Main.Types.Request = {
                auth: request.auth,
                package: Observable.pairs(opPackage)
            };

            // perform signup with information
            let action = this.ms.act('db', 'create', request);
            action.meta.subscribe(mH.next, mH.error, mH.complete);
            action.package.subscribe(
                value => {
                    // skip meta and send back found value
                    if (value[1] == 0) {
                        pH.error(Auth.Flag.Error.USER_EXISTS)
                    } else {
                        pH.next([0, value]);
                    }
                }, pH.error, pH.complete);
        });
    }
    /**
     * Patch the user so that 
     */
    public patch(request: Main.Types.Request, mH: Main.Types.PairObserver, pH: Main.Types.PairObserver) {

        /**
         * The packete to be used in operation
         */
        let opPackage: Database.Packages.Patch = {
            resource: this.resource,
            data: {},
            query: {}
        };

        /**
         * Package recived in request
         */
        let recived: Auth.Packages.Patch = {
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

            // requret request
            let innerRequest: Main.Types.Request = {
                auth: request.auth,
                package: Observable.pairs(opPackage)
            };

            let action = this.ms.act('db', 'patch', request);
            action.meta.subscribe(mH.next, mH.error, mH.complete);
            action.package.subscribe(pH.next, pH.error, pH.complete);
        });
    }
    /**
     * Validate a user session
     */
    public validate(request: Main.Types.Request, mH: Main.Types.PairObserver, pH: Main.Types.PairObserver) {

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
                    pH.error(new Error(Auth.Flag.Error.NO_VALID_AUTH))
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
    public signIn(request: Main.Types.Request, mH: Main.Types.PairObserver, pH: Main.Types.PairObserver) {

        /**
         * The packete to be used in operation
         */
        let opPackage: Database.Packages.Read = {
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

            // requret request
            let innerRequest: Main.Types.Request = {
                auth: request.auth, // would probably be undefined
                package: Observable.pairs(opPackage)
            };

            let action = this.ms.act('db', 'read', request);
            action.meta.subscribe(mH.next, mH.error, mH.complete);
            action.package.subscribe(
                value => {
                    // check that a user is found
                    if (value[1] !== undefined && value[1].id) {
                        // send signed token back
                        pH.next([0, jwt.sign(value[0].id, this.encode)]);
                    } else {
                        pH.error(Auth.Flag.Error.NO_USER_FOUND);
                    }
                }, pH.error, pH.complete);
        });
    }
    /**
     * Sign out a user account
     */
    public signOut(request: Main.Types.Request, mH: Main.Types.PairObserver, pH: Main.Types.PairObserver) {

        // send operation flag back 
        mH.next([Main.Flag.FLAGSEND, Main.Flag.DataType.RAW])
        mH.complete();

        // using JWT so signout not really needed
        pH.next([0, true]);
        pH.complete();
    }
    /**
     * Sign up a user
     */
    public remove(request: Main.Types.Request, mH: Main.Types.PairObserver, pH: Main.Types.PairObserver) {

        /**
         * The packete to be used in operation
         */
        let opPackage: Database.Packages.Delete = {
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
            let innerRequest: Main.Types.Request = {
                auth: request.auth,
                package: Observable.pairs(opPackage)
            };

            let action = this.ms.act('db', 'delete', request);
            action.meta.subscribe(mH.next, mH.error, mH.complete);
            action.package.subscribe(pH.next, pH.error, pH.complete);
        });
    }
}
