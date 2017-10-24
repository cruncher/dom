(function(window) {
	"use strict";

	var Fn      = window.Fn;
	var dom     = window.dom;

	var noop          = Fn.noop;
	var on            = dom.events.on;
	var off           = dom.events.off;
	var trigger       = dom.events.trigger;
	var disableScroll = dom.disableScroll;
	var enableScroll  = dom.enableScroll;
	var trapFocus     = dom.trapFocus;
	var untrapFocus   = noop;

	var matches = dom.matches('.focusable, [focusable]');
	var delay   = 600;

	on(document, 'dom-activate', function(e) {
		if (e.defaultPrevented) { return; }
		if (!matches(e.target)) { return; }

		// Trap focus

		var node = e.target;
		var trap = function trap(e) {
			clearTimeout(timer);
			off(e.target, 'transitionend', trap);
			untrapFocus = trapFocus(e.target);
		};

		var timer = setTimeout(trap, delay, e);
		on(e.target, 'transitionend', trap);

		// Prevent scrolling of main document

		disableScroll(dom.root);

		// Make the escape key deactivate the focusable

		requestAnimationFrame(function() {
			function keydown(e) {
				if (e.keyCode !== 27) { return; }
				trigger(node, 'dom-deactivate');
				e.preventDefault();
			}

			function deactivate(e) {
				if (node !== e.target) { return; }
				if (e.defaultPrevented) { return; }
				document.removeEventListener('keydown', keydown);
				document.removeEventListener('dom-deactivate', deactivate);
			}

			document.addEventListener('keydown', keydown);
			document.addEventListener('dom-deactivate', deactivate);
		});
	});

	on(document, 'dom-deactivate', function(e) {
		if (e.defaultPrevented) { return; }
		if (!matches(e.target)) { return; }

		var untrap = function untrap(e) {
			clearTimeout(timer);
			off(e.target, 'transitionend', untrap);
			untrapFocus();
			untrapFocus = noop;
		};

		var timer = setTimeout(untrap, delay, e);
		on(e.target, 'transitionend', untrap);
		enableScroll(dom.root);
	});

	dom.activeMatchers.push(matches);
})(this);
