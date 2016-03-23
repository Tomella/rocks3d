/// <reference path="../../../../typings/tsd.d.ts" />

module rocks3d.config {
'use strict';

var context: any = {};

context.surface = {
	resolution: 200,
	elevation1SecUrl_delayed: "http://services.ga.gov.au/gis/services/DEM_SRTM_1Second_Hydro_Enforced/MapServer/WCSServer" +
		"?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&coverage=1&CRS=EPSG:4326" +
		//"&BBOX={xmin},{ymin},{xmax},{ymax}" +
		"&BBOX={bbox}" + 
		"&FORMAT=GeoTIFF&RESX={resolution}" + 
		"&RESY={resolution}&RESPONSE_CRS=EPSG:4326" +
		"&HEIGHT={resolution}&WIDTH={resolution}",
	//elevationBrowseUrl: "http://services.ga.gov.au/gis/services/Browse_Basin_Bathymetry_2014_GA0345_GA0346_TAN1411/MapServer/WCSServer" +
	elevation1SecUrl: "/arcgis/services/Great_Artesian_Basin_groundwater/MapServer/WCSServer" +
			"?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&coverage=1&CRS=EPSG:4326" +
			//"&BBOX={xmin},{ymin},{xmax},{ymax}" +
			"&BBOX={bbox}" + 
			"&FORMAT=GeoTIFF&RESX={resolution}" + 
			"&RESY={resolution}&RESPONSE_CRS=EPSG:4326" + 
			"&HEIGHT={resolution}&WIDTH={resolution}",
	elevationBandannaUrl: "http://win-amap-test01:6080/arcgis/services/Bandanna_Top_Galilee_groundwater/MapServer/WCSServer" +
		"?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&coverage=1&CRS=EPSG:4326" +
		//"&BBOX={xmin},{ymin},{xmax},{ymax}" +
		"&BBOX={bbox}" + 
		"&FORMAT=GeoTIFF&RESX={resolution}" + 
		"&RESY={resolution}&RESPONSE_CRS=EPSG:4326" +
		"&HEIGHT={resolution}&WIDTH={resolution}",
	elevation1SecSmoothedUrl: "http://www.ga.gov.au/gisimg/services/topography/dem_s_1s/ImageServer/WCSServer" +
		"?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&coverage=1&CRS=EPSG:4326" +
		//"&BBOX={xmin},{ymin},{xmax},{ymax}" +
		"&BBOX={bbox}" + 
		"&FORMAT=GeoTIFF&RESX={resolution}" + 
		"&RESY={resolution}&RESPONSE_CRS=EPSG:4326" +
		"&HEIGHT={resolution}&WIDTH={resolution}",
	elevation5MUrl: "http://services.ga.gov.au/gis/services/DEM_LiDAR_5m/MapServer/WCSServer" +
		"?SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&coverage=1&CRS=EPSG:4326" +
		//"&BBOX={xmin},{ymin},{xmax},{ymax}" +
		//"&BBOX={xmin},{ymin},{xmax},{ymax}" +
		"&BBOX={bbox}" + 
		"&FORMAT=GeoTIFF&RESX={resolution}" + 
		"&RESY={resolution}&RESPONSE_CRS=EPSG:4326" +
		"&HEIGHT={resolution}&WIDTH={resolution}",
	imageryUrls: {
		national: {
			// url: "http://www.ga.gov.au/gisimg/services/topography/World_Bathymetry_Image_WM/MapServer/" +
			url: "http://win-amap-test01:6080/arcgis/services/Great_Artesian_Basin_groundwater/MapServer/WMSServer" +
				"?LAYERS=0" +
				"&TRANSPARENT=TRUE" +
				"&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=" +
				"&FORMAT=image%2Fpng" +
				"&SRS=EPSG%3A4326" +
				"&BBOX={bbox}" + // Tassie 140,-46,150,-37
				"&WIDTH=512&HEIGHT=512"				
		},
		nsw: {
			url: "http://maps.six.nsw.gov.au/arcgis/services/public/NSW_Imagery/MapServer/WMSServer" +
				"?LAYERS=BestImageryDates" +
				"&TRANSPARENT=TRUE" +
				"&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=" +
				"&FORMAT=image%2Fpng" +
				"&SRS=EPSG%3A4326" +
				"&BBOX={bbox}" + // Tassie 140,-46,150,-37
				"&WIDTH=512&HEIGHT=512",
			extent: {
				xmin: 141,
				xmax: 151.3,
				ymin: -35,
				ymax: -28.5
			}
		}
	},
	surfaceOpacity:0.1,
	listenDataLoadedEventName: 'rocks3ddataloaded',
	listenRendererSelectEventName: 'rocks3donselected'
};

context.mapConfig = {
    options: {  
		maxBounds: [[-48, 106],[-6, 159]],
	    center: [-28, 135],
	    minZoom: 4,
	    zoom: 5
	},
    position: {  
        bounds: [  
           [-44, 117],
           [-12, 146]
        ],
        minZoom: 13
     },
     layer: {  
         "name":"Google Hybrid",
         "type":"Google",
         "parameters":["HYBRID"],
         "defaultLayer":true,
         "isBaselayer":true,
         "visible":true
      },
	listenForExtentEvent: 'rocks3ddrawpolygon', // If we  get this event we know we have a polygon to draw
	listenForMarkerEvent: 'rocks3ddrawmarker'
};

// The particle system configuration
context.particles = {
	dataUrl: "http://www.ga.gov.au/geophysics-rockpropertypub-gws/ga_rock_properties_wfs/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=ga_rock_properties_wfs:remanent_magnetisation,ga_rock_properties_wfs:scalar_results&maxFeatures=50&outputFormat=application%2Fgml%2Bxml%3B+version%3D3.2&featureID={id}",
	url: "service/tile/",
	x: 138,
	y: -28,
	zoom: 4,
	maxCount: 300000,
	onhoverEventName: 'rocks3ddrawmarker',
	dataLoadedEventName: 'rocks3ddataloaded',
	rendererSelectEventName: 'rocks3donselected',
}; 

context.scene = {
	camera: {
		z: 200,
		x: -100,
		y: 100
	},
	light: {
		position: {
			x: 100,
			y: 500,
			z: 0
		}
	},
	onloadEventName: 'rocks3ddrawpolygon' // There should be someone listening for this event.	
};

export interface IConfigService {
	getConfig(what?: string): any;
}

angular.module('rocks3d.config', [])

.factory('configService', [function() {
	return {
		getConfig: function(what: string): any {
			if(!what) {
				return context;
			} else {
				return context[what];
			}
		}
	}
}])

}