import * as express from 'express';

/**
 * The request
 */
export interface ConnectorExpressRequest extends express.Request {
    /**
     * Body of a request
     */
    body: any;
    /**
     * User identification
     */
    auth: string;
    /**
     * Files
     */
    files: any;
}

/**
 * Express connector
 */
export class ConnectorExpress {
    /**
     * Maps that bind application logic
     */
    public maps: Array<express.Router> = [];
    /**
     * Express instance
     */
    public einstance: express.Application = express();
    /**
     * Start listening for incomming traffic
     */
    public listen(port: number, hostname?: string) {

        // compile instance with routes
        for (let route of this.maps) {
            this.einstance.use(route);
        }

        // set the routes to undefined so that people will get an error tryign to add paths to late
        this.maps = undefined;

        // check if hostname specificed and watch on that
        if (hostname !== undefined) {
            this.einstance.listen(port, hostname);
        } else {
            this.einstance.listen(port);
        }
    }
}