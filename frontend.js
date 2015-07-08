$(document).ready(function() {

	var routes = new Array();
	var socket = io();

	var currentWidth = $('#map').width();
	var width = 938;
	var height = 620;

	var projection = d3.geo.mercator().scale(150).translate([width / 2, height / 1.41]);

	var path = d3.geo.path().projection(projection);

	var svg = d3.select("#map")
		.append("svg")
		.attr("preserveAspectRatio", "xMidYMid")
		.attr("viewBox", "0 0 " + width + " " + height)
		.attr("width", currentWidth)
		.attr("height", currentWidth * height / width);


	queue().defer(d3.json, "countries.json")
		.await(function(error, countries) {
			svg.append("g")
			.attr("class", "countries")
			.selectAll("path")
			.data(topojson.feature(countries, countries.objects.countries).features)
			.enter()
			.append("path")
			.attr("d", path);
		});

	socket.on('visitor', function(json){
		$('#visits').append( 
			$('<tr>').append( $('<td>').text(json.visitor.ip) )
				.append( $('<td>').text(json.status) )
				.append( $('<td>').text(json.url) )
		);

		if( $('#visits').height() > $(window).height() ) {
			$('#visits tbody tr:first').remove();
		}

		route = svg.append("path")
			.datum({type: "LineString", coordinates: [ [json.visitor.geo[1],json.visitor.geo[0]], [json.server.geo[1],json.server.geo[0]] ]})
			.attr("class", "route route-"+json.status)
			.attr("d", path);  

		var totalLength = route.node().getTotalLength();

		route.attr("stroke-dasharray", totalLength + " " + totalLength)
			.attr("stroke-dashoffset", totalLength)
			.transition()
			.duration(1000)
			.ease("linear")
			.attr("stroke-dashoffset", 0);

		var key = routes.length;
		routes[ key ] = route;

		setTimeout(function(key) {
			routes[key].style("opacity", 1).transition().duration(5000).style("opacity", 0).remove();
			routes[key] = null;
		}, 2000, key);

	});

});