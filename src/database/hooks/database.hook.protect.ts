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
            (request: proposals.Main.Types._baseRequest<
                proposals.Database.Packages.Create |
                proposals.Database.Packages.Read |
                proposals.Database.Packages.Update |
                proposals.Database.Packages.Delete |
                proposals.Database.Packages.Patch>,
                observable: Observer<[string, any]>): void
        }
    }
}

export class Protect {
    private schema: { [key: string]: schemaLib.SchemaValidation }
    private authRule: { [key: string]: lib.types.authRule }
    public setScema(key: string, schema: schemaLib.SchemaValidation) {
        // bind schema
        this.schema[key] = schema;
    }
    public setAuthRule(key: string, rule: lib.types.authRule) {
        // bind schema
        this.authRule[key] = rule;
    }
    /**
     * Create and bind hooks to msr
     * @param msr   reference to microservice registry
     * @param hooks hooks that needs to be enabled within this
     */
    constructor(msr: ServiceRegistry) {

        msr.addPreHook(root, '/create/update/g', this.checkFollowSchemaSrict.bind(this));
        msr.addPreHook(root, 'patch', this.checkFollowSchema.bind(this));
        msr.addPreHook(root, '*', this.checkAuthRule.bind(this));

    }
    /**
     * Check that a given rule for a schema is followed
     * @param request
     */
    private checkAuthRule(request: proposals.Main.Types.Request): proposals.Main.Types.Request {

        // reference to total package
        let tempPackage: proposals.Database.Packages.Create |
            proposals.Database.Packages.Read |
            proposals.Database.Packages.Update |
            proposals.Database.Packages.Delete |
            proposals.Database.Packages.Patch = {
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
            innerRequest.package = innerRequest;

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
    private checkFollowSchemaSrict(request: proposals.Main.Types.Request): proposals.Main.Types.Request {

        // reference to total package
        let tempPackage: proposals.Database.Packages.Create |
            proposals.Database.Packages.Read |
            proposals.Database.Packages.Update |
            proposals.Database.Packages.Delete |
            proposals.Database.Packages.Patch = {
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
            innerRequest.package = innerRequest;

            // check validation to run and run it
            if (innerRequest.package.runValidations && innerRequest.package.resource in this.schema) {
                this.schema[innerRequest.package.resource].validate(innerRequest.package.data, true);
            } else if (innerRequest.package.runValidations) {
                handle.error(new Error('SCHEMA UNDEFINED'));
                handle.complete();
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
    private checkFollowSchema(request: proposals.Main.Types.Request): proposals.Main.Types.Request {

        // reference to total package
        let tempPackage: proposals.Database.Packages.Create |
            proposals.Database.Packages.Read |
            proposals.Database.Packages.Update |
            proposals.Database.Packages.Delete |
            proposals.Database.Packages.Patch = {
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
            innerRequest.package = innerRequest;

            // check validation to run and run it
            if (innerRequest.package.runValidations && innerRequest.package.resource in this.schema) {
                this.schema[innerRequest.package.resource].validate(innerRequest.package.data, false);
            } else if (innerRequest.package.runValidations) {
                handle.error(new Error('SCHEMA UNDEFINED'));
                handle.complete();
            } else {
                handle.complete();
            }
        }));

        return request;
    };
}
