/**
 * @author Larry Hill 
 */
THREE.GeotiffTerrainLoader = function ( manager ) {
	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
};

THREE.GeotiffTerrainLoader.prototype = {
	constructor: THREE.GeotiffTerrainLoader,
	load: function ( url, onLoad, onProgress, onError ) {
		var scope = this;
		var request = new XMLHttpRequest();

		if ( onLoad !== undefined ) {
			request.addEventListener( 'load', function ( event ) {
				var parser = new GeotiffParser();
				parser.parseHeader(event.target.response);
				var data = parser.loadPixels();
				onLoad(data);
				
				scope.manager.itemEnd( url );
			}, false );
		}

		if ( onProgress !== undefined ) {
			request.addEventListener( 'progress', function ( event ) {
				onProgress( event );
			}, false );
		}

		if ( onError !== undefined ) {
			request.addEventListener( 'error', function ( event ) {
				onError( event );
			}, false );
		}

		if ( this.crossOrigin !== undefined ) {
			request.crossOrigin = this.crossOrigin;
		}

		request.open( 'GET', url, true );
		request.responseType = 'arraybuffer';
		request.send( null );
		scope.manager.itemStart( url );
	},

	setCrossOrigin: function ( value ) {
		this.crossOrigin = value;
	}
};