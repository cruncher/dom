(function(window) {
	"use strict";

	var Fn      = window.Fn;
	var dom     = window.dom;

	var on      = dom.events.on;
	var trigger = dom.events.trigger;
	var closest = dom.closest;

//	var settings = {
//		// Ratio of distance over target finger must travel to be
//		// considered a swipe.
//		threshold: 0.4,
//		// Faster fingers can travel shorter distances to be considered
//		// swipes. 'sensitivity' controls how much. Bigger is shorter.
//		sensitivity: 6
//	};

	function touchdone(node, data) {
		data = data.shift();

		//var x = data.x;
		//var y = data.y;
		//var w = node.offsetWidth;
		//var h = node.offsetHeight;
		var polar = Fn.toPolar([data.x, data.y]);

		// Todo: check if swipe has enough velocity and distance
		//x/w > settings.threshold || e.velocityX * x/w * settings.sensitivity > 1

		trigger(node, 'dom-swipe', {
			detail:   data,
			angle:    polar[1],
			velocity: polar[0] / data.time
		});
	}

	on(document, 'dom-touch', function(e) {
		if (e.defaultPrevented) { return; }

		var node = closest('.swipeable', e.target);
		if (!node) { return; }

		var touch = e.detail();
		var data  = touch.clone().latest();

		data.then(function() {
			touchdone(node, data);
		});
	});
})(this);