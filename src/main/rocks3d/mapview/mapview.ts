/// <reference path="../../../../typings/tsd.d.ts" />
/// <reference path="../config/config.ts" />

module rocks3d.mapview {
'use strict';

angular.module('rocks3d.map', []).directive("rocks3dMap", ['rocks3dMapService', function(rocks3dMapService: any) {
	return {
		restrict: 'AE',
		link: function(scope: ng.IScope, element: any, attrs: ng.IAttributes) {
			rocks3dMapService.createMap(attrs["id"]);
		}
	};
}])

.factory('rocks3dMapService', ['$document', '$q', '$rootScope', 'configService', 
                      function($document: ng.IDocumentService, $q: ng.IQService, $rootScope: ng.IRootScopeService, configService: rocks3d.config.IConfigService) {
	var map: L.Map, poly: any, marker: any;
	var service: any = {};
    var config = configService.getConfig('mapConfig');
    var waiters: ng.IDeferred<any>[] = [];
	
    service.getMap = function() {
    	var deferred: ng.IDeferred<any>;
    	if(map) {
    		return $q.when(map);
    	} else {
    		deferred = $q.defer();
    		waiters.push(deferred);
    		return deferred.promise;
    	}
    };
    
	service.createMap = function(element: any) {
		map = new L.Map(element, {center: config.options.center, zoom: config.options.zoom});
		addLayer(config.layer, map);

		L.control.scale({imperial:false}).addTo(map);
		L.control.mousePosition({
			position:"bottomright", 
			emptyString:"",
			seperator : " ",
			latFormatter : function(lat: number) {
				return "Lat " + L.Util.formatNum(lat, 5) + "°";
			},
			lngFormatter : function(lng: number) {
				return "Lng " + L.Util.formatNum(lng, 5) + "°";
			}
		}).addTo(map);

		if(config.listenForExtentEvent) {
			$rootScope.$on(config.listenForExtentEvent, function showBbox(event: any, geojson: GeoJSON.Feature) {	
				// It's a GeoJSON Polygon geometry and it has a single ring.
				service.getMap().then(function() {
					makePoly(geojson);				
				});
			});			
		}

		if(config.listenForMarkerEvent) {
			$rootScope.$on(config.listenForMarkerEvent, function showBbox(event, geojson) {	
				// It's a GeoJSON Polygon geometry and it has a single ring.
				service.getMap().then(function() {
					makeMarker(geojson);					
				});
			});			
		}

		if(waiters) {
			waiters.forEach(function(prom) {
				prom.resolve(map);
			});
			waiters = null;
		}
		function makeMarker(data: any) {
			var point: any;
			if(typeof data.properties.SAMPLE_LONGITUDE != "undefined") {
				point= {
					type: "Point",
					coordinates: [
						data.properties.SAMPLE_LONGITUDE,
						data.properties.SAMPLE_LATITUDE
					]
				};
			} else {
				point = data.geometry;
			}
			if(marker) {
				map.removeLayer(marker);
			}
			marker = L.geoJson({
				type:"Feature",
				geometry: point,
				id: data.id
			}).addTo(map);
			if(data.properties.html) {
				marker.bindPopup(data.properties.html).openPopup();
			}
		}
		
		function makePoly(data: GeoJSON.Feature) {
			if(poly) {
				map.removeLayer(poly);
			}
			poly = L.geoJson(data).addTo(map);
			
			map.fitBounds(poly.getBounds(), {
				animate: true,
				padding: L.point(100,100)
			})
		}

		function clip(num: number, min: number, max: number) {
			return Math.min(Math.max(num, min), max);
		}		
	};
   
	return service;
	
	function addLayer(layer: any, map: L.Map) {
		var leafLayer = expandLayer(layer);
		map.addLayer(leafLayer);		
	}
	
	function expandLayer(data: any) {
		var Clazz: any = [];
		if(angular.isArray(data.type)) {
			Clazz = L;
			data.type.forEach(function(type: any) {
				Clazz = Clazz[type];
			});
		} else {
			Clazz = L[data.type];
		}
		if(data.parameters && data.parameters.length > 0) {
			return new Clazz(data.parameters[0], data.parameters[1], data.parameters[2], data.parameters[3], data.parameters[4]);
		} 
		return new Clazz();
	}
}]);
	
}