import { ServiceRegistry, ShortenAct, proposals } from '@ords/core';
import { connectors } from '../../';
import { Observable } from 'rxjs';
import * as express from 'express';
import * as bodyParser from 'body-parser';

/**
 * Express REST map connector
 */
export class MapExpress {
    /**
     * The microservice server instance
     */
    private msever: ServiceRegistry
    /**
     * Maps to instance of db
     */
    private root: string = 'auth'
    /**
     * Construct new instance on the specific set of services
     */
    constructor(mserver: ServiceRegistry, connector: connectors.ConnectorExpress) {

        // create router on instance should it map differently
        connector.maps.push(express.Router().use(this.validate.bind(this)));
        connector.maps.push(express.Router().post('/auth/signin/', bodyParser.urlencoded({ extended: true }), bodyParser.json(), this.signIn.bind(this)));
        connector.maps.push(express.Router().post('/auth/signup/', bodyParser.urlencoded({ extended: true }), bodyParser.json(), this.signUp.bind(this)));
        connector.maps.push(express.Router().get('/auth/signout/', this.signOut.bind(this)));
        connector.maps.push(express.Router().get('/auth/remove/', this.remove.bind(this)));
        connector.maps.push(express.Router().get('/auth/patch/', this.patch.bind(this)));

        // save instance ref
        this.msever = mserver;

    }
    /**
     * Log in a user based upon password and username
     */
    private signIn(req: connectors.ConnectorExpressRequest, res: express.Response, next: express.NextFunction): void {

        // check if fields exists in body
        if (req.body.meta === undefined) {
            res.send(400);

            // if everything is a okay then processed
        } else {

            // create an observable request
            let request: proposals.main.types.Request = {
                package: Observable.pairs(req.body.meta),
                auth: req.auth
            };

            // perform the action
            ShortenAct.tryCatch(this.msever, this.root, 'signin', request, (err: Error, out: any, meta: any) => {

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
    /**
     * Sign up a user based upon password and username
     */
    private signUp(req: connectors.ConnectorExpressRequest, res: express.Response, next: express.NextFunction): void {

        // check if fields exists in body
        if (req.body.meta === undefined) {
            res.send(400);

            // if everything is a okay then processed
        } else {

            // create an observable request
            let request: proposals.main.types.Request = {
                package: Observable.pairs(req.body),
                auth: req.auth
            };

            // perform the action
            ShortenAct.tryCatch(this.msever, this.root, 'signup', request, (err: Error, out: any, meta: any) => {

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
    /**
     * Log in a user based upon password and username
     */
    private signOut(req: connectors.ConnectorExpressRequest, res: express.Response, next: express.NextFunction): void {

        // check session
        if (req.headers.authorization !== undefined) {

            // split into parts
            var parts = req.headers.authorization.split(' ');

            // create an observable request
            let request: proposals.main.types.Request = {
                package: Observable.pairs({
                    session: parts[1]
                }),
                auth: req.auth
            };

            // perform the action
            ShortenAct.tryCatch(this.msever, this.root, 'signout', request, (err: Error, out: any, meta: any) => {

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

            // could not sign out since no session specified
        } else {
            res.send(400);
        }
    }
    /**
     * Remove the current user
     */
    private remove(req: connectors.ConnectorExpressRequest, res: express.Response, next: express.NextFunction): void {

        // create an observable request
        let request: proposals.main.types.Request = {
            package: Observable.pairs({
                account: req.auth
            }),
            auth: req.auth
        };

        // perform the action
        ShortenAct.tryCatch(this.msever, this.root, 'remove', request, (err: Error, out: any, meta: any) => {

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
    /**
     * Patch the current user
     */
    private patch(req: connectors.ConnectorExpressRequest, res: express.Response, next: express.NextFunction): void {

        // check if fields exists in body
        if (req.body.meta === undefined) {
            res.send(400);

            // if everything is a okay then processed
        } else {

            // create an observable request
            let request: proposals.main.types.Request = {
                package: Observable.pairs({
                    user: req.auth,
                    meta: req.body.meta
                }),
                auth: req.auth
            };

            // perform the action
            ShortenAct.tryCatch(this.msever, this.root, 'patch', request, (err: Error, out: any, meta: any) => {

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
    /**
     * Remove the current user
     */
    private validate(req: connectors.ConnectorExpressRequest, res: express.Response, next: express.NextFunction): void {

        // if no header is set go next as auth is undefined
        if (req.headers.authorization === undefined) {
            next();

            // if everything is a okay then processed
        } else {

            // split into parts
            var parts = req.headers.authorization.split(' ');

            // create an observable request
            let request: proposals.main.types.Request = {
                package: Observable.pairs({
                    session: parts[1],
                }),
                auth: req.auth
            };

            // perform the action
            ShortenAct.tryCatch(this.msever, this.root, 'validate', request, (err: Error, out: any, meta: any) => {

                if (err) {
                    res.status(404).send(err.toString());
                } else {

                    // set header from meta
                    Object.keys(meta).forEach((key) => {

                        // bind key values of meta
                        res.header(key, meta[key]);
                    });

                    // set auth
                    req.auth = out;

                    next();
                }
            });
        }
    }
}