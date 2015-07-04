describe('Provider', function () {

  var provider, gmLibrary,
    $window, $document, $q, $rootScope;

  //---------------------------------------------------------------------------
  // Load Provider
  //---------------------------------------------------------------------------

  beforeEach(function () {
    var fakeModule = angular.module('test.app.config', function () {});

    fakeModule.config(function (gmLibraryProvider) {
      provider = gmLibraryProvider;
    });

    module('GoogleMapsNative', 'test.app.config');

    inject(function () {});
  });

  //---------------------------------------------------------------------------
  // Inject required
  //---------------------------------------------------------------------------

  beforeEach(inject(function(_$window_, _$document_, _$q_, _$rootScope_){
    $window = _$window_;
    $document = _$document_;
    $q = _$q_;
    $rootScope = _$rootScope_;
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

    gmLibrary = provider.$get[4]($document, $window, $rootScope, $q);

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

  });

});