describe('Provider', function () {

  var provider, gmLibrary,
    $window, $document, $rootScope, $q, $parse, $timeout;

  //---------------------------------------------------------------------------
  // Load Provider
  //---------------------------------------------------------------------------

  beforeEach(function () {
    var testApp = angular.module('test.app.config', ['GoogleMapsNative'], function () {});

    testApp.config(function (gmLibraryProvider) {
      provider = gmLibraryProvider;
    });

    module('test.app.config');

    inject(function () {});
  });

  //---------------------------------------------------------------------------
  // Inject required
  //---------------------------------------------------------------------------

  beforeEach(inject(function(_$window_, _$document_, _$rootScope_, _$q_, _$parse_, _$timeout_){
    $window = _$window_;
    $document = _$document_;
    $rootScope = _$rootScope_;
    $q = _$q_;
    $parse =_$parse_;
    $timeout = _$timeout_;
  }));

  //---------------------------------------------------------------------------
  // TESTS
  //---------------------------------------------------------------------------

  it('tests script inclusion', function () {

    var scripts, src, data,
      called = false,
      options = {
        url: 'http://url',
        v: "3.1",
        libraries: ['test', 'test2'],
        language: 'en',
        sensor: 'false',
        whatever: '123',
        callback: '__callback'
      };

    expect(provider).not.to.be.an('undefined');

    provider.configure(options);

    gmLibrary = provider.$get[6]($document, $window, $rootScope, $q, $parse, $timeout);

    // just to be sure of the test
    expect($window.__callback).to.be.an('undefined');

    gmLibrary.load().then(function () {
      called = true;
      gmLibrary.populate($rootScope);
    });

    // loading should create a callback function in the window object
    expect($window.__callback).not.to.be.an('undefined');

    // catch the script appended to the body
    scripts = $document.find("body").find("script");

    // last script should be the one
    src = scripts.eq(scripts.length - 1).attr("src");

    // split url & params
    src = src.split("?");

    expect(src[0]).to.be.equal(options.url);

    data = JSON.parse('{"' + decodeURI(src[1]).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');

    // tests params
    'v language sensor callback whatever'.split(' ').forEach(function (key) {
      expect(data[key]).to.be.equal(options[key]);
    });

    expect(data.libraries).to.be.equal(options.libraries.join(','));

    // load not yet simulated
    expect(called).to.be.equal(false);

    expect($window.__callback).not.to.be.an('undefined');

    // inject google library
    $window.google = $window.mokeGoogle;

    // simulate load end
    $window.__callback();

    // required for promise to be resolved
    $rootScope.$digest();

    // then callback should be unlinked from the global
    expect($window.__callback).to.be.an('undefined');

    // and promise should be resolved
    expect(called).to.be.equal(true);

    // test provide function
    expect($rootScope.google).to.deep.equal($window.google);

    // clean for next test
    delete $window.google;

  });

  it('tests library already loaded', function () {

    // pre-inject google library (user may have set it by its own in the head section)
    $window.google = $window.mokeGoogle;

    var called = false,
      options = {
        url: 'http://url',
        v: "3.1",
        libraries: ['test', 'test2'],
        language: 'en',
        sensor: 'false',
        whatever: '123',
        callback: '__callback'
      };

    expect(provider).not.to.be.an('undefined');

    provider.configure(options);

    gmLibrary = provider.$get[6]($document, $window, $rootScope, $q, $parse, $timeout);

    // just to be sure of the test
    expect($window.__callback).to.be.an('undefined');

    gmLibrary.load().then(function () {
      called = true;
      gmLibrary.populate($rootScope);
    });

    // loading should not create a callback and reuse the existing google maps library
    expect($window.__callback).to.be.an('undefined');

    expect(called).to.be.equal(false);

    // required for promise to be resolved
    $rootScope.$digest();

    // and promise should be resolved
    expect(called).to.be.equal(true);

    // test provide function
    expect($rootScope.google).to.deep.equal($window.google);

    // clean for next test
    delete $window.google;

  });

  it('tests library already loaded delayed', function () {

    var deferred;

    // pre-inject google library (user may have set it by its own in the head section)
    $window.google = $window.mokeGoogle;

    var called = false,
      options = {
        url: 'http://url',
        v: "3.1",
        libraries: ['test', 'test2'],
        language: 'en',
        sensor: 'false',
        whatever: '123',
        callback: '__callback',
        load: function (aDeferred) {
          deferred = aDeferred;
        }
      };

    expect(provider).not.to.be.an('undefined');

    provider.configure(options);

    gmLibrary = provider.$get[6]($document, $window, $rootScope, $q, $parse, $timeout);

    // just to be sure of the test
    expect($window.__callback).to.be.an('undefined');

    expect(deferred).to.be.an('undefined');

    gmLibrary.load().then(function () {
      called = true;
      gmLibrary.populate($rootScope);
    });

    // loading should not create a callback and reuse the existing google maps library
    expect($window.__callback).to.be.an('undefined');

    // custom load function should be called and deffered set
    expect(deferred).not.to.be.an('undefined');

    // library should still be waited
    expect(called).to.be.equal(false);

    // Let try it once
    $rootScope.$digest();

    // Nothing should happen
    expect(called).to.be.equal(false);

    // let's call the load end
    deferred.resolve();

    // required for promise to be resolved
    $rootScope.$digest();

    // and promise should be resolved
    expect(called).to.be.equal(true);

    // test provide function
    expect($rootScope.google).to.deep.equal($window.google);

    // clean for next test
    delete $window.google;

  });

});