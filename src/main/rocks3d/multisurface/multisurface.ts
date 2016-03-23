/// <reference path="../../../../typings/tsd.d.ts" />
/// <reference path="../config/config.ts" />

'use strict';

module rocks3d.multisurface {
'use strict';

angular.module('rocks3d.multisurface', [])

.directive("rocks3dSurface", ['rocks3dSurfaceService', function(rocks3dSurfaceService: any) {
	return {
		link: function(scope: ng.IScope) {
			//rocks3dSurfaceService.prime();
		}
	};
}])

.provider('rocks3dSurfaceService', [function() {	
	var metadataLocation = "rocks3d/resources/config/surfaces.json";
	var metadata: any = null;
	
	this.location = function(url: string) {
		metadataLocation = url;
	}	
	
	var METRES_PER_DEGREE = 111000;
	var geometry: any, plane: any;
	var lastData: any;
	var state: any = {};
	var heightData: number[];
	var tileInfo: any;
	var sceneProperties: any;
	var waiters: ng.IDeferred<any>[] = null;
	
	
	this.$get = ['$http', '$q', '$rootScope', '$timeout', 'configService', 
			function($http: ng.IHttpService, $q: ng.IQService, $rootScope: ng.IRootScopeService, $timeout: ng.ITimeoutService, configService: rocks3d.config.IConfigService) {		
		var service: any = {};
		var config = configService.getConfig("surface");
		
		service.getMetadata = function() {
			if(metadata) {
				return $q.when(metadata);
			}
			
			var deferred = $q.defer();
			if(!waiters) {
				waiters = [deferred];
				$http.get(metadataLocation, {cache: true}).then(function(response) {
					metadata = response.data;
					waiters.forEach(function(waiter) {
						waiter.resolve(metadata);
					});					
				});
			} else {
				waiters.push(deferred);
			}
			return deferred.promise;
		};

		service.data = function() {
			return state;
		};
		
		service.prime = function(tile: any) {
			var deferred = $q.defer();
			
			var planes: any[] = [];
			service.getMetadata().then(function(metadata: any) {
				var t = tile;
				metadata.features.forEach(function(item: any) {
					var urls = item.properties.urlTemplates;
					if(item.properties.show) {
						var loader = new THREE.DataSurfaceLoader();
						loader.load(
							transformUrl(urls.elevation, tile, config.resolution),
							transformUrl(urls.imagery, tile, config.resolution),
							loaded
						)
					}
				})
			});
			return deferred.promise;
			
			function loaded(data: any) {
				console.log("Tadah!");
				console.log(data);
			}
			
		};
		
		
		return service;
	}];
}]);

function transformUrl(url: string, tile: any, resolution: number) {
	return url.replace(/\{resolution\}/g, ""+resolution).replace("{bbox}", tile.bbox);
}

}