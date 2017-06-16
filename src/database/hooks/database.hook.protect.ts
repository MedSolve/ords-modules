import { ServiceRegistry, proposals } from '@ords/core';
import { lib } from '@ords/obj-schema';

// root for commands bound to
let root = 'db';

export class Protect {
    private schema: { [key: string]: lib.SchemaValidation }
    private authRule: { [key: string]: Function }
    public setScema(key: string, schema: lib.SchemaValidation) {
        // bind schema
        this.schema[key] = schema;
    }
    public setAuthRule(key: string, rule: Function) {
        // bind schema
        this.authRule[key] = rule;
    }
    constructor(msr: ServiceRegistry) {

        // bind hooks
        msr.addPreHook(root, 'path', this.checkFollowSchema.bind(this));
        msr.addPreHook(root, '/create/update/g', this.checkFollowSchema.bind(this));
        msr.addPreHook(root, '*', this.checkAuthRule.bind(this));

    }
    /**
     * Check that a given rule for a schema is followed
     * @param request
     */
    private checkAuthRule(request: proposals.Main.Types.Request): proposals.Main.Types.Request {

        // read a flag to see if validation needs to be performed

        // check resource
        request.package.subscribe((val: [string, any]) => {

            // check if resource information is provided
            if (val[0] === 'resource') {

                // then do validation if exists
                if (val[1] in this.authRule) {
                    this.authRule[val[1]]('DATA GOES HERE and a request package should propably be returned');
                }
            }
        });

        return request;
    };
    /**
     * Check that data follows given schema scritly 
     * @param request
     */
    private checkFollowSchemaSrict(request: proposals.Main.Types.Request): proposals.Main.Types.Request {

        // read a flag to see if validation needs to be performed

        // check resource
        request.package.subscribe((val: [string, any]) => {

            // check if resource information is provided
            if (val[0] === 'resource') {

                // then do validation if exists
                if (val[1] in this.schema) {

                    // perform validation
                    this.schema[val[1]].validate(, true);
                } else {

                    throw new Error('Resource is not implemented');
                }
            }
        });

        return request;
    };
    /**
    * Check that data follows given schema non-strictly 
    * @param request
    */
    private checkFollowSchema(request: proposals.Main.Types.Request): proposals.Main.Types.Request {

        // read a flag to see if validation needs to be performed

        // check resource
        request.package.subscribe((val: [string, any]) => {

            // check if resource information is provided
            if (val[0] === 'resource') {

                // then do validation if exists
                if (val[1] in this.schema) {

                    // perform validation
                    this.schema[val[1]].validate(, false);
                } else {

                    throw new Error('Resource is not implemented');
                }
            }
        });

        return request;
    };
}
