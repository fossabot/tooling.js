'use strict';

const chai = require(`chai`);
const chaiAsPromised = require(`chai-as-promised`);
const sinon = require(`sinon`);

chai.use(chaiAsPromised);
sinon.assert.expose(chai.assert, {prefix: ``});
