import { ServiceRegistry, proposals } from '@ords/core';
import { lib as schemaLib } from '@ords/obj-schema';
import { Observer, Observable } from 'rxjs';

// root for commands bound to
let root = 'db';

/**
 * FOllows structure of proposals protectHookLib would be other lib functions
 */
export namespace ProtectHookProposal {

    export namespace types {
        export interface authRule extends Function {
            (request: proposals.main.types._BaseRequest<
                proposals.database.Packages.Create |
                proposals.database.Packages.Read |
                proposals.database.Packages.Update |
                proposals.database.Packages.Delete |
                proposals.database.Packages.Patch>,
                observable: Observer<[string, any]>): void
        }
    }
}

export class Protect {
    private schema: { [key: string]: schemaLib.SchemaValidation } = {};
    private authRule: { [key: string]: ProtectHookProposal.types.authRule } = {};
    public setSchema(key: string, schema: schemaLib.SchemaValidation) {
        // bind schema
        this.schema[key] = schema;
    }
    public setAuthRule(key: string, rule: ProtectHookProposal.types.authRule) {
        // bind schema
        this.authRule[key] = rule;
    }
    /**
     * Create and bind hooks to msr
     * @param msr   reference to microservice registry
     * @param hooks hooks that needs to be enabled within this
     */
    constructor(msr: ServiceRegistry) {

        msr.addPreHook(root, '/create/update/g', this.checkFollowSchemaStrict.bind(this));
        msr.addPreHook(root, 'read', this.checkResourceExist.bind(this));
        msr.addPreHook(root, 'patch', this.checkFollowSchema.bind(this));
        msr.addPreHook(root, '*', this.checkAuthRule.bind(this));

    }
    /**
     * Check that a given resource exists by a schema existing for it
     * @param request
     */
    private checkResourceExist(request: proposals.main.types.Request): proposals.main.types.Request {

        // reference to total package
        let tempPackage: proposals.database.Packages.Create |
            proposals.database.Packages.Read |
            proposals.database.Packages.Update |
            proposals.database.Packages.Delete |
            proposals.database.Packages.Patch = {
                query: undefined,
                resource: undefined
            };

        // perform new package handling
        request.package = request.package.map((value) => {

            tempPackage[value[0]] = value[1];

            return value;
        }).concat(Observable.create((handle: Observer<[string, any]>) => {

            // create new inner request
            let innerRequest: any = Object.assign({}, request);

            // add reference to old package
            innerRequest.package = tempPackage;

            // check validation to run and run it
            if (innerRequest.package.runValidations && innerRequest.package.resource in this.schema) {
                handle.complete();
            } else if (innerRequest.package.runValidations) {
                handle.error(new Error('SCHEMA UNDEFINED'));
            } else {
                handle.complete();
            }

        }));

        return request;
    };
    /**
     * Check that a given rule for a schema is followed
     * @param request
     */
    private checkAuthRule(request: proposals.main.types.Request): proposals.main.types.Request {

        // reference to total package
        let tempPackage: proposals.database.Packages.Create |
            proposals.database.Packages.Read |
            proposals.database.Packages.Update |
            proposals.database.Packages.Delete |
            proposals.database.Packages.Patch = {
                query: undefined,
                resource: undefined
            };

        // perform new package handling
        request.package = request.package.map((value) => {

            tempPackage[value[0]] = value[1];

            return value;
        }).concat(Observable.create((handle: Observer<[string, any]>) => {

            // create new inner request
            let innerRequest: any = Object.assign({}, request);

            // add reference to old package
            innerRequest.package = tempPackage;

            // check validation to run and run it
            if (innerRequest.package.runValidations && innerRequest.package.resource in this.authRule) {
                this.authRule[innerRequest.package.resource](innerRequest, handle);
            } else {
                handle.complete();
            }
        }));

        return request;
    };
    /**
     * Check that data follows given schema scritly 
     * @param request
     */
    private checkFollowSchemaStrict(request: proposals.main.types.Request): proposals.main.types.Request {

        // reference to total package
        let tempPackage: proposals.database.Packages.Create |
            proposals.database.Packages.Read |
            proposals.database.Packages.Update |
            proposals.database.Packages.Delete |
            proposals.database.Packages.Patch = {
                query: undefined,
                resource: undefined
            };

        console.log("trying to validate");

        // perform new package handling
        request.package = request.package.map((value) => {

            tempPackage[value[0]] = value[1];

            return value;
        }).concat(Observable.create((handle: Observer<[string, any]>) => {

            console.log("Only run once");

            // create new inner request
            let innerRequest: any = Object.assign({}, request);

            // add reference to old package
            innerRequest.package = tempPackage;

            // check validation to run and run it
            if (innerRequest.package.runValidations && innerRequest.package.resource in this.schema) {
       
                try {
                    handle.next(['data', this.schema[innerRequest.package.resource].validate(innerRequest.package.data, true)]); 
                    handle.complete();
                } catch (e) {

                    // check if object error
                    if (Object.keys(e).length !== 0) {
                        // array of total erros
                        let totalErr: Array<any> = [];
                        for (let err of Object.keys(e)) {

                            totalErr.push(err + ': ' + e[err].toString());
                        }
                        handle.error(new Error(totalErr.join(',')));
                    } else {
                        handle.error(e);
                    }
                }
            } else if (innerRequest.package.runValidations) {
                handle.error(new Error('SCHEMA UNDEFINED'));
            } else {
                handle.complete();
            }
        }));

        return request;
    };
    /**
    * Check that data follows given schema non-strictly 
    * @param request
    */
    private checkFollowSchema(request: proposals.main.types.Request): proposals.main.types.Request {

        // reference to total package
        let tempPackage: proposals.database.Packages.Create |
            proposals.database.Packages.Read |
            proposals.database.Packages.Update |
            proposals.database.Packages.Delete |
            proposals.database.Packages.Patch = {
                query: undefined,
                resource: undefined
            };

        // perform new package handling
        request.package = request.package.map((value) => {

            tempPackage[value[0]] = value[1];

            return value;
        }).concat(Observable.create((handle: Observer<[string, any]>) => {

            // create new inner request
            let innerRequest: any = Object.assign({}, request);

            // add reference to old package
            innerRequest.package = tempPackage;

            // check validation to run and run it
            if (innerRequest.package.runValidations && innerRequest.package.resource in this.schema) {
                try {
                    handle.next(['data', this.schema[innerRequest.package.resource].validate(innerRequest.package.data, false)]); 
                    handle.complete();
                } catch (e) {

                    // check if object error
                    if (Object.keys(e).length !== 0) {
                        // array of total erros
                        let totalErr: Array<any> = [];
                        for (let err of Object.keys(e)) {
                            totalErr.push(err + ': ' + e[err].toString());
                        }
                        handle.error(new Error(totalErr.join(',')));
                    } else {
                        handle.error(e);
                    }
                }
            } else if (innerRequest.package.runValidations) {
                handle.error(new Error('SCHEMA UNDEFINED'));
            } else {
                handle.complete();
            }
        }));

        return request;
    };
}
