/// <reference path="../../../../typings/tsd.d.ts" />

module rocks3d.cluster {
'use strict';	

angular.module('rocks3d.cluster', [])

.directive('rocks3dCluster', ['rocks3dClusterService', function(rocks3dClusterService: any) {
	return {
		link: function(scope: any) {
			rocks3dClusterService.init();
		}
	};
}])

.factory('rocks3dClusterService', ['$http', 'rocks3dMapService', 'rocks3dNavigatorService',
                                   function($http: ng.IHttpService, rocks3dMapService: any, rocks3dNavigatorService: any) {
	var url = "service/rocks/summary";
	var sequence = 0;
	var service:any = {};
	var busy = false;
	var layer: any;
	
	
	
	service.init = function() {
		rocks3dMapService.getMap().then(function(map: any) {
		    map.on('zoomend', movePan);

		    map.on('dragend', movePan);

		    function movePan(event: ng.IAngularEvent) {
		    	if(layer) {
		    		map.removeLayer(layer);
		    		layer = null;
		    	}
		    	
		    	var instanceSequence = ++sequence;
		    	var zoom = map.getZoom();
		    	var bounds = map.getBounds();
		    	var parms: string[] = [];
		    	parms.push("xmin=" + Math.max(bounds.getWest() - 20/zoom, -180)); + 
		    	parms.push("xmax=" + Math.min(bounds.getEast() + 20/zoom, 180));
		    	parms.push("ymin=" + Math.max(bounds.getSouth() - 10/zoom, -90));
		    	parms.push("ymax=" + Math.min(bounds.getNorth() + 10/zoom, 90)); 
		    	parms.push("zoom=" + (Math.max(zoom, 2)));
		    	
		    	var geojsonMarkerOptions = {
		    		    radius: 8,
		    		    fillColor: "#ff7800",
		    		    color: "#000",
		    		    weight: 1,
		    		    opacity: 1,
		    		    fillOpacity: 0.8
		    		};
		    	
		    	
		    	$http.get(url + "?" + parms.join("&")).then(function(result: any) {
		    		if(instanceSequence < sequence) {
		    			return;
		    		}
		    		var maxRadius = Math.sqrt(d3.max(result.data.features, function(item: any) {
		    			return item.properties.count;
		    		}));
		    		
		    		layer = L.geoJson(result.data, {
		    		    pointToLayer: function (feature: any, latlng: L.LatLng) {
		    		    	var geojsonMarkerOptions = {
		    		    	    radius: 4 + 20/maxRadius * Math.sqrt(feature.properties.count),
		    		    	    fillColor: "#ff7800",
		    		    	    color: "#000",
		    		    	    weight: 1,
		    		    	    opacity: 1,
		    		    	    fillOpacity: 0.8
		    		    	};
		    		        var marker = L.circleMarker(latlng, geojsonMarkerOptions)
		    		        	.bindLabel("" + feature.properties.count, { noHide: true });
		    		        
		    		        marker.on("click", function() {
		    		        	var id = this.feature.id.split("/");
		    		        	
		    		        	rocks3dNavigatorService.to({
		    		        		zoom: id[0],
		    		        		x: id[1],
		    		        		y: id[2]
		    		        	})
		    		        });
		    		        return marker;
		    		    }
		    		}).addTo(map);
		    	});
		    }			
		});
	}	
	return service;
}]);

}
