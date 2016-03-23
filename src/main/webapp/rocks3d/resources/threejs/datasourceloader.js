(function(THREE) {
'use strict';

/**
 * A DataSurface .
 * 
 * We need this in the configuration:
 * The URL for the WCS elevation data. (Or any GeoTIFF source)
 * The URL for the WMS imagery data. (Or any transparent PNG source)
 * 
 */
THREE.DataSurfaceLoader = function (manager) {
	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
	this.config = {
		width: 100, 
		height: 100, 
		widthSegments: 199, 
		heightSegments: 199,
		surfaceOpacity: 1,
		transparent: true,
		scale: function(item) { 
			return item; // Default scale function. We expect metres but someone could plug something else in.
		}
	}
}

THREE.DataSurfaceLoader.prototype = {
	constructor: THREE.DataSurfaceLoader,
	
	load: function(elevationUrl, imageryUrl, onLoad, onProgress, onError) {
		this.imageryUrl = imageryUrl;
		var scope = this;
		var terrainLoader = new THREE.GeotiffTerrainLoader();
		
		terrainLoader.load(elevationUrl, function(loaded) {
			if(onProgress) {
				onProgress({
					terrainLoaded: loaded
				});
			}
			// Parse it and return
			onLoad(scope.parse(loaded));
			
			scope.manager.itemEnd(loaded);
		}, onProgress, onError);
		
		this.manager.itemStart( elevationUrl );
	},
	
	parse: function(data) {
		var scope = this;
		var config = this.config;
		
	    var loader = new THREE.TextureLoader();
	    loader.crossOrigin = '';

	    var material = new THREE.MeshPhongMaterial({
            map: loader.load(this.imageryUrl),
            transparent: config.transparent,
            opacity: config.surfaceOpacity
        });
	    
	    this.geometry = new THREE.PlaneGeometry(config.width, 	// — Width along the X axis.
	    		config.height,									// — Height along the Y axis.
	    		config.widthSegments, 
	    		config.heightSegments);
	    

	    this.geometry.vertices.forEach(function(vertice, i) {
	        vertice.z = scope.config.scale(data[i]);
	    });
	    
	    // We want some shadows
	    this.geometry.computeFaceNormals();
	    this.geometry.computeVertexNormals();
	    
	    this.plane = new THREE.Mesh(this.geometry, material);
	    // Make it flat
	    this.plane.rotation.x = -Math.PI / 2;
	    
	    return {
	    	plane: this.plane
	    };
	},
	
	setConfig: function(items) {
		if(items != null) {
			for (var key in items) {
				if (items.hasOwnProperty(key)) {
					this[key] = items[key];
				}
			}
		}
	}
}

function calcExtent(data) {
	if(!data) {
		return [];
	}
	// Arbitrary lows and highs
	var min = 10000000000, max = -min;
	data.forEach(function(val) {
		min = Math.min(min, val);
		max = Math.max(max, val);
	});
	return [min, max];
}

function isFunctionA(object) {
	 return object && getClass.call(object) == '[object Function]';
}

})(THREE)