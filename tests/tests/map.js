describe('gmMap', function () {

  var provider, gmLibrary,
    $window, $document, $q, $compile, $rootScope, $scope, $timeout,
    element, scope, controller, googleMaps;


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
  beforeEach(inject(function(_$window_, _$document_, _$q_, _$rootScope_, _$timeout_, _$compile_) {
    $window = _$window_;
    $document = _$document_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
    $compile = _$compile_;
    $scope = $rootScope.$new();
  }));


  //---------------------------------------------------------------------------
  // Simulate Google library load
  //---------------------------------------------------------------------------
  beforeEach(function(){

    provider.configure({
      url: 'http://url',
      callback: '__callback'
    });

    gmLibrary = provider.$get[4]($document, $window, $rootScope, $q);

    gmLibrary.load().then(function () {
      gmLibrary.populate($rootScope);
    });

    // simulate load ends
    $window.__callback();

    // required for promise to be resolved
    $rootScope.$digest();

    expect($rootScope.google).not.to.be.an('undefined');

    googleMaps = $rootScope.google.maps;
  });

  //---------------------------------------------------------------------------
  // TESTS
  //---------------------------------------------------------------------------

  /**
   * Compile template and populate "global" variable
   * @param template
   */
  function compile(template) {
    element = $compile(template)($scope);
    $scope.$digest();
    $timeout.flush();
    scope = element.scope();
    controller = element.controller('gmMap');
  }


  it('test simple case', function () {
    compile('<gm-map options="{center: [37, -122], zoom: 8}"></gm-map>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
  });


  it('wait for center', function () {
    compile('<gm-map center="center" options="{zoom: 8}"></gm-map>');
    expect(scope.map instanceof googleMaps.Map).to.be.equal(false);

    expect(scope.map).to.be.an('undefined');

    $scope.center = [37, -122];
    $scope.$digest();
    $timeout.flush();

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.map.__data.center.lat()).to.be.equal($scope.center[0]);
    expect(scope.map.__data.center.lng()).to.be.equal($scope.center[1]);
  });


});