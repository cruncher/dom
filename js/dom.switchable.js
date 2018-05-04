// dom.switchable
//
// Extends the default behaviour of the activate and deactivate
// events with things to do when they are triggered on nodes.

import { Functor as Fn } from '../../fn/fn.js';
import { default as dom, events, trigger, matches, children } from './dom.js';

(function(window) {
	"use strict";

	// Define

	var match   = matches('.switchable, [switchable]');
	var on      = events.on;
	var triggerDeactivate = trigger('dom-deactivate');

	function activate(e) {
		if (!e.default) { return; }

		var target = e.target;
		if (!match(target)) { return; }

		var nodes = children(target.parentNode).filter(match);
		var i     = nodes.indexOf(target);

		nodes.splice(i, 1);
		var active = nodes.filter(dom.matches('.active'));

		e.default();

		// Deactivate the previous active pane AFTER this pane has been
		// activated. It's important for panes who's style depends on the
		// current active pane, eg: .slide.active ~ .slide
		Fn.from(active).each(triggerDeactivate);
	}

	function deactivate(e) {
		if (!e.default) { return; }

		var target = e.target;
		if (!match(target)) { return; }

		e.default();
	}

	on(document, 'dom-activate', activate);
	on(document, 'dom-deactivate', deactivate);
	dom.activeMatchers.push(match);
})(window);
