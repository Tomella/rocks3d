/// <reference path="../../../../typings/tsd.d.ts" />

module rocks3d.view {
'use strict';	

interface VerticalExagerateScope extends ng.IScope {
	index: number;
	range: any;
	smaller: Function;
	larger: Function;
	oneToOne: Function;
}

interface SurfaceOpacityScope extends ng.IScope {
	data: any;
}

angular.module('rocks3d.view', [])

.directive("rocks3dView", [function() {
	return {
		templateUrl: "rocks3d/view/view.html"
	};
}])
	
.directive("rocks3dSurfaceOpacity", [function() {
	return {
		templateUrl: "rocks3d/view/surfaceopacity.html",
		link: function(scope: ng.IScope, element: ng.IAugmentedJQuery) {}
	};
}])
	
.directive("rocks3dVerticalExaggerate", ['rocks3dParticlesService', function(rocks3dParticlesService: any) {	
	var range = [0.0001, 0.0002, 0.0005, 0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 
	             0.1, 0.2, 0.5, 1];
	return {
		templateUrl: 'rocks3d/view/verticalexaggerate.html',
		scope: {
			direction: "="
		},
		link: function(scope: VerticalExagerateScope, element: ng.IAugmentedJQuery) {
			scope.index = 12;
			scope.range = range;
			scope.smaller = function() {
				scope.index--;
				change();
			};
			scope.larger = function() {
				scope.index++;
				change();
			};
			
			scope.oneToOne = function() {
				var props = rocks3dParticlesService.scene();
				var dimensions = props.data.extents;
				var length = dimensions.length;
				var height = dimensions.height;
				var ratio = height/length;
				props.container.scale.y = ratio;
				
			};
			
			function change() {
				var props = rocks3dParticlesService.scene();
				var scale = props.container.scale;
				scale.y = range[scope.index];
				scale.z = 1 - (scope.index - 12) * 0.1;
				scale.x = props.data.extents.aspectRatio * (1 - (scope.index - 12) * 0.1);
			}
		}
	};
}])

.directive("rocks3dSurfaceOpacity", ['rocks3dSurfaceService', function(rocks3dSurfaceService: any) {
	return {
		link: function(scope: SurfaceOpacityScope) {
			scope.data = rocks3dSurfaceService.data();
		}
	};
}]);

}