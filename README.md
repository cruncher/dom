# dom.js

A library of curried DOM functions, custom events and event streams
for HTML and SVG.

## Demo

<a href="http://stephband.info/dom/">stephen.band/dom/</a>

## dom(selector)

##### `dom(selector)`

Returns an array of matching nodes in `document`.

## dom

All functions on `dom` are curried. Many are designed to be used as map, filter
or reduce iterators.

	// Collect all links with or containing `.my-icon` and
	// stick them in a fragment.

	var fragment = dom.create('fragment');

    Fn.from(dom('.my-icon'))
    .map(dom.closest('a'))
    .each(dom.append(fragment));

##### `.ready(fn)`

##### `.query(selector, container)`

Returns an array of all descendants of `container` node that match `selector`.

##### `.create(tag, text)`

Returns a new DOM node.

- If `tag` is `"text"` returns a text node with the content `text`.
- If `tag` is `"fragment"` returns a document fragment.
- If `tag` is `"comment"` returns a comment `<!-- text -->`.
- Anything else returns an element `<tag>text</tag>`, where `text` is inserted
  as inner html.

##### `.clone(node)`

Returns a deep copy of `node`.

##### `.isElementNode(node)`

Returns `true` if `node` is an element node.

##### `.isTextNode(node)`

Returns `true` if `node` is a text node.

##### `.isCommentNode(node)`

Returns `true` if `node` is a comment.

##### `.isFragmentNode(node)`

Returns `true` if `node` is a fragment.

##### `.isExternalLink(node)`

Returns `true` if the `href` of `node` points outside of the current domain.

##### `.identify(node)`

Returns the id of `node`. Where there is no id a random id is generated,
set on `node` and returned.

    dom('button')
    .map(dom.identify)
    ...

If you just want to get the id, us `Fn.get()`.

    dom('button')
    .map(Fn.get('id'))
    ...

##### `.type(node)`

Returns `node` type as one of the strings `element`, `comment`, `text`,
`fragment`, `document` or `doctype`.

##### `.tag(node)`

Returns the tag name of `node`.

##### `.attribute(name, node)`

Returns the string contents of attribute `name`, or if the attribute is boolean,
returns `true` or `false`.

##### `.classes(node)`

Returns the classList of `node`.

##### `.append(target, node)`

Appends node to `target`.

If `node` is a collection of nodes, appends each node to `target`.

##### `.before(target, node)`

Inserts `node` before target.

##### `.after(target, node)`

Inserts `node` after `target`.

##### `.empty(node)`

Removes content of `node`.

##### `.remove(node)`

Removes `node` from the DOM.

##### `.replace(target, node)`

Swaps `target` for `node`.

##### `.matches(selector, node)`

Returns `true` if `node` matches `selector`, otherwise `false`.

##### `.closest(selector, node)`

Returns the node itself or the closest ancestor that matches `selector`.
If no match is found, returns `undefined`.


#### Style

##### `.style(property, node)`

Returns the computed style `property` of `node`.
If `property` is of the form `"property:name"`, a named aspect of the property
is returned.

    dom.style('transform:rotate', node);     // returns rotation, as a number, in radians
    dom.style('transform:scale', node);      // returns scale, as a number
    dom.style('transform:translateX', node); // returns translation, as a number, in px
    dom.style('transform:translateY', node); // returns translation, as a number, in px

##### `.offset(node)`

Returns array [x, y].

##### `.position(node)`

Returns array [x, y].

#### Events

##### `.on(type, node)`

Returns a stream of events heard on `node`:

    var events = dom.on('click', document.body);
    
    events
    .map(Fn.get('timeStamp'))
    .each(function(timeStamp) {
        // Do something with times
    });

Stopping the stream removes event listeners from `node`:

    events.stop();

##### `.trigger(type, node)`

Triggers event of `type` on `node`.

    dom.trigger('dom-activate', dom.find('toggle-id'));

##### `.isPrimaryButton(e)`

Returns boolean.

##### `.toKey(e)`

Returns key string corresponding to `e.keyCode`, or `undefined`.

##### `.preventDefault(e)`

Calls `e.preventDefault()`.

##### `.events`

An object containing some lower-level, uncurried event methods.

    dom.events.on(node, types, fn, data)

Binds listener `fn` to events of type `types` on `node`. Listener `fn` is
passed 2 arguments – the event object and optional `data` object:

    dom.events.off(node, types, fn)

Unbinds listener `fn` from events of type `types` on `node`.

    dom.events.trigger(node, type, properties)

Triggers event of `type`, with optional `properties`, on `node`.

##### `.Event(type, properties)`

Creates a CustomEvent of type `type`.
Additionally, `properties` are assigned to the event object.


#### DOM Animation

##### `.animate(fn, duration, value, name, object)`

##### `.requestFrameN(n, fn)`

##### `.scrollTo(px, node)`

##### `.scrollRatio(node)`

#### Feature detection

##### `.features`

An object of feature detection results.

    {
        inputEventOnDisabled: true,   // false in FF, where disabled inputs don't trigger events
        template: true,               // false in old browsers where template.content not found
        textareaPLaceholderSet: true, // False in IE, where placeholder is also set on innerHTML
    }


## Events

##### `dom-activate`

Requires `js/dom-activate.js`.

##### `dom-deactivate`

Requires `js/dom-activate.js`.

##### `dom-touch`

Requires `js/dom-touch.js`.

A `touch` event fires following a `mousedown` or `touchstart` and as soon as the
pointer has moved more than a threshold 6px from it's start position. It carries
a stream of coordinates for the finger as `e.detail()`.

	dom
	.on("dom-touch", document)
	.each(function(e) {
	    // Position at start of touch
    	var x = e.pageX;
    	var y = e.pageY;
		var time = e.timeStamp;

		// e.detail() creates a stream of touch data for a single
		// finger or pointer
		e.detail().each(function(data) {
			// New coordinate data
			var x = data.x + e.pageX;
			var y = data.y + e.pageY;
			var t = data.time + e.timeStamp;
		});
    });

##### `dom-swipe`

Requires `js/dom-touch.js` and `js/dom-swipe.js`.

A swipe event fires after a single touch has performed a swipe gesture in a
node with the class `swipeable`.

	<div class="swipeable">Swipe me</div>

	dom
	.on("dom-swipe", document)
	.each(function(e) {
		// e.target === <div class="swipeable">
    });

## Install

Install `dom`:

    git clone https://github.com/stephband/dom.git
    cd dom/
    npm install

Lint the contents of `js/`:

	npm run lint

## History

*0.1*: first import from jquery.event.move and Fn library
*0.2*: API stabilised
