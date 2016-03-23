/// <reference path="../../../../typings/tsd.d.ts" />
/// <reference path="../config/config.ts" />

module rocks3d.surface {
'use strict';	


angular.module('rocks3d.surface', [])

.directive("rocks3dSurface", ['rocks3dSurfaceService', function(rocks3dSurfaceService: any) {
	return {
		link: function(scope: ng.IScope) {
			//rocks3dSurfaceService.prime();
		}
	};
}])

.factory('rocks3dSurfaceService', ['$q', '$rootScope', '$timeout', 'configService',  
                function($q: ng. IQService, $rootScope: ng.IRootScopeService, $timeout: ng.ITimeoutService, configService: rocks3d.config.IConfigService) {
	
	var METRES_PER_DEGREE = 111000;
	var service: any = {};
	var geometry: THREE.Geometry, plane: any;
	var lastData: any;
	var config = configService.getConfig("surface");
	var state: any = {};
	var heightData: number[];
	var tileInfo: any;
	var sceneProperties: any;
	
	service.data = function() {
		return state;
	};
	
	service.prime = function(tile: any) {
		tileInfo = tile;
		var deferred = $q.defer();

		var wcs1sec = config.elevation1SecUrl;	
		wcs1sec = wcs1sec.replace(/\{resolution\}/g, config.resolution);
		wcs1sec = wcs1sec.replace("{bbox}", tile.bbox);
		
		var terrainLoader = new THREE.GeotiffTerrainLoader();	
		terrainLoader.load(wcs1sec, function(loaded: number[]) {
			heightData = loaded;
			deferred.resolve(loaded);
		});
		return deferred.promise;
	};
	
	service.checkElevation = function(xy: any) {
		var raycaster = new THREE.Raycaster();
		var state = sceneProperties;
		raycaster.setFromCamera( xy, state.camera );
		var intersects = raycaster.intersectObject( plane, true );
		
		if ( intersects.length > 0 ) {
			console.log("Intersects");
			console.log(plane);
			console.log(intersects[0]);
		}
	};
	
	service.render = function(data: any, properties:any): any {
		sceneProperties = properties;
		lastData = data;
		var loaded = data.loaded;
		var yCen = data.extents.yCen;
		
		if(tileInfo.properties.hash.z < 4) {
			return false;
		}
		var bbox = toBbox(tileInfo.bbox);
		
		var baseUrl = config.imageryUrls.national.url;
		
		//Lets see if we can use the NSW imagery.
		var extents = data.extents;
		var nswExtent = config.imageryUrls.nsw.extent;
		if(extents.xMin > nswExtent.xmin && extents.xMax < nswExtent.xmax  &&
				extents.zMin > nswExtent.ymin && extents.zMax < nswExtent.ymax) {
			baseUrl = config.imageryUrls.nsw.url;
		}
	    
	    var loader = new THREE.TextureLoader();
	    loader.crossOrigin = '';
	    var material = new THREE.MeshPhongMaterial({
            map: loader.load(baseUrl.replace("{bbox}", bbox)),
            transparent:true,
            opacity:config.surfaceOpacity
        });
	    
	    $timeout(function() { state.surface = material; });
	    
	    geometry = new THREE.PlaneGeometry(100, 100, 199, 199);

	    plane = new THREE.Mesh(geometry, material);
		    
	    plane.rotation.x = -Math.PI / 2;
		    
	    geometry.vertices.forEach(function(vertice, i) {
	        vertice.z = sceneProperties.scale.y(heightData[i]);
	    });
	    geometry.computeFaceNormals();
	    geometry.computeVertexNormals();
	    //plane.scale.z = 1/10; //-heightCalc(1);
	    sceneProperties.container.add(plane);
	    
	    return {
	    	plane: plane	    	
	    };
	};
	
	return service;
	
	function matchPoints(tileInfo: any) {
		var z = tileInfo.properties.hash.z;
		var extentX = tileInfo.extent.x;
		var result = 80/((extentX[1] - extentX[0]) * METRES_PER_DEGREE) +
						(10 - z) * 0.001;
		return result;
	}

	function toBbox(bboxArr: number[]) {
		return bboxArr[0] + "," +
		bboxArr[1] + "," +
		bboxArr[2] + "," +
		bboxArr[3];
	}
}]);


}