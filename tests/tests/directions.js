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
    element = $compile('<gm-map options="{center: [37, -122], zoom: 8}">' + template + '</gm-map>')($scope);
    $scope.$digest();
    $timeout.flush();
    element = element.find('gm-directions');
    scope = element.scope();
  }

  it('test simple case', function (done) {
    compile('<gm-directions options="{origin: \'from\', destination: \'to\', travelMode: \'mode\'}"></gm-directions>');

    setTimeout(function() {
      expect(scope.directions).not.to.be.an('undefined');
      expect(scope.directions.result.options.origin).to.be.equal('from');
      expect(scope.directions.result.options.destination).to.be.equal('to');
      expect(scope.directions.result.options.travelMode).to.be.equal('mode');

      done();
    }, 10);
  });

  it('test mandatory properties', function (done) {
    compile('<gm-directions origin="o" destination="d" travelMode="t"></gm-directions>');

    setTimeout(function() {
      expect(scope.directions).to.be.an('undefined');
      $scope.o = 'from';
      $scope.$digest();
      setTimeout(function() {
        expect(scope.directions).to.be.an('undefined');
        $scope.d = 'to';
        $scope.$digest();
        setTimeout(function() {
          expect(scope.directions).to.be.an('undefined');
          $scope.t = 'mode';
          $scope.$digest();
          setTimeout(function() {
            expect(scope.directions).not.to.be.an('undefined');
            expect(scope.directions.result.options.origin).to.be.equal('from');
            expect(scope.directions.result.options.destination).to.be.equal('to');
            expect(scope.directions.result.options.travelMode).to.be.equal('mode');
            done();
          }, 10);
        }, 10);
      }, 10);
    }, 10);
  });

});