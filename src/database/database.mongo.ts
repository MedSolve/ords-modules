import { ServiceRegistry,  } from '@ords/core';
import { Database, Main } from '../../proposals';
import * as Mongo from 'mongodb';

/**
 * MongoDB database connections 
 * Root: db
 */
export class DatabaseMongo implements Database.Proposal {
    /**
     * Database connection
     */
    private db: Mongo.Db
    public create(request: Main.Types.Request, mH: Main.Types.PairObserver, pH: Main.Types.PairObserver) {

        // send operation flag back
        mH.next([Main.Flag.FLAGSEND, Main.Flag.DataType.RAW])
        mH.complete();

        let op: Database.Packages.Create = {
            resource: undefined,
            data: {},
            query: {}
        };

        // get objects from request
        request.package.subscribe((args: any) => {

            // save the arguments
            op[args[0]] = args[1];

            // send back errors and perform action
        }, pH.error, () => {

            // replace object id in data
            if (op.data._id) {
                op.data._id = new Mongo.ObjectID(op.data._id);
            }

            // if query is emtpy then dont look for any findone
            if (Object.keys(op.query).length) {

                // replace object id in query
                if (op.query._id) {
                    op.query._id = new Mongo.ObjectID(op.query._id);
                }

                this.db.collection(op.resource).findOne(op.query).catch(pH.error).then((result: any) => {

                    // check if user do not exists
                    if (result === null) {

                        this.db.collection(op.resource).insertOne(op.data).catch(pH.error).then((result: Mongo.InsertOneWriteOpResult) => {

                            // send back inserted id
                            pH.next([0, result.insertedId]);
                            pH.complete();
                        });
                    } else {

                        // send back no results were found
                        pH.next([0, 0]);
                        pH.complete();
                    }
                })
            } else {

                this.db.collection(op.resource).insertOne(op.data).catch(pH.error).then((result: Mongo.InsertOneWriteOpResult) => {

                    // send back inserted id
                    pH.next([0, result.insertedId]);
                    pH.complete();
                });
            }
        });
    }
    public read(request: Main.Types.Request, mH: Main.Types.PairObserver, pH: Main.Types.PairObserver) {

        // send operation flag back
        mH.next([Main.Flag.FLAGSEND, Main.Flag.DataType.MULTIPLE])
        mH.complete();

        let op: Database.Packages.Read = {
            resource: '',
            query: {}
        };

        // get objects from request
        request.package.subscribe((args: any) => {

            // save the arguments
            op[args[0]] = args[1];

            // send back errors and perform action
        }, pH.error, () => {

            // replace object id in query
            if (op.query._id) {
                op.query._id = new Mongo.ObjectID(op.query._id);
            }

            let options: Mongo.FindOneOptions = {};

            // get limit from query
            if (op.query._limit) {
                options.limit = op.query._limit;
                delete op.query._limit;
            }

            // get sort from query
            if (op.query._sort) {
                options.sort = op.query._sort;
                delete op.query._sort;
            }

            // cast _id to object id!
            let curser = this.db.collection(op.resource).find(op.query, options);

            // how many documents found
            let counter = 0;

            // loop throughout documents found
            let loop = () => {

                // check if next exsists
                curser.hasNext((err: Error, flag: Boolean) => {

                    // check if error
                    if (err === null) {

                        // check if anything is left
                        if (flag) {

                            // then go and get the doc
                            curser.next((innerErr, doc) => {

                                // if error send it back
                                if (err === null) {
                                    counter++
                                    pH.next([counter, doc]);
                                    loop();
                                } else {
                                    pH.error(innerErr);
                                }
                            })

                            // if last record send back result
                        } else {
                            pH.complete();
                        }

                        // if any report back
                    } else {
                        pH.error(err);
                    }
                });
            }

            // start loop
            loop();

        });
    }
    public update(request: Main.Types.Request, mH: Main.Types.PairObserver, pH: Main.Types.PairObserver) {

        // send operation flag back
        mH.next([Main.Flag.FLAGSEND, Main.Flag.DataType.RAW])
        mH.complete();

        let op: Database.Packages.Patch = {
            resource: '',
            data: {},
            query: {}
        };

        // get objects from request
        request.package.subscribe((args: any) => {

            // save the arguments
            op[args[0]] = args[1];

            // send back errors and perform action
        }, pH.error, () => {

            // replace object id in data
            if (op.data._id) {
                op.data._id = new Mongo.ObjectID(op.data._id);
            }

            // replace object id in query
            if (op.query._id) {
                op.query._id = new Mongo.ObjectID(op.query._id);
            }

            this.db.collection(op.resource).replaceOne(op.query, op.data).catch(pH.error).then((result: Mongo.UpdateWriteOpResult) => {

                // send back number of updated
                pH.next([0, result.upsertedId]);
                pH.complete();
            });
        });

    }
    public patch(request: Main.Types.Request, mH: Main.Types.PairObserver, pH: Main.Types.PairObserver) {

        // send operation flag back
        mH.next([Main.Flag.FLAGSEND, Main.Flag.DataType.RAW])
        mH.complete();

        let op: Database.Packages.Patch = {
            resource: '',
            data: {},
            query: {}
        };

        // get objects from request
        request.package.subscribe((args: any) => {

            // save the arguments
            op[args[0]] = args[1];

            // send back errors and perform action
        }, pH.error, () => {

            // replace object id in query
            if (op.query._id) {
                op.query._id = new Mongo.ObjectID(op.query._id);
            }

            // replace object id in data
            if (op.data._id) {
                op.data._id = new Mongo.ObjectID(op.data._id);
            }

            this.db.collection(op.resource).updateOne(op.query, op.data).catch(pH.error).then((result: Mongo.UpdateWriteOpResult) => {

                // send back number of patched
                pH.next([0, result.upsertedId]);
                pH.complete();
            });
        });
    }
    public delete(request: Main.Types.Request, mH: Main.Types.PairObserver, pH: Main.Types.PairObserver) {

        // send operation flag back
        mH.next([Main.Flag.FLAGSEND, Main.Flag.DataType.RAW])
        mH.complete();

        let op: Database.Packages.Delete = {
            resource: '',
            query: {}
        };

        // get objects from request
        request.package.subscribe((args: any) => {

            // save the arguments
            op[args[0]] = args[1];

            // send back errors and perform action
        }, pH.error, () => {

            // replace object id in query
            if (op.query._id) {
                op.query._id = new Mongo.ObjectID(op.query._id);
            }

            this.db.collection(op.resource)
                .deleteOne(op.query).catch(pH.error).then((res: Mongo.DeleteWriteOpResultObject) => {

                    // send back number of removed document
                    pH.next([0, res.deletedCount]);
                    pH.complete();
                });
        });
    }
    constructor(ms: ServiceRegistry, connectionstring: string) {

        // connect first
        Mongo.MongoClient.connect(connectionstring, (err, db) => {

            // throw error cannot start
            if (err) {
                throw err
            }

            // add the read operations to the instance
            let root = 'db'
            this.db = db;

            ms.addMicroService(root, 'read', this.read.bind(this))
            ms.addMicroService(root, 'create', this.create.bind(this))
            ms.addMicroService(root, 'update', this.update.bind(this))
            ms.addMicroService(root, 'delete', this.delete.bind(this))
            ms.addMicroService(root, 'patch', this.patch.bind(this))
        });
    }
}