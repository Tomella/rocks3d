/// <reference path="../../../../typings/tsd.d.ts" />

'use strict';

module rocks3dApp {
	
angular.module("Rocks3dApp", [
   'rocks3d.cluster',
   'rocks3d.config',
   'rocks3d.map',
   'rocks3d.message',
   'rocks3d.multisurface',
   'rocks3d.navigator',
   'rocks3d.particles',
   //'rocks3d.surface',
   'rocks3d.templates',
   'rocks3d.view'
]).config(['$locationProvider', function($locationProvider: ng.ILocationProvider) {
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
      });
}]);

}