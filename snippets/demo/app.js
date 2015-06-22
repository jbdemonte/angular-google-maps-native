angular.module('MyApp', ['GoogleMapsNative'])

  /* Not required */
  .config(function(gmLibraryProvider) {
    gmLibraryProvider.configure({
      language: 'fr'
    });
  })

;