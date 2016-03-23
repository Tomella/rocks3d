/// <reference path="../../../../typings/tsd.d.ts" />

module rocks3d.navigator {
'use strict';	

export interface NavigateScope extends ng.IScope {
	where: any;
}

angular.module('rocks3d.navigator', [])

.directive('rocks3dNavigate', ['rocks3dNavigatorService', 
		function(rocks3dNavigatorService: any) {
	return {
		restrict: 'AE',
		scope: {
			where: "="
		},
		link: function(scope: NavigateScope, element: ng.IAugmentedJQuery) {
			element.on('click', function() {
				rocks3dNavigatorService.navigate(scope.where);
			});
		}
	};
}])

.directive('rocks3dZoom', ['rocks3dNavigatorService', function(rocks3dNavigatorService: any) {
	return {
		restrict: 'AE',
		scope: {
			where: "="
		},
		link: function(scope: NavigateScope, element: ng.IAugmentedJQuery) {
			element.on('click', function() {
				rocks3dNavigatorService.zoom(scope.where);
			});
		}
	};
}])

.factory('rocks3dNavigatorService', ['$document', 'configService', function($document: ng.IDocumentService, configService: any) {
	var service: any = {};
	var data = configService.getConfig('particles');
	
	service.zoom = function(where: any) {
		var hash = data.getHash();
		var zoom = hash.zoom + 1;
		var x = hash.x * 2;
		var y = hash.y * 2;
		var doc: any = $document[0];
		
		if(where.x > 0) {
			x++;
		}
		if(where.y > 0) {
			y++;
		}
		data.setHash({x:x, y:y, zoom:zoom});
		doc.location = "?hash=" + data.createParameters();
		
	};
	
	service.to = function(xyz: any) {
		var doc: any = $document[0];
		
		data.setHash(xyz);
		doc.location = "?hash=" + data.createParameters();
	};
	
	service.navigate = function(delta: any) {
		var doc: any = $document[0];
		
		var hash = data.getHash();	
		var yes = navigateParent();
		if(!yes) {
			yes = navigateY();
			if(!yes) {
				navigateX();
			}
		}

		doc.location = "?hash=" + data.createParameters();
		
		function navigateY() {
			if(delta.y) {
				data.setHash({
					zoom: hash.zoom,
					x: hash.x,
					y: hash.y + delta.y
				});
				return true;
			}
			return false;
		}
		
		function navigateX() {
			if(delta.x) {
				data.setHash({
					zoom: hash.zoom,
					x: hash.x + delta.x,
					y: hash.y
				});
				return true;
			}
			return false;
		}
		
		function navigateParent() {
			if(delta.zoom == -1) {
				data.setHash({
					zoom: hash.zoom + delta.zoom,
					x: Math.floor(hash.x/2),
					y: Math.floor(hash.y/2)
				});
				return true;
			}
			return false;
		}		
		
		function valueOf(data: any, fallOver: any) {
			if(typeof data == "undefined") {
				return fallOver
			} 
			return data;
		}
	}
	return service;

}]);

}