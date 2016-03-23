/// <reference path="../../../../typings/tsd.d.ts" />
'use strict';
var rocks3dApp;
(function (rocks3dApp) {
    angular.module("Rocks3dApp", [
        'rocks3d.cluster',
        'rocks3d.config',
        'rocks3d.map',
        'rocks3d.message',
        'rocks3d.multisurface',
        'rocks3d.navigator',
        'rocks3d.particles',
        //'rocks3d.surface',
        'rocks3d.templates',
        'rocks3d.view'
    ]).config(['$locationProvider', function ($locationProvider) {
            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            });
        }]);
})(rocks3dApp || (rocks3dApp = {}));
/// <reference path="../../../../typings/tsd.d.ts" />
var rocks3d;
(function (rocks3d) {
    var config;
    (function (config) {
        'use strict';
        var context = {};
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
                        "&BBOX={bbox}" +
                        "&WIDTH=512&HEIGHT=512"
                },
                nsw: {
                    url: "http://maps.six.nsw.gov.au/arcgis/services/public/NSW_Imagery/MapServer/WMSServer" +
                        "?LAYERS=BestImageryDates" +
                        "&TRANSPARENT=TRUE" +
                        "&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=" +
                        "&FORMAT=image%2Fpng" +
                        "&SRS=EPSG%3A4326" +
                        "&BBOX={bbox}" +
                        "&WIDTH=512&HEIGHT=512",
                    extent: {
                        xmin: 141,
                        xmax: 151.3,
                        ymin: -35,
                        ymax: -28.5
                    }
                }
            },
            surfaceOpacity: 0.1,
            listenDataLoadedEventName: 'rocks3ddataloaded',
            listenRendererSelectEventName: 'rocks3donselected'
        };
        context.mapConfig = {
            options: {
                maxBounds: [[-48, 106], [-6, 159]],
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
                "name": "Google Hybrid",
                "type": "Google",
                "parameters": ["HYBRID"],
                "defaultLayer": true,
                "isBaselayer": true,
                "visible": true
            },
            listenForExtentEvent: 'rocks3ddrawpolygon',
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
        angular.module('rocks3d.config', [])
            .factory('configService', [function () {
                return {
                    getConfig: function (what) {
                        if (!what) {
                            return context;
                        }
                        else {
                            return context[what];
                        }
                    }
                };
            }]);
    })(config = rocks3d.config || (rocks3d.config = {}));
})(rocks3d || (rocks3d = {}));
/// <reference path="../../../../typings/tsd.d.ts" />
var rocks3d;
(function (rocks3d) {
    var cluster;
    (function (cluster) {
        'use strict';
        angular.module('rocks3d.cluster', [])
            .directive('rocks3dCluster', ['rocks3dClusterService', function (rocks3dClusterService) {
                return {
                    link: function (scope) {
                        rocks3dClusterService.init();
                    }
                };
            }])
            .factory('rocks3dClusterService', ['$http', 'rocks3dMapService', 'rocks3dNavigatorService',
            function ($http, rocks3dMapService, rocks3dNavigatorService) {
                var url = "service/rocks/summary";
                var sequence = 0;
                var service = {};
                var busy = false;
                var layer;
                service.init = function () {
                    rocks3dMapService.getMap().then(function (map) {
                        map.on('zoomend', movePan);
                        map.on('dragend', movePan);
                        function movePan(event) {
                            if (layer) {
                                map.removeLayer(layer);
                                layer = null;
                            }
                            var instanceSequence = ++sequence;
                            var zoom = map.getZoom();
                            var bounds = map.getBounds();
                            var parms = [];
                            parms.push("xmin=" + Math.max(bounds.getWest() - 20 / zoom, -180));
                            +parms.push("xmax=" + Math.min(bounds.getEast() + 20 / zoom, 180));
                            parms.push("ymin=" + Math.max(bounds.getSouth() - 10 / zoom, -90));
                            parms.push("ymax=" + Math.min(bounds.getNorth() + 10 / zoom, 90));
                            parms.push("zoom=" + (Math.max(zoom, 2)));
                            var geojsonMarkerOptions = {
                                radius: 8,
                                fillColor: "#ff7800",
                                color: "#000",
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 0.8
                            };
                            $http.get(url + "?" + parms.join("&")).then(function (result) {
                                if (instanceSequence < sequence) {
                                    return;
                                }
                                var maxRadius = Math.sqrt(d3.max(result.data.features, function (item) {
                                    return item.properties.count;
                                }));
                                layer = L.geoJson(result.data, {
                                    pointToLayer: function (feature, latlng) {
                                        var geojsonMarkerOptions = {
                                            radius: 4 + 20 / maxRadius * Math.sqrt(feature.properties.count),
                                            fillColor: "#ff7800",
                                            color: "#000",
                                            weight: 1,
                                            opacity: 1,
                                            fillOpacity: 0.8
                                        };
                                        var marker = L.circleMarker(latlng, geojsonMarkerOptions)
                                            .bindLabel("" + feature.properties.count, { noHide: true });
                                        marker.on("click", function () {
                                            var id = this.feature.id.split("/");
                                            rocks3dNavigatorService.to({
                                                zoom: id[0],
                                                x: id[1],
                                                y: id[2]
                                            });
                                        });
                                        return marker;
                                    }
                                }).addTo(map);
                            });
                        }
                    });
                };
                return service;
            }]);
    })(cluster = rocks3d.cluster || (rocks3d.cluster = {}));
})(rocks3d || (rocks3d = {}));
/// <reference path="../../../../typings/tsd.d.ts" />
/// <reference path="../config/config.ts" />
var rocks3d;
(function (rocks3d) {
    var mapview;
    (function (mapview) {
        'use strict';
        angular.module('rocks3d.map', []).directive("rocks3dMap", ['rocks3dMapService', function (rocks3dMapService) {
                return {
                    restrict: 'AE',
                    link: function (scope, element, attrs) {
                        rocks3dMapService.createMap(attrs["id"]);
                    }
                };
            }])
            .factory('rocks3dMapService', ['$document', '$q', '$rootScope', 'configService',
            function ($document, $q, $rootScope, configService) {
                var map, poly, marker;
                var service = {};
                var config = configService.getConfig('mapConfig');
                var waiters = [];
                service.getMap = function () {
                    var deferred;
                    if (map) {
                        return $q.when(map);
                    }
                    else {
                        deferred = $q.defer();
                        waiters.push(deferred);
                        return deferred.promise;
                    }
                };
                service.createMap = function (element) {
                    map = new L.Map(element, { center: config.options.center, zoom: config.options.zoom });
                    addLayer(config.layer, map);
                    L.control.scale({ imperial: false }).addTo(map);
                    L.control.mousePosition({
                        position: "bottomright",
                        emptyString: "",
                        seperator: " ",
                        latFormatter: function (lat) {
                            return "Lat " + L.Util.formatNum(lat, 5) + "°";
                        },
                        lngFormatter: function (lng) {
                            return "Lng " + L.Util.formatNum(lng, 5) + "°";
                        }
                    }).addTo(map);
                    if (config.listenForExtentEvent) {
                        $rootScope.$on(config.listenForExtentEvent, function showBbox(event, geojson) {
                            // It's a GeoJSON Polygon geometry and it has a single ring.
                            service.getMap().then(function () {
                                makePoly(geojson);
                            });
                        });
                    }
                    if (config.listenForMarkerEvent) {
                        $rootScope.$on(config.listenForMarkerEvent, function showBbox(event, geojson) {
                            // It's a GeoJSON Polygon geometry and it has a single ring.
                            service.getMap().then(function () {
                                makeMarker(geojson);
                            });
                        });
                    }
                    if (waiters) {
                        waiters.forEach(function (prom) {
                            prom.resolve(map);
                        });
                        waiters = null;
                    }
                    function makeMarker(data) {
                        var point;
                        if (typeof data.properties.SAMPLE_LONGITUDE != "undefined") {
                            point = {
                                type: "Point",
                                coordinates: [
                                    data.properties.SAMPLE_LONGITUDE,
                                    data.properties.SAMPLE_LATITUDE
                                ]
                            };
                        }
                        else {
                            point = data.geometry;
                        }
                        if (marker) {
                            map.removeLayer(marker);
                        }
                        marker = L.geoJson({
                            type: "Feature",
                            geometry: point,
                            id: data.id
                        }).addTo(map);
                        if (data.properties.html) {
                            marker.bindPopup(data.properties.html).openPopup();
                        }
                    }
                    function makePoly(data) {
                        if (poly) {
                            map.removeLayer(poly);
                        }
                        poly = L.geoJson(data).addTo(map);
                        map.fitBounds(poly.getBounds(), {
                            animate: true,
                            padding: L.point(100, 100)
                        });
                    }
                    function clip(num, min, max) {
                        return Math.min(Math.max(num, min), max);
                    }
                };
                return service;
                function addLayer(layer, map) {
                    var leafLayer = expandLayer(layer);
                    map.addLayer(leafLayer);
                }
                function expandLayer(data) {
                    var Clazz = [];
                    if (angular.isArray(data.type)) {
                        Clazz = L;
                        data.type.forEach(function (type) {
                            Clazz = Clazz[type];
                        });
                    }
                    else {
                        Clazz = L[data.type];
                    }
                    if (data.parameters && data.parameters.length > 0) {
                        return new Clazz(data.parameters[0], data.parameters[1], data.parameters[2], data.parameters[3], data.parameters[4]);
                    }
                    return new Clazz();
                }
            }]);
    })(mapview = rocks3d.mapview || (rocks3d.mapview = {}));
})(rocks3d || (rocks3d = {}));
/// <reference path="../../../../typings/tsd.d.ts" />
var rocks3d;
(function (rocks3d) {
    var message;
    (function (message) {
        'use strict';
        angular.module('rocks3d.message', [])
            .factory('rocks3dMessageService', ['$timeout', function ($timeout) {
                var messageTimer;
                var service = {};
                service.message = function (text) {
                    var messageArea = document.getElementById("message-details");
                    if (messageTimer) {
                        messageTimer();
                        messageTimer = null;
                    }
                    messageArea.innerHTML = text;
                    messageArea.style.display = "inline-block";
                    messageTimer = $timeout(function () {
                        messageArea.style.display = "none";
                    }, 12000);
                };
                return service;
            }]);
    })(message = rocks3d.message || (rocks3d.message = {}));
})(rocks3d || (rocks3d = {}));
/// <reference path="../../../../typings/tsd.d.ts" />
var rocks3d;
(function (rocks3d) {
    var navigator;
    (function (navigator) {
        'use strict';
        angular.module('rocks3d.navigator', [])
            .directive('rocks3dNavigate', ['rocks3dNavigatorService',
            function (rocks3dNavigatorService) {
                return {
                    restrict: 'AE',
                    scope: {
                        where: "="
                    },
                    link: function (scope, element) {
                        element.on('click', function () {
                            rocks3dNavigatorService.navigate(scope.where);
                        });
                    }
                };
            }])
            .directive('rocks3dZoom', ['rocks3dNavigatorService', function (rocks3dNavigatorService) {
                return {
                    restrict: 'AE',
                    scope: {
                        where: "="
                    },
                    link: function (scope, element) {
                        element.on('click', function () {
                            rocks3dNavigatorService.zoom(scope.where);
                        });
                    }
                };
            }])
            .factory('rocks3dNavigatorService', ['$document', 'configService', function ($document, configService) {
                var service = {};
                var data = configService.getConfig('particles');
                service.zoom = function (where) {
                    var hash = data.getHash();
                    var zoom = hash.zoom + 1;
                    var x = hash.x * 2;
                    var y = hash.y * 2;
                    var doc = $document[0];
                    if (where.x > 0) {
                        x++;
                    }
                    if (where.y > 0) {
                        y++;
                    }
                    data.setHash({ x: x, y: y, zoom: zoom });
                    doc.location = "?hash=" + data.createParameters();
                };
                service.to = function (xyz) {
                    var doc = $document[0];
                    data.setHash(xyz);
                    doc.location = "?hash=" + data.createParameters();
                };
                service.navigate = function (delta) {
                    var doc = $document[0];
                    var hash = data.getHash();
                    var yes = navigateParent();
                    if (!yes) {
                        yes = navigateY();
                        if (!yes) {
                            navigateX();
                        }
                    }
                    doc.location = "?hash=" + data.createParameters();
                    function navigateY() {
                        if (delta.y) {
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
                        if (delta.x) {
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
                        if (delta.zoom == -1) {
                            data.setHash({
                                zoom: hash.zoom + delta.zoom,
                                x: Math.floor(hash.x / 2),
                                y: Math.floor(hash.y / 2)
                            });
                            return true;
                        }
                        return false;
                    }
                    function valueOf(data, fallOver) {
                        if (typeof data == "undefined") {
                            return fallOver;
                        }
                        return data;
                    }
                };
                return service;
            }]);
    })(navigator = rocks3d.navigator || (rocks3d.navigator = {}));
})(rocks3d || (rocks3d = {}));
/// <reference path="../../../../typings/tsd.d.ts" />
var rocks3d;
(function (rocks3d) {
    var particles;
    (function (particles) {
        'use strict';
        angular.module('rocks3d.particles', [])
            .directive("rocks3dParticles", ['rocks3dParticlesService', function (rocks3dParticlesService) {
                return {
                    link: function (scope, element) {
                        rocks3dParticlesService.init(element[0]);
                    }
                };
            }])
            .controller('rocks3dParticlesCtrl', ['rocks3dParticlesService', function (rocks3dParticlesService) {
                this.data = rocks3dParticlesService.data();
            }])
            .factory('rocks3dParticlesService', ['$location', '$q', '$rootScope', '$timeout', 'configService', 'rocks3dMessageService', 'rocks3dSurfaceService',
            function ($location, $q, $rootScope, $timeout, configService, rocks3dMessageService, rocks3dSurfaceService) {
                var LENGTH_DEGREE = 111320;
                var service = {};
                var config = configService.getConfig('particles');
                var data = {};
                var state = {
                    data: data
                };
                var w, h, scatterPlot, format, unfiltered, objects, resizer;
                bootstrap();
                service.scene = function () {
                    return state;
                };
                service.data = function () {
                    return data;
                };
                service.init = function (element) {
                    var rect = element.getBoundingClientRect();
                    w = rect.width;
                    h = rect.height;
                    state.renderer = new THREE.WebGLRenderer({
                        antialias: true
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
                    d3.json(config.createTileInfo(), function (d) {
                        $timeout(function () {
                            data.tileInfo = d;
                            $rootScope.$broadcast(config.onloadEventName, d);
                        });
                        var hash = d.properties.hash;
                        config.hash = hash.z + "/" + hash.x + "/" + hash.y;
                        d.extent = {
                            x: [d.bbox[0], d.bbox[2]],
                            y: [d.bbox[1], d.bbox[3]]
                        };
                        load(d);
                    });
                    addLights(state.scene);
                };
                return service;
                function addLights(scene) {
                    state.scene.add(new THREE.AmbientLight(0x333333));
                    var light = new THREE.DirectionalLight(0xffffff);
                    light.position.set(100, 500, 0);
                    state.scene.add(light);
                }
                function load(tile) {
                    var zoom = tile.properties.hash.z;
                    console.log(config.createFeatures());
                    $q.all([rocks3dSurfaceService.prime(tile), (function () {
                            var deferred = $q.defer();
                            d3.json(config.createFeatures(), function (d) {
                                deferred.resolve(d);
                            });
                            return deferred.promise;
                        })()]).then(function (allData) {
                        var heightData = allData[0];
                        var heightExtent = d3.extent(heightData);
                        var d = allData[1];
                        $timeout(function () {
                            data.loaded = d;
                        });
                        if (!d.totalFeatures) {
                            rocks3dMessageService.message("There are no features in the selected area.");
                        }
                        else if (d.features.length < d.totalFeatures) {
                            rocks3dMessageService.message("Only showing " + d.features.length + " of " + d.totalFeatures + ", refine your search area");
                        }
                        d.features.forEach(function (feature, i) {
                            var properties = feature.properties;
                            var x = properties.SAMPLE_LONGITUDE;
                            var y = properties.SAMPLE_ELEVATION;
                            var z = properties.SAMPLE_LATITUDE;
                            var d = {
                                x: typeof x != "undefined" ? x : feature.geometry.coordinates[0],
                                y: typeof y != "undefined" ? y : feature.geometry.coordinates[2],
                                z: typeof z != "undefined" ? z : feature.geometry.coordinates[1]
                            };
                            d.y = d.y ? d.y : 0;
                            unfiltered[i] = {
                                x: +d.x,
                                y: +d.y,
                                z: +d.z
                            };
                        });
                        var xExtent = tile.extent.x;
                        var yExtent = d3.extent(unfiltered, function (d) {
                            return d.y;
                        });
                        var zExtent = tile.extent.y;
                        yExtent = [
                            Math.min(yExtent[0] ? yExtent[0] : 0, heightExtent[0]),
                            Math.max(yExtent[1] ? yExtent[1] : 0, heightExtent[1])
                        ];
                        var vpts = data.extents = {
                            xMax: xExtent[1],
                            xCen: (xExtent[1] + xExtent[0]) / 2,
                            xMin: xExtent[0],
                            yMax: yExtent[1],
                            yCen: (yExtent[1] + yExtent[0]) / 2,
                            yMin: yExtent[0],
                            zMax: zExtent[1],
                            zCen: (zExtent[1] + zExtent[0]) / 2,
                            zMin: zExtent[0],
                            aspectRatio: Math.cos(Math.PI / 180 * (zExtent[1] + zExtent[0]) / 2)
                        };
                        vpts.length = (vpts.zMax - vpts.zMin) * LENGTH_DEGREE; // Just a rough enough guess for what we want.
                        vpts.width = vpts.length * vpts.aspectRatio;
                        vpts.height = vpts.yMax - vpts.yMin;
                        var colour = d3.scale.category20c();
                        state.scale = {
                            x: d3.scale.linear().domain(xExtent).range([-50, 50]),
                            y: d3.scale.linear().domain(yExtent).range([-50, 50]),
                            z: d3.scale.linear().domain(zExtent).range([50, -50])
                        };
                        var lineGeo = getLineGeo(vpts, state.scale);
                        var lineMat = new THREE.LineBasicMaterial({
                            color: 0x000000
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
                            vertexColors: THREE.VertexColors,
                            size: 10
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
                            pointGeo.colors.push(new THREE.Color().setRGB(hexToRgb(colour("" + i)).r / 255, hexToRgb(colour("" + i)).g / 255, hexToRgb(colour("" + i)).b / 255));
                        }
                        if (pointCount > 0) {
                            pointGeo.computeBoundingSphere();
                            if (pointGeo.boundingSphere.radius < 5) {
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
                        state.renderer.domElement.onmousedown = function (ev) {
                            var rect = state.renderer.domElement.getBoundingClientRect();
                            down = true;
                            sx = ev.clientX;
                            sy = ev.clientY;
                            var mouse = new THREE.Vector2();
                            mouse.x = ((ev.clientX - rect.left) / state.renderer.domElement.clientWidth) * 2 - 1;
                            mouse.y = -((ev.clientY - rect.top) / state.renderer.domElement.clientHeight) * 2 + 1;
                            $rootScope.$broadcast(config.rendererSelectEventName, mouse);
                        };
                        state.renderer.domElement.onmouseup = function () {
                            down = false;
                        };
                        var raycaster = new THREE.Raycaster();
                        state.renderer.domElement.onmousemove = function (event) {
                            var feature;
                            var rect = state.renderer.domElement.getBoundingClientRect();
                            var mouse = new THREE.Vector2();
                            event.preventDefault();
                            mouse.x = ((event.clientX - rect.left) / state.renderer.domElement.clientWidth) * 2 - 1;
                            mouse.y = -((event.clientY - rect.top) / state.renderer.domElement.clientHeight) * 2 + 1;
                            raycaster.setFromCamera(mouse, state.camera);
                            var intersects = raycaster.intersectObject(points, true);
                            if (intersects.length > 0) {
                                feature = d.features[intersects[0].index];
                                $rootScope.$broadcast(config.onhoverEventName, decorateHtml(feature));
                            }
                            function decorateHtml(feature) {
                                var html, br;
                                var properties = feature.properties;
                                if (properties && !properties.html) {
                                    html = "<div class='popup-header'><strong>ID: </strong><a class='title-link' target='_blank' href='" +
                                        config.dataUrl.replace("{id}", feature.id) + "'>" + feature.id + "</a></div>Lon/lat elev: " +
                                        feature.geometry.coordinates[0].toFixed(6) + "/" +
                                        feature.geometry.coordinates[1].toFixed(6) +
                                        " " + (typeof feature.geometry.coordinates[2] == "undefined" ? "-" : feature.geometry.coordinates[2]);
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
                        };
                        // Get the loop going. 
                        var controls = new THREE.OrbitControls(state.camera, state.renderer.domElement);
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
                function getLineGeo(vpts, scale) {
                    var xScale = scale.x;
                    var yScale = scale.y;
                    var zScale = scale.z;
                    var lineGeo = new THREE.Geometry();
                    lineGeo.vertices.push(v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMin)), v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMax)), v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMax)), v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMin)), v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMin)), v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMax)), v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMax)), v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMin)), v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMin)), v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zMin)), v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zCen)), v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zCen)), v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zCen)), v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zCen)), v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zCen)), v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zCen)), v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zCen)), v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zMax)), v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zMax)), v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zMax)), v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zMin)), v(xScale(vpts.xMin), yScale(vpts.yCen), zScale(vpts.zMin)), v(xScale(vpts.xMin), yScale(vpts.yCen), zScale(vpts.zMax)), v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zMax)), v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zMin)), v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zMin)), v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zMin)), v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zMax)), v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMax)), v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMax)), v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMin)), v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zMin)), v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zMax)), v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zMax)), v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zMax)), v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMax)), v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMax)), v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zCen)), v(xScale(vpts.xMin), yScale(vpts.yCen), zScale(vpts.zCen)), v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zCen)), v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zMax)), v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMax)), v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMax)), v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMin)), v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMin)));
                    return lineGeo;
                }
                function v(x, y, z) {
                    return new THREE.Vector3(x, y, z);
                }
                function createTextCanvas(text, color, font, size) {
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
                function createText2D(text, color, font, size, segW, segH) {
                    var canvas = createTextCanvas(text, color, font, size);
                    var plane = new THREE.PlaneGeometry(canvas.width, canvas.height, segW, segH);
                    var tex = new THREE.Texture(canvas);
                    tex.needsUpdate = true;
                    var planeMat = new THREE.MeshBasicMaterial({
                        map: tex,
                        color: 0xffffff,
                        transparent: true
                    });
                    var mesh = new THREE.Mesh(plane, planeMat);
                    mesh.scale.set(0.5, 0.5, 0.5);
                    return mesh;
                }
                // from http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
                function hexToRgb(hex) {
                    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result ? {
                        r: parseInt(result[1], 16),
                        g: parseInt(result[2], 16),
                        b: parseInt(result[3], 16)
                    } : null;
                }
                function bootstrap() {
                    var search = $location.search();
                    var setter = conditional(search);
                    // The function setter returns itself so you can call ad infinitum
                    setter('x')('y')('zoom')('hash')('filter');
                    // Set up some helper functions
                    config.createTileInfo = function () {
                        if (this.hash) {
                            return this.url + "tileInfo" + (this.hash.indexOf("/") != 0 ? "/" : "") + this.hash;
                        }
                        return this.url + "tileInfo?" + this.createPointParameters();
                    };
                    config.createFeatures = function () {
                        return this.url + "features" + this.createParameters();
                    };
                    config.createParameters = function () {
                        if (this.hash) {
                            return "/" + this.hash + "?maxCount=" + this.maxCount + createFilters(this.filter).join("");
                        }
                        return "?" + this.createPointParameters() + "&maxCount=" + this.maxCount + createFilters(this.filter).join("");
                    };
                    config.createPointParameters = function () {
                        return "x=" + this.x +
                            "&y=" + this.y +
                            "&zoom=" + this.zoom;
                    };
                    config.setHash = function (xyzoom) {
                        this.hash = xyzoom.zoom + "/" + xyzoom.x + "/" + xyzoom.y;
                    };
                    config.getHash = function () {
                        var index = 0;
                        var parts = this.hash.split("/");
                        if (parts.length == 4) {
                            index = 1;
                        }
                        return {
                            zoom: parseInt(parts[index++]),
                            x: parseFloat(parts[index++]),
                            y: parseFloat(parts[index])
                        };
                    };
                    function createFilters(filterArr) {
                        var filters = [];
                        if (filterArr) {
                            if (angular.isArray(filterArr)) {
                                filters = filterArr.map(function (filter) {
                                    return "&filter=" + encodeURIComponent(filter);
                                });
                            }
                            else {
                                filters = ["&filter=" + encodeURIComponent(filterArr)];
                            }
                        }
                        return filters;
                    }
                    function conditional(search) {
                        var set = function set(key) {
                            var value = search[key];
                            if (typeof value != "undefined") {
                                config[key] = value;
                            }
                            return set;
                        };
                        return set;
                    }
                }
            }]);
    })(particles = rocks3d.particles || (rocks3d.particles = {}));
})(rocks3d || (rocks3d = {}));
/// <reference path="../../../../typings/tsd.d.ts" />
/// <reference path="../config/config.ts" />
'use strict';
var rocks3d;
(function (rocks3d) {
    var multisurface;
    (function (multisurface) {
        'use strict';
        angular.module('rocks3d.multisurface', [])
            .directive("rocks3dSurface", ['rocks3dSurfaceService', function (rocks3dSurfaceService) {
                return {
                    link: function (scope) {
                        //rocks3dSurfaceService.prime();
                    }
                };
            }])
            .provider('rocks3dSurfaceService', [function () {
                var metadataLocation = "rocks3d/resources/config/surfaces.json";
                var metadata = null;
                this.location = function (url) {
                    metadataLocation = url;
                };
                var METRES_PER_DEGREE = 111000;
                var geometry, plane;
                var lastData;
                var state = {};
                var heightData;
                var tileInfo;
                var sceneProperties;
                var waiters = null;
                this.$get = ['$http', '$q', '$rootScope', '$timeout', 'configService',
                    function ($http, $q, $rootScope, $timeout, configService) {
                        var service = {};
                        var config = configService.getConfig("surface");
                        service.getMetadata = function () {
                            if (metadata) {
                                return $q.when(metadata);
                            }
                            var deferred = $q.defer();
                            if (!waiters) {
                                waiters = [deferred];
                                $http.get(metadataLocation, { cache: true }).then(function (response) {
                                    metadata = response.data;
                                    waiters.forEach(function (waiter) {
                                        waiter.resolve(metadata);
                                    });
                                });
                            }
                            else {
                                waiters.push(deferred);
                            }
                            return deferred.promise;
                        };
                        service.data = function () {
                            return state;
                        };
                        service.prime = function (tile) {
                            var deferred = $q.defer();
                            var planes = [];
                            service.getMetadata().then(function (metadata) {
                                var t = tile;
                                metadata.features.forEach(function (item) {
                                    var urls = item.properties.urlTemplates;
                                    if (item.properties.show) {
                                        var loader = new THREE.DataSurfaceLoader();
                                        loader.load(transformUrl(urls.elevation, tile, config.resolution), transformUrl(urls.imagery, tile, config.resolution), loaded);
                                    }
                                });
                            });
                            return deferred.promise;
                            function loaded(data) {
                                console.log("Tadah!");
                                console.log(data);
                            }
                        };
                        return service;
                    }];
            }]);
        function transformUrl(url, tile, resolution) {
            return url.replace(/\{resolution\}/g, "" + resolution).replace("{bbox}", tile.bbox);
        }
    })(multisurface = rocks3d.multisurface || (rocks3d.multisurface = {}));
})(rocks3d || (rocks3d = {}));
/// <reference path="../../../../typings/tsd.d.ts" />
/// <reference path="../config/config.ts" />
var rocks3d;
(function (rocks3d) {
    var surface;
    (function (surface) {
        'use strict';
        angular.module('rocks3d.surface', [])
            .directive("rocks3dSurface", ['rocks3dSurfaceService', function (rocks3dSurfaceService) {
                return {
                    link: function (scope) {
                        //rocks3dSurfaceService.prime();
                    }
                };
            }])
            .factory('rocks3dSurfaceService', ['$q', '$rootScope', '$timeout', 'configService',
            function ($q, $rootScope, $timeout, configService) {
                var METRES_PER_DEGREE = 111000;
                var service = {};
                var geometry, plane;
                var lastData;
                var config = configService.getConfig("surface");
                var state = {};
                var heightData;
                var tileInfo;
                var sceneProperties;
                service.data = function () {
                    return state;
                };
                service.prime = function (tile) {
                    tileInfo = tile;
                    var deferred = $q.defer();
                    var wcs1sec = config.elevation1SecUrl;
                    wcs1sec = wcs1sec.replace(/\{resolution\}/g, config.resolution);
                    wcs1sec = wcs1sec.replace("{bbox}", tile.bbox);
                    var terrainLoader = new THREE.GeotiffTerrainLoader();
                    terrainLoader.load(wcs1sec, function (loaded) {
                        heightData = loaded;
                        deferred.resolve(loaded);
                    });
                    return deferred.promise;
                };
                service.checkElevation = function (xy) {
                    var raycaster = new THREE.Raycaster();
                    var state = sceneProperties;
                    raycaster.setFromCamera(xy, state.camera);
                    var intersects = raycaster.intersectObject(plane, true);
                    if (intersects.length > 0) {
                        console.log("Intersects");
                        console.log(plane);
                        console.log(intersects[0]);
                    }
                };
                service.render = function (data, properties) {
                    sceneProperties = properties;
                    lastData = data;
                    var loaded = data.loaded;
                    var yCen = data.extents.yCen;
                    if (tileInfo.properties.hash.z < 4) {
                        return false;
                    }
                    var bbox = toBbox(tileInfo.bbox);
                    var baseUrl = config.imageryUrls.national.url;
                    //Lets see if we can use the NSW imagery.
                    var extents = data.extents;
                    var nswExtent = config.imageryUrls.nsw.extent;
                    if (extents.xMin > nswExtent.xmin && extents.xMax < nswExtent.xmax &&
                        extents.zMin > nswExtent.ymin && extents.zMax < nswExtent.ymax) {
                        baseUrl = config.imageryUrls.nsw.url;
                    }
                    var loader = new THREE.TextureLoader();
                    loader.crossOrigin = '';
                    var material = new THREE.MeshPhongMaterial({
                        map: loader.load(baseUrl.replace("{bbox}", bbox)),
                        transparent: true,
                        opacity: config.surfaceOpacity
                    });
                    $timeout(function () { state.surface = material; });
                    geometry = new THREE.PlaneGeometry(100, 100, 199, 199);
                    plane = new THREE.Mesh(geometry, material);
                    plane.rotation.x = -Math.PI / 2;
                    geometry.vertices.forEach(function (vertice, i) {
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
                function matchPoints(tileInfo) {
                    var z = tileInfo.properties.hash.z;
                    var extentX = tileInfo.extent.x;
                    var result = 80 / ((extentX[1] - extentX[0]) * METRES_PER_DEGREE) +
                        (10 - z) * 0.001;
                    return result;
                }
                function toBbox(bboxArr) {
                    return bboxArr[0] + "," +
                        bboxArr[1] + "," +
                        bboxArr[2] + "," +
                        bboxArr[3];
                }
            }]);
    })(surface = rocks3d.surface || (rocks3d.surface = {}));
})(rocks3d || (rocks3d = {}));
/// <reference path="../../../../typings/tsd.d.ts" />
var rocks3d;
(function (rocks3d) {
    var view;
    (function (view) {
        'use strict';
        angular.module('rocks3d.view', [])
            .directive("rocks3dView", [function () {
                return {
                    templateUrl: "rocks3d/view/view.html"
                };
            }])
            .directive("rocks3dSurfaceOpacity", [function () {
                return {
                    templateUrl: "rocks3d/view/surfaceopacity.html",
                    link: function (scope, element) { }
                };
            }])
            .directive("rocks3dVerticalExaggerate", ['rocks3dParticlesService', function (rocks3dParticlesService) {
                var range = [0.0001, 0.0002, 0.0005, 0.001, 0.002, 0.005, 0.01, 0.02, 0.05,
                    0.1, 0.2, 0.5, 1];
                return {
                    templateUrl: 'rocks3d/view/verticalexaggerate.html',
                    scope: {
                        direction: "="
                    },
                    link: function (scope, element) {
                        scope.index = 12;
                        scope.range = range;
                        scope.smaller = function () {
                            scope.index--;
                            change();
                        };
                        scope.larger = function () {
                            scope.index++;
                            change();
                        };
                        scope.oneToOne = function () {
                            var props = rocks3dParticlesService.scene();
                            var dimensions = props.data.extents;
                            var length = dimensions.length;
                            var height = dimensions.height;
                            var ratio = height / length;
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
            .directive("rocks3dSurfaceOpacity", ['rocks3dSurfaceService', function (rocks3dSurfaceService) {
                return {
                    link: function (scope) {
                        scope.data = rocks3dSurfaceService.data();
                    }
                };
            }]);
    })(view = rocks3d.view || (rocks3d.view = {}));
})(rocks3d || (rocks3d = {}));
angular.module("rocks3d.templates", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("rocks3d/view/surfaceopacity.html", "<span style=\"float:right; z-index:3\">\r\n	Surface opacity\r\n	<input ng-model=\"data.surface.opacity\" type=\"range\" min=\"0\" max=\"1\" step=\"0.05\"></input>\r\n</span>");
        $templateCache.put("rocks3d/view/verticalexaggerate.html", "<span class=\"verticalExaggerateContainer\">\r\n	<button ng-click=\"smaller()\" ng-disabled=\"!index\">Less</button> \r\n	Vertical exaggeration\r\n	<button ng-click=\"larger()\" ng-disabled=\"range[index] == 1\">More</button> \r\n	<!-- <button ng-click=\"oneToOne()\">One to One</button> -->\r\n</span>");
        $templateCache.put("rocks3d/view/view.html", "<rocks3d-vertical-exaggerate></rocks3d-vertical-exaggerate>\r\n<rocks3d-surface-opacity ng-show=\"data.surface\"></rocks3d-surface-opacity>");
    }]);
