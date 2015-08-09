describe('gm-then', function () {

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

  it('test gm-then', function (done) {
    $scope.data = {
      map: 0,
      marker: 0,
      infowindow: 0,
      trafficLayer: 0,
      bicyclingLayer: 0,
      transitLayer: 0,
      renderer: 0,
      rectangle: 0,
      groundOverlay: 0,
      kmlLayer: 0,
      polygon: 0,
      polyline: 0,
      streetviewpanorama: 0,
      circle: 0
    };
    $scope.objects = {};

    element = $compile(
      '<gm-map options="{center: [37, -122], zoom: 8}" gm-then="data.map = data.map + 1; objects.map = map">' +
        '<gm-marker options="{position: [1,2]}" gm-then="data.marker = data.marker + 1; objects.marker = marker; objects.mapMarker = map"></gm-marker>' +
        '<gm-marker position="map.getCenter()" gm-then="data.marker = data.marker + 1">' +
          '<gm-infowindow gm-then="data.infowindow = data.infowindow + 1; objects.infowindow = infoWindow"></gm-infowindow>' +
        '</gm-marker>' +
        '<gm-circle center="map.getCenter()" options="{radius: 100000}" gm-then="data.circle = data.circle + 1; objects.circle = circle"></gm-circle>' +
        '<gm-trafficLayer gm-then="data.trafficLayer = data.trafficLayer + 1; objects.trafficLayer = trafficLayer"></gm-trafficLayer>' +
        '<gm-bicyclingLayer gm-then="data.bicyclingLayer = data.bicyclingLayer + 1; objects.bicyclingLayer = bicyclingLayer"></gm-bicyclingLayer>' +
        '<gm-transitLayer gm-then="data.transitLayer = data.transitLayer + 1; objects.transitLayer = transitLayer"></gm-transitLayer>' +
        '<gm-directions origin="origin" destination="destination" travelMode="travelMode" options="{origin: \'from\', destination: \'to\', travelMode: \'mode\'}">' +
          '<gm-renderer gm-then="data.renderer = data.renderer + 1; objects.renderer = renderer"></gm-renderer>' +
        '</gm-directions>' +
        '<gm-rectangle options="{bounds: {n:1, e:2, s:3, w:4}}" gm-then="data.rectangle = data.rectangle + 1; objects.rectangle = rectangle"></gm-rectangle>' +
        '<gm-groundOverlay options="{url:\'http://url\', bounds:[1,2,3,4], opts: {opacity:0.8}}" gm-then="data.groundOverlay = data.groundOverlay + 1; objects.groundOverlay = groundOverlay"></gm-groundOverlay>' +
        '<gm-kmlLayer options="{url:\'http://url\', opts: {suppressInfoWindows:true}}" gm-then="data.kmlLayer = data.kmlLayer + 1; objects.kmlLayer = kmlLayer"></gm-kmlLayer>' +
        '<gm-polygon options="{paths:[[1, 2], [3, 4], [5, 6]]}" gm-then="data.polygon = data.polygon + 1; objects.polygon = polygon"></gm-polygon>' +
        '<gm-polyline options="{path:[[1, 2], [3, 4], [5, 6]]}" gm-then="data.polyline = data.polyline + 1; objects.polyline = polyline"></gm-polyline>' +
      '</gm-map>' +
      '<gm-streetviewpanorama options="{position: [1, 2]}" gm-then="data.streetviewpanorama = data.streetviewpanorama + 1; objects.streetviewpanorama = streetViewPanorama"></gm-streetviewpanorama>'
    )($scope);

    $scope.$digest();
    $timeout.flush();

    expect($scope.data.map).to.be.equal(1);
    expect($scope.data.marker).to.be.equal(2);
    expect($scope.data.infowindow).to.be.equal(1);
    expect($scope.data.circle).to.be.equal(1);
    expect($scope.data.trafficLayer).to.be.equal(1);
    expect($scope.data.bicyclingLayer).to.be.equal(1);
    expect($scope.data.transitLayer).to.be.equal(1);
    expect($scope.data.rectangle).to.be.equal(1);
    expect($scope.data.groundOverlay).to.be.equal(1);
    expect($scope.data.kmlLayer).to.be.equal(1);
    expect($scope.data.polygon).to.be.equal(1);
    expect($scope.data.polyline).to.be.equal(1);
    expect($scope.data.streetviewpanorama).to.be.equal(1);

    expect($scope.objects.map instanceof googleMaps.Map).to.be.equal(true);
    expect($scope.objects.mapMarker instanceof googleMaps.Map).to.be.equal(true);
    expect($scope.objects.map === $scope.objects.mapMarker).to.be.equal(true);
    expect($scope.objects.marker instanceof googleMaps.Marker).to.be.equal(true);
    expect($scope.objects.infowindow instanceof googleMaps.InfoWindow).to.be.equal(true);
    expect($scope.objects.circle instanceof googleMaps.Circle).to.be.equal(true);
    expect($scope.objects.trafficLayer instanceof googleMaps.TrafficLayer).to.be.equal(true);
    expect($scope.objects.bicyclingLayer instanceof googleMaps.BicyclingLayer).to.be.equal(true);
    expect($scope.objects.transitLayer instanceof googleMaps.TransitLayer).to.be.equal(true);
    expect($scope.objects.rectangle instanceof googleMaps.Rectangle).to.be.equal(true);
    expect($scope.objects.groundOverlay instanceof googleMaps.GroundOverlay).to.be.equal(true);
    expect($scope.objects.kmlLayer instanceof googleMaps.KmlLayer).to.be.equal(true);
    expect($scope.objects.polygon instanceof googleMaps.Polygon).to.be.equal(true);
    expect($scope.objects.polyline instanceof googleMaps.Polyline).to.be.equal(true);
    expect($scope.objects.streetviewpanorama instanceof googleMaps.StreetViewPanorama).to.be.equal(true);

    // direction renderer
    setTimeout(function() {
      $rootScope.$digest();
      expect($scope.data.renderer).to.be.equal(1);
      expect($scope.objects.renderer instanceof googleMaps.DirectionsRenderer).to.be.equal(true);
      done();
    }, 10);

  });

});