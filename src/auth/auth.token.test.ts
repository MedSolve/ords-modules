import { expect } from 'chai';
import { ServiceRegistry } from '../src';

describe('ServiceRegistry', function () {
    it('no services should be present', function () {
        var regex = new ServiceRegistry();
        expect(regex.resolvers.length).to.equal(0);
    });
});