/// <reference path="../../../../typings/tsd.d.ts" />

module rocks3d.particles {
'use strict';	


angular.module('rocks3d.particles', [])

.directive("rocks3dParticles", ['rocks3dParticlesService', function(rocks3dParticlesService: any) {
	return {
		link: function(scope: ng.IScope, element: ng.IAugmentedJQuery) {
			rocks3dParticlesService.init(element[0]);
		}
	};
}])

// We use this for static views
.controller('rocks3dParticlesCtrl', ['rocks3dParticlesService', function(rocks3dParticlesService: any) {
	this.data = rocks3dParticlesService.data();
}])

.factory('rocks3dParticlesService', 
		['$location', '$q', '$rootScope', '$timeout', 'configService', 'rocks3dMessageService', 'rocks3dSurfaceService',
		 function($location: ng.ILocationService, $q: ng.IQService, $rootScope: ng.IRootScopeService, $timeout: ng.ITimeoutService, 
		 		configService: any, rocks3dMessageService: any, rocks3dSurfaceService: any) {
	const LENGTH_DEGREE = 111320; 
    var service: any = {};
	var config = configService.getConfig('particles');
	var data: any = {};
	var state: any = {
		data: data
	};	

	var w: number, h: number, scatterPlot: THREE.Object3D, format: any, unfiltered: any[], objects: any, resizer: any;
	
	bootstrap();	

	service.scene = function() {
		return state;
	};

	service.data = function() {
		return data;
	};
	
	service.init = function(element: any) {
		var rect = element.getBoundingClientRect();
		w = rect.width;
		h = rect.height;

		state.renderer = new THREE.WebGLRenderer({
			antialias : true
		});

		state.renderer.setSize(w, h);
		element.appendChild(state.renderer.domElement);

		state.renderer.setClearColor(0xffffff, 1.0);
		
		state.camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000);
		state.camera.position.z = 200;
		state.camera.position.x = -100;
		state.camera.position.y = 100;
		
		state.scene = new THREE.Scene();
		
		resizer = THREEExt.WindowResize(state.renderer, state.camera, element);

		scatterPlot = state.container = new THREE.Object3D();
		state.scene.add(scatterPlot);

		scatterPlot.rotation.y = 0;

		unfiltered = [];

		format = d3.format("+.5f");
		
		
		d3.json(config.createTileInfo(), function(d: any) {
			$timeout(function() {
				data.tileInfo = d;
				$rootScope.$broadcast(config.onloadEventName, d);
			});
			
			var hash = d.properties.hash;
			
			config.hash = hash.z + "/" + hash.x + "/" + hash.y;
			
			d.extent = {
				x: [d.bbox[0], d.bbox[2]],
				y: [d.bbox[1], d.bbox[3]]
			}	
			load(d);
		});
		addLights(state.scene);
	};
	
	return service;
	
	
	function addLights(scene: THREE.Scene) {
		state.scene.add(new THREE.AmbientLight(0x333333));

		var light = new THREE.DirectionalLight( 0xffffff);
		light.position.set( 100, 500, 0);
		state.scene.add( light );
	}

	function load(tile: any) {
		var zoom = tile.properties.hash.z;
		
		console.log(config.createFeatures());
		
		$q.all([rocks3dSurfaceService.prime(tile), (function() {
			var deferred = $q.defer();
			d3.json(config.createFeatures(), function(d) {
				deferred.resolve(d);
			});
			return deferred.promise;
		})()]).then(function(allData: any) {
			var heightData = allData[0];
			var heightExtent = d3.extent(heightData);
			var d = allData[1];

			$timeout(function() {
				data.loaded = d;
			});
			if(!d.totalFeatures) {
				rocks3dMessageService.message("There are no features in the selected area.");
			} else if(d.features.length < d.totalFeatures) {
				rocks3dMessageService.message("Only showing " + d.features.length + " of " + d.totalFeatures + ", refine your search area");
			}
			d.features.forEach(function(feature: GeoJSON.Feature, i: number) {
				var properties = feature.properties;
				var x = properties.SAMPLE_LONGITUDE;
				var y = properties.SAMPLE_ELEVATION;
				var z = properties.SAMPLE_LATITUDE
				
				var d = {
					x : typeof x != "undefined"?x:feature.geometry.coordinates[0],
					y : typeof y != "undefined"?y:feature.geometry.coordinates[2],
					z : typeof z != "undefined"?z:feature.geometry.coordinates[1]
				};
				
				d.y = d.y ? d.y : 0;
				unfiltered[i] = {
					x : +d.x,
					y : +d.y,
					z : +d.z
				};
			});

			var xExtent = tile.extent.x;
			var yExtent = d3.extent(unfiltered, function(d: any) {
				return d.y;
			});
			var zExtent = tile.extent.y;

			yExtent = [
			    Math.min(yExtent[0]?yExtent[0]:0, heightExtent[0]),
			    Math.max(yExtent[1]?yExtent[1]:0, heightExtent[1])
			];
			
			var vpts: any = data.extents = {
				xMax : xExtent[1],
				xCen : (xExtent[1] + xExtent[0]) / 2,
				xMin : xExtent[0],
				yMax : yExtent[1],
				yCen : (yExtent[1] + yExtent[0]) / 2,
				yMin : yExtent[0],
				zMax : zExtent[1],
				zCen : (zExtent[1] + zExtent[0]) / 2,
				zMin : zExtent[0],
				aspectRatio: Math.cos(Math.PI/180 * (zExtent[1] + zExtent[0]) / 2)
			};
			vpts.length = (vpts.zMax - vpts.zMin) * LENGTH_DEGREE; // Just a rough enough guess for what we want.
			vpts.width = vpts.length * vpts.aspectRatio;
			vpts.height = vpts.yMax - vpts.yMin;
			
			var colour = d3.scale.category20c();

			state.scale = {
				x: d3.scale.linear().domain(xExtent).range([ -50, 50 ]),
				y: d3.scale.linear().domain(yExtent).range([ -50, 50 ]),
				z: d3.scale.linear().domain(zExtent).range([ 50, -50 ])
			};
		
			var lineGeo = getLineGeo(vpts, state.scale);
			var lineMat = new THREE.LineBasicMaterial({
				color : 0x000000
			});
			lineMat.transparent = true;
			lineMat.opacity = 0.3;
			var line = new THREE.Line(lineGeo, lineMat);
			scatterPlot.add(line);
		
			var titleX = createText2D('-X');
			titleX.position.x = state.scale.x(vpts.xMin) - 12, titleX.position.y = 5;
			scatterPlot.add(titleX);
		
			var valueX = createText2D(format(xExtent[0]));
			valueX.position.x = state.scale.x(vpts.xMin) - 12, valueX.position.y = -5;
			scatterPlot.add(valueX);
		
			var titleX = createText2D('X');
			titleX.position.x = state.scale.x(vpts.xMax) + 12;
			titleX.position.y = 5;
			scatterPlot.add(titleX);
		
			var valueX = createText2D(format(xExtent[1]));
			valueX.position.x = state.scale.x(vpts.xMax) + 12, valueX.position.y = -5;
			scatterPlot.add(valueX);
		
			var titleY = createText2D('-Z');
			titleY.position.y = state.scale.y(vpts.yMin) - 5;
			scatterPlot.add(titleY);
		
			var valueY = createText2D(format(yExtent[0]));
			valueY.position.y = state.scale.y(vpts.yMin) - 15, scatterPlot.add(valueY);

			var titleY = createText2D('Z');
			titleY.position.y = state.scale.y(vpts.yMax) + 30;
			scatterPlot.add(titleY);
		
			var valueY = createText2D(format(yExtent[1]));
			valueY.position.y = state.scale.y(vpts.yMax) + 20, scatterPlot.add(valueY);
		
			var titleZ = createText2D('-Y ' + format(zExtent[0]));
			titleZ.position.z = state.scale.z(vpts.zMin) + 2;
			scatterPlot.add(titleZ);
		
			var titleZ = createText2D('Y ' + format(zExtent[1]));
			titleZ.position.z = state.scale.z(vpts.zMax) + 2;
			scatterPlot.add(titleZ);
		
			var mat = new THREE.PointsMaterial({
				vertexColors : THREE.VertexColors,
				size : 10
			});

			var pointCount = unfiltered.length;
			objects = [];
			var pointGeo = new THREE.Geometry();
			for (var i = 0; i < pointCount; i++) {
				var x = state.scale.x(unfiltered[i].x);
				var y = state.scale.y(unfiltered[i].y);
				var z = state.scale.z(unfiltered[i].z);
				var p = new THREE.Vector3(x, y, z);
				objects.push(p);
				pointGeo.vertices.push(p);
				
				pointGeo.colors.push(new THREE.Color().setRGB(
						hexToRgb(colour(""+i)).r / 255, hexToRgb(colour(""+i)).g / 255,
						hexToRgb(colour(""+i)).b / 255));
		
			}
			if(pointCount > 0) {
				pointGeo.computeBoundingSphere();
				if(pointGeo.boundingSphere.radius < 5) {
					console.log("Overriding bounding sphere radius" + pointGeo.boundingSphere.radius);
					pointGeo.boundingSphere.radius = 5;
				}
			} 
			var points = objects = new THREE.Points(pointGeo, mat);
			scatterPlot.add(points);

			state.renderer.render(state.scene, state.camera);

			data.loaded = d;
			scatterPlot.scale.x = scatterPlot.scale.x * vpts.aspectRatio;
			rocks3dSurfaceService.render(data, state);			
			
			var last = new Date().getTime();
			var down = false;
			var sx = 0, sy = 0;
		
			state.renderer.domElement.onmousedown = function(ev: MouseEvent) {
				var rect = state.renderer.domElement.getBoundingClientRect();
				down = true;
				sx = ev.clientX;
				sy = ev.clientY;
				var mouse = new THREE.Vector2();

				mouse.x = ( (ev.clientX - rect.left) / state.renderer.domElement.clientWidth ) * 2 - 1;
				mouse.y = - ( (ev.clientY - rect.top) / state.renderer.domElement.clientHeight ) * 2 + 1;

				$rootScope.$broadcast(config.rendererSelectEventName, mouse);
			};
			
			state.renderer.domElement.onmouseup = function() {
				down = false;
			};
			
			var raycaster = new THREE.Raycaster();
			
			state.renderer.domElement.onmousemove = function( event: MouseEvent) {
				var feature: any;
				var rect = state.renderer.domElement.getBoundingClientRect();
				var mouse = new THREE.Vector2();
				event.preventDefault();

				mouse.x = ( (event.clientX - rect.left) / state.renderer.domElement.clientWidth ) * 2 - 1;
				mouse.y = - ( (event.clientY - rect.top) / state.renderer.domElement.clientHeight ) * 2 + 1;

				raycaster.setFromCamera( mouse, state.camera );

				var intersects = raycaster.intersectObject( points, true );

				if ( intersects.length > 0 ) {
					feature = d.features[intersects[0].index];
					$rootScope.$broadcast(config.onhoverEventName, decorateHtml(feature));
				}
				
				function decorateHtml(feature: GeoJSON.Feature) {
					var html: string, br: string;
					var properties = feature.properties;
					
					if(properties && !properties.html) {
						html = "<div class='popup-header'><strong>ID: </strong><a class='title-link' target='_blank' href='" +
						config.dataUrl.replace("{id}", feature.id) + "'>" + feature.id + "</a></div>Lon/lat elev: " +
							feature.geometry.coordinates[0].toFixed(6) + "/" + 
							feature.geometry.coordinates[1].toFixed(6) + 
							" " + (typeof feature.geometry.coordinates[2] == "undefined"?"-":feature.geometry.coordinates[2]);
						
						br = "<br/>";
						
						for (var property in properties) {
						    if (properties.hasOwnProperty(property)) {
						        html += br + property + "<br/>&#160;" + properties[property];
						    }
						}
						properties.html = html;
					}
					return feature;
				}
		    }
			// Get the loop going. 
			var controls = new THREE.OrbitControls( state.camera, state.renderer.domElement );
			
			animate();
			function animate() {
				window.requestAnimationFrame(animate);
				
				state.renderer.clear();
				state.camera.lookAt(state.scene.position);
				state.renderer.render(state.scene, state.camera);
				controls.update();
			}
		});
	}
	
	function getLineGeo(vpts: any, scale: any) {
		var xScale = scale.x; 
		var yScale = scale.y;
		var zScale = scale.z;
		
		var lineGeo = new THREE.Geometry();
		lineGeo.vertices.push(
		    v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMin)),
		    v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMax)),
		    v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMax)),
		    v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMin)),
		    v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMin)),
		    v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMax)),
		    v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMax)),
		    v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMin)),
		    v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMin)),
		    v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zMin)),
		    v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zCen)),
		    v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zCen)),
		    v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zCen)),
		    v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zCen)),
		    v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zCen)),
		    v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zCen)),
		    v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zCen)),
		    v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zMax)),
		    v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zMax)),
		    v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zMax)),
		    v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zMin)),
		    v(xScale(vpts.xMin), yScale(vpts.yCen), zScale(vpts.zMin)),
		    v(xScale(vpts.xMin), yScale(vpts.yCen), zScale(vpts.zMax)),
		    v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zMax)),
		    v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zMin)),
		    v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zMin)),
		    v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zMin)),
		    v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zMax)),
		    v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMax)),
		    v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMax)),
		    v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMin)),
		    v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zMin)),
		    v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zMax)),
		    v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zMax)),
		    v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zMax)),
		    v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMax)),
		    v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMax)),
		    v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zCen)),
		    v(xScale(vpts.xMin), yScale(vpts.yCen), zScale(vpts.zCen)),
		    v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zCen)),
		    v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zMax)),
		    v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMax)),
		    v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMax)),
		    v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMin)),
		    v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMin))
		);
		return lineGeo;
	}

	function v(x: number, y: number, z: number) {
		return new THREE.Vector3(x, y, z);
	}

	function createTextCanvas(text: any, color?: any, font?: any, size?: any) {
		size = size || 16;
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		var fontStr = (size + 'px ') + (font || 'Arial');
		ctx.font = fontStr;
		var w = ctx.measureText(text).width;
		var h = Math.ceil(size);
		canvas.width = w;
		canvas.height = h;
		ctx.font = fontStr;
		ctx.fillStyle = color || 'black';
		ctx.fillText(text, 0, Math.ceil(size * 0.8));
		return canvas;
	}

	function createText2D(text: any, color?: any, font?: any, size?: any, segW?: any, segH?: any) {
		var canvas = createTextCanvas(text, color, font, size);
		var plane = new THREE.PlaneGeometry(canvas.width, canvas.height, segW, segH);
		var tex = new THREE.Texture(canvas);
		tex.needsUpdate = true;
		var planeMat = new THREE.MeshBasicMaterial({
			map : tex,
			color : 0xffffff,
			transparent : true
		});
		var mesh = new THREE.Mesh(plane, planeMat);
		mesh.scale.set(0.5, 0.5, 0.5);
		return mesh;
	}

	// from http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
	function hexToRgb(hex: any) { // TODO rewrite with vector output
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r : parseInt(result[1], 16),
			g : parseInt(result[2], 16),
			b : parseInt(result[3], 16)
		} : null;
	}
	
	function bootstrap() {		
		var search = $location.search();
		var setter = conditional(search);
		// The function setter returns itself so you can call ad infinitum
		setter('x')('y')('zoom')('hash')('filter');
		
		
		// Set up some helper functions
		config.createTileInfo = function() {
			if(this.hash) {
				return this.url + "tileInfo" + (this.hash.indexOf("/") != 0?"/":"") + this.hash;
			}
			return this.url + "tileInfo?" + this.createPointParameters();
		};
		
		config.createFeatures = function() {
			return this.url + "features" + this.createParameters();
		};
		
		config.createParameters = function() {
			if(this.hash) {
				return "/" + this.hash + "?maxCount=" + this.maxCount + createFilters(this.filter).join("");
			}
			return "?" + this.createPointParameters() + "&maxCount=" + this.maxCount + createFilters(this.filter).join("");
		}
		
		config.createPointParameters = function() {
			return "x=" + this.x +
				"&y=" + this.y + 
				"&zoom=" + this.zoom;
		};
		
		config.setHash = function(xyzoom: any) {
			this.hash = xyzoom.zoom + "/" + xyzoom.x + "/" + xyzoom.y;
		};
		
		config.getHash = function() {
			var index = 0;
			var parts = this.hash.split("/");
			if(parts.length == 4) {
				index = 1;
			}
			return {
				zoom: parseInt(parts[index++]),
				x: parseFloat(parts[index++]),
				y: parseFloat(parts[index])
			};		
		};
		
		function createFilters(filterArr: any) {
			var filters: any[] = [];

			if(filterArr) {
				if(angular.isArray(filterArr)) {
					filters = filterArr.map(function(filter: any) {
						return "&filter=" + encodeURIComponent(filter);
					});
				} else {
					filters = ["&filter=" + encodeURIComponent(filterArr)]; 
				}
				
			}
			return filters;
		}
		
		function conditional(search: any) {
			var set: Function = function set(key: string) {
				var value = search[key];
				if(typeof value != "undefined") {
					config[key] = value;
				}
				return set;
			};
			return set;
		}
	}
}]);


}