describe('gmDirections', function () {

  var $compile, $rootScope, $scope, $timeout,
    element, scope, googleMaps;


  //---------------------------------------------------------------------------
  // Load Library
  //---------------------------------------------------------------------------

  testTools.mokeGMLibrary();


  //---------------------------------------------------------------------------
  // Inject required
  //---------------------------------------------------------------------------
  beforeEach(inject(function(_$rootScope_, _$timeout_, _$compile_) {
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
    $compile = _$compile_;
    $scope = $rootScope.$new();
    googleMaps = $rootScope.google.maps;
  }));


  //---------------------------------------------------------------------------
  // TESTS
  //---------------------------------------------------------------------------


  function compile(template) {
    element = $compile(
      '<gm-map options="{center: [37, -122], zoom: 8}">' +
        '<gm-directions origin="origin" destination="destination" travelMode="travelMode" options="{origin: \'from\', destination: \'to\', travelMode: \'mode\'}">' +
          template +
        '</gm-directions>' +
      '</gm-map>')($scope);
    $scope.$digest();
    $timeout.flush();
    element = element.find('gm-renderer');
    scope = element.scope();
  }

  it('test rendering with update', function (done) {
    compile('<gm-renderer></gm-renderer>');

    setTimeout(function() {
      $rootScope.$digest(); // required to get the directions promise run
      expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
      expect(scope.renderer instanceof googleMaps.DirectionsRenderer).to.be.equal(true);

      expect(scope.renderer.getDirections().options.origin).to.be.equal('from');
      expect(scope.renderer.getDirections().options.destination).to.be.equal('to');
      expect(scope.renderer.getDirections().options.travelMode).to.be.equal('mode');

      $scope.origin = 'from2';
      $scope.destination = 'to2';
      $scope.travelMode = 'mode2';
      $rootScope.$digest(); // required to get the directions promise run

      setTimeout(function() {
        expect(scope.renderer.getDirections().options.origin).to.be.equal('from2');
        expect(scope.renderer.getDirections().options.destination).to.be.equal('to2');
        expect(scope.renderer.getDirections().options.travelMode).to.be.equal('mode2');

        $scope.origin = 'from2';
        $rootScope.$digest(); // required to get the directions promise run

        done();
      }, 10);

    }, 10);
  });

});