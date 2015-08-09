describe('destroy', function () {

  var $compile, $rootScope, $scope, $timeout,
    googleMaps;


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

  it('full test', function () {

    var element, infowindow, streetviewpanorama, scope,
      mapController, markerController, infowindowController, streetviewpanoramaController;

    $scope.ifMap = true;
    $scope.ifMarker = true;
    $scope.ifInfowindow = true;
    $scope.ifStreetviewpanorama = true;

    element = $compile(
      '<div>' + // http://stackoverflow.com/questions/24246811/testing-ng-if-using-compile
        '<gm-map ng-if="ifMap" options="{center: [37, -122], zoom: 8}">' +
          '<gm-marker ng-if="ifMarker" position="map.getCenter()">' +
            '<gm-infowindow ng-if="ifInfowindow"></gm-infowindow>' +
          '</gm-marker>' +
        '</gm-map>' +
        '<gm-streetviewpanorama ng-if="ifStreetviewpanorama" options="{position: [1, 2]}"></gm-streetviewpanorama>' +
      '</div>'
    )($scope);

    $scope.$digest();
    $timeout.flush();
    infowindow = element.find('gm-infowindow');
    streetviewpanorama = element.find('gm-streetviewpanorama');

    scope = infowindow.scope();
    mapController = infowindow.controller('gmMap');
    markerController = infowindow.controller('gmMarker');
    infowindowController = infowindow.controller('gmInfowindow');

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(mapController.get() instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.marker instanceof googleMaps.Marker).to.be.equal(true);
    expect(markerController.get() instanceof googleMaps.Marker).to.be.equal(true);
    expect(scope.infoWindow instanceof googleMaps.InfoWindow).to.be.equal(true);
    expect(infowindowController.get() instanceof googleMaps.InfoWindow).to.be.equal(true);

    $scope.ifInfowindow = false;
    $scope.$digest();

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(scope.marker instanceof googleMaps.Marker).to.be.equal(true);
    expect(infowindowController.get()).to.be.an('undefined');
    expect(scope.infoWindow).to.be.an('undefined');

    $scope.ifMarker = false;
    $scope.$digest();

    expect(scope.map instanceof googleMaps.Map).to.be.equal(true);
    expect(markerController.get()).to.be.an('undefined');
    expect(infowindowController.get()).to.be.an('undefined');
    expect(scope.infoWindow).to.be.an('undefined');

    $scope.ifMap = false;
    $scope.$digest();

    expect(mapController.get()).to.be.an('undefined');
    expect(markerController.get()).to.be.an('undefined');
    expect(infowindowController.get()).to.be.an('undefined');
    expect(scope.map).to.be.an('undefined');
    expect(scope.marker).to.be.an('undefined');
    expect(scope.infoWindow).to.be.an('undefined');

    scope = streetviewpanorama.scope();
    streetviewpanoramaController = streetviewpanorama.controller('gmStreetviewpanorama');
    expect(scope.streetViewPanorama instanceof googleMaps.StreetViewPanorama).to.be.equal(true);
    expect(streetviewpanoramaController.get() instanceof googleMaps.StreetViewPanorama).to.be.equal(true);

    $scope.ifStreetviewpanorama = false;
    $scope.$digest();
    expect(streetviewpanoramaController.get()).to.be.an('undefined');

  });

});