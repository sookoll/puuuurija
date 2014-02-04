L.Control.Layers.prototype._addItem = function(obj) {
	var label = document.createElement('label'),
		input,
		checked = this._map.hasLayer(obj.layer);
		
	if (obj.overlay) {
		input = document.createElement('input');
		input.type = 'checkbox';
		input.className = 'leaflet-control-layers-selector';
		input.defaultChecked = checked;
	} else {
		input = this._createRadioElement('leaflet-base-layers', checked);
	}

	input.layerId = L.stamp(obj.layer);
	L.DomEvent.on(input, 'click', this._onInputClick, this);
	var name = document.createElement('span');
	name.innerHTML = ' ' + obj.name;
	label.appendChild(input);
	label.appendChild(name);
	label.className = obj.overlay ? "checkbox" : "radio";
	var container = obj.overlay ? this._overlaysList : this._baseLayersList;
	container.appendChild(label);
	return label;
}

var m = L.map("map", {
	zoomControl : false
});

if (!location.hash) {
	m.setView([32.69, 10.55], 3);
}

m.addHash();

var osm = L.tileLayer('http://{s}.tile.cloudmade.com/{key}/22677/256/{z}/{x}/{y}.png', {
    attribution: 'OSM,CloudMade',
    key: 'BC9A493B41014CAABB98F0471D759707'
}).addTo(m);

var osm_est = L.tileLayer('http://kaart.maakaart.ee/osm/tiles/1.0.0/osm_EPSG900913/{z}/{x}/{y}.png?origin=nw', {
	attribution: 'OSM, maakaart.ee'
});

var lc = L.control.layers({
	"OSM" : osm,
	"Eesti" : osm_est
}).addTo(m);

//make the map
var options = {
	onEachFeature : function(feature, layer) {
		if (feature.properties) {
			layer.bindPopup(Object.keys(feature.properties).map(function(k) {
				if (k === '__color__') {
					return;
				}
				return k + ": " + feature.properties[k];
			}).join("<br />"), {
				maxHeight : 200
			});
		}
	},
	pointToLayer : function(feature, latlng) {
		return new L.Marker(latlng, {
            icon: new L.Icon({
                iconUrl: 'point.png',
		        iconSize: [20,20],
		        iconAnchor: [10,10],
		        popupAnchor: [5,-14]
            }),
            opacity: 0
        });
	}
};

function animateOnAdd(data){
    var i = 0,
    	j = 0;
    var count = data.getLayers().length;
    
    data.eachLayer(function(layer) {
        
        d3.select(layer._icon)
            .style('margin-left', '0px')
            .style('margin-top', '0px')
            .style('width', '0px')
            .style('height', '0px')
            .transition()
            .delay(i * 200)
            .duration(500)
            .style('opacity', 1)
            .style('margin-left', '-6px')
            .style('margin-top', '-6px')
            .style('width', '12px')
            .style('height', '12px')
            .ease("elastic")
            .each("end", function(){
            	j++;
            	if(j == count){
            		animateOnRemove(data);
            	}
            });
        i++;
    });
    
}

function animateOnRemove(data){
	
	var i = 0;
    var line0 = [],
    	line1 = [];
    
    var polyline = L.polyline(line0, {
    	color: 'green',
    	weight: 8
    }).addTo(m);
    
    var polygon = L.polygon(line1, {
    	color: 'green',
    	weight: 5
    }).addTo(m);
    
    data.eachLayer(function(layer) {
        //var latlng = L.latLng(layer.feature.geometry.coordinates);
		        
        d3.select(layer._icon)
            .transition()
            .delay(300 + i * 300)
            .duration(500)
            .style('opacity', 0)
            .style('margin-left', '-32px')
            .style('margin-top', '-32px')
            .style('width', '64px')
            .style('height', '64px')
            .each('start', function() {
                if(layer.feature.properties.type){
		        	if(layer.feature.properties.type == '0'){
		        		line0.push();
		        		polyline.addLatLng(L.latLng(layer.feature.geometry.coordinates[1],layer.feature.geometry.coordinates[0]));
		        	} else if(layer.feature.properties.type == '1'){
		        		line1.push(L.latLng(layer.feature.geometry.coordinates[1],layer.feature.geometry.coordinates[0]));
		        		polygon.addLatLng(L.latLng(layer.feature.geometry.coordinates[1],layer.feature.geometry.coordinates[0]));
		        	}
		        }
            })
            .each('end', function() {
                data.removeLayer(layer);
            });
        
        i++;
    });
    
    
	
}
