import { ServiceRegistry, ShortenAct, proposals } from '@ords/core';
import { ConnectorExpress, ConnectorExpressRequest } from '../../connector';
import { Observable } from 'rxjs';
import * as express from 'express';
import * as bodyParser from 'body-parser';

/**
 * Express REST map connector
 */
export class MapExpressDatabaseRest {
    /**
     * The microservice server instance
     */
    private msever: ServiceRegistry
    /**
     * Maps to instance of db
     */
    private root: string = 'db'
    /**
     * Name mapping of HTTP
     */
    private nameMap: { [name: string]: any; } = {
        post: 'create',
        put: 'update',
        delete: 'delete',
        get: 'read',
        patch: 'patch'
    }
    /**
     * Construct new instance on the specific set of services
     */
    constructor(mserver: ServiceRegistry, connector: ConnectorExpress) {

        // create router on instance should it map differently??
        connector.maps.push(express.Router().all('/db/:resource/', bodyParser.json(), this.bridge.bind(this)));

        // save instance ref
        this.msever = mserver;

    }
    /**
     * Forward the request and send back the response between the micro services
     */
    public bridge(req: ConnectorExpressRequest, res: express.Response) {

        // create package
        let requestPackage: any = {
            query: req.query,
            resource: req.params.resource
        }

        // find the method
        req.method = req.method.toLowerCase();

        // set name
        let name = this.nameMap[req.method];

        // check if method requires body
        if (['patch', 'post', 'put'].indexOf(req.method) !== -1) {

            // merge files with body if any exists on key _files
            if (req.files != undefined) {

                // loop all files
                for (let file in req.files) {

                    //  save ref 
                    req.body['_files'][file] = req.files[file];
                }
            }

            // set reference to data
            requestPackage.data = req.body;
        }

        // create an observable request
        let request: proposals.Main.Types.Request = {
            package: Observable.pairs(requestPackage),
            auth: req.auth
        };

        // perform the action
        ShortenAct.tryCatch(this.msever, this.root, name, request, (err: Error, out: any, meta: any) => {

            if (err) {
                res.status(404).send(err.toString());
            } else {

                // set header from meta
                Object.keys(meta).forEach((key) => {

                    // bind key values of meta
                    res.header(key, meta[key]);
                });

                // check datatype of results
                if (Number.isInteger(out)) {
                    res.send(out.toString());
                } else {
                    res.send(out);
                }
            }
        });
    }
}