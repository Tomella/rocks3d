/// <reference path="../../../../typings/tsd.d.ts" />

module rocks3d.message {
'use strict';	

angular.module('rocks3d.message', [])

.factory('rocks3dMessageService', ['$timeout', function($timeout: ng.ITimeoutService) {
	var messageTimer: any;
	var service: any = {};
	
	service.message = function(text: string) {
		var messageArea = document.getElementById("message-details");
		
		if(messageTimer) {
			messageTimer();
			messageTimer = null;
		}
		
		messageArea.innerHTML = text;
		messageArea.style.display = "inline-block";
		
		messageTimer = $timeout(function() {
			messageArea.style.display = "none";
		}, 12000);	
	};
	
	return service;
}]);

}