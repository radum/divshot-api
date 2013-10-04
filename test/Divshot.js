var expect = require('chai').expect;
var sinon = require('sinon');
var Divshot = require('../lib/Divshot');
var userData = require('./fixtures/user_data');
// var User = require('../lib/User');

describe('Divshot', function() {
  var divshot;
  
  beforeEach(function () {
    divshot = createClient();
  });
  
  afterEach(function () {
    divshot = null;
  });
  
  it('creates and instance of Divshot', function () {
    expect(divshot instanceof Divshot).to.be.ok;
  });
  
  it('sets defaults', function () {
    expect(divshot.options.email).to.equal(userData.email);
    expect(divshot.options.password).to.equal(userData.password);
  });
  
  it('accepts a token and ignores email and password', function () {
    var d = Divshot.createClient({
      token: 'token'
    });
    
    expect(d.options.token).to.equal('token');
  });
  
});

function createClient () {
  return Divshot.createClient({
    email: userData.email,
    password: userData.password
  });
}