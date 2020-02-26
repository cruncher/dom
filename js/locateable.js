
/**
[locateable]

An element with a `locateable` attribute updates the browser location hash
with its `id` when scrolled into view.

When the location hash changes to be equal to a `locateable`'s id
the locateable gets the class `"located"`, and links that reference that
locateable via their `href` attribute get the class `"on"`.

Build a list of links that reference locateables and with a little style
you have a scrolling navigation:

```html
<style>
    a               { color: #888888; }
    a.on            { color: black; }
    article.located { ... }
</style>

<a href="#fish">...</a>
<a href="#chips">...</a>

<article locateable id="fish">...</article>
<article locateable id="chips">...</article>
```
**/

import '../polyfills/element.scrollintoview.js';
import { by, get } from '../../fn/module.js';
import { rect, features, isInternalLink, select } from '../module.js';

var DEBUG = false;

const selector = ".locateable, [locateable]";
const byTop    = by(get('top'));
const nothing  = {};
const scrollOptions = {
    // Overridden on window load
    behavior: 'auto',
    block: 'start'
};

export const config = {
    scrollIdleDuration: 0.18
};

let hashTime     = -Infinity;
let frameTime    = -Infinity;
let scrollTop    = document.scrollingElement.scrollTop;
let locateables, locatedNode, scrollPaddingTop, frame;


function queryLinks(id) {
	return select('a[href$="#' + id + '"]', document.body)
	.filter(isInternalLink);
}

function addOn(node) {
    node.classList.add('on');
}

function removeOn(node) {
    node.classList.remove('on');
}

function locate(node) {
    node.classList.add('located');
    queryLinks(node.id).forEach(addOn);
    locatedNode = node;
}

function unlocate() {
    if (!locatedNode) { return; }
    locatedNode.classList.remove('located');
    queryLinks(locatedNode.id).forEach(removeOn);
    locatedNode = undefined;
}

function update(time) {
    frame = undefined;

    // Update things that rarely change only when we have not updated recently
    if (frameTime < time - config.scrollIdleDuration * 1000) {
        locateables = select(selector, document);
        scrollPaddingTop = parseInt(getComputedStyle(document.documentElement).scrollPaddingTop, 10);
    }

    frameTime = time;

    const boxes = locateables.map(rect).sort(byTop);
    let  n = -1;

    while (boxes[++n]) {
        // Stop on locateable lower than the break
        if (boxes[n].top > scrollPaddingTop + 1) {
            break;
        }
    }

    --n;

    // Before the first or after the last locateable. (The latter
    // should not be possible according to the above while loop)
    if (n < 0 || n >= boxes.length) {
        if (locatedNode) {
            unlocate();
            window.history.replaceState(nothing, '', '#');
        }

        return;
    }

    var node = locateables[n];

    if (locatedNode && node === locatedNode) {
        return;
    }

    unlocate();
    locate(node);
    window.history.replaceState(nothing, '', '#' + node.id);
}

function scroll(e) {
    if (DEBUG) {
        console.log(e.type, e.timeStamp, window.location.hash, document.scrollingElement.scrollTop);
    }

    const aMomentAgo = e.timeStamp - config.scrollIdleDuration * 1000;

    // Keep a record of scrollTop in order to restore it in Safari,
    // where popstate and hashchange are preceeded by a scroll jump
    scrollTop = document.scrollingElement.scrollTop;

    // For a moment after the last hashchange dont update while
    // smooth scrolling settles to the right place.
    if (hashTime > aMomentAgo) {
        hashTime = e.timeStamp;
        return;
    }

    // Is frame already cued?
    if (frame) {
        return;
    }

    frame = requestAnimationFrame(update);
}

function popstate(e) {
    if (DEBUG) {
        console.log(e.type, e.timeStamp, window.location.hash, document.scrollingElement.scrollTop);
    }

    // Record the timeStamp
    hashTime = e.timeStamp;

    // Remove current located
    unlocate();

    const hash = window.location.hash;
    const id   = hash.slice(1);
    if (!id) {
        if (!features.scrollBehavior) {
            // In Safari, popstate and hashchange are preceeded by scroll jump -
            // restore previous scrollTop.
            document.scrollingElement.scrollTop = scrollTop;

            // Then animate
            document.body.scrollIntoView(scrollOptions);
        }

        return;
    }

    // Is there a node with that id?
    const node = document.getElementById(id);
    if (!node) { return; }

    // The page is on the move
    locate(node);

    // Implement smooth scroll for browsers that do not have it
    if (!features.scrollBehavior) {
        // In Safari, popstate and hashchange are preceeded by scroll jump -
        // restore previous scrollTop.
        document.scrollingElement.scrollTop = scrollTop;

        // Then animate
        node.scrollIntoView(scrollOptions);
    }
}

function load(e) {
    popstate(e);
    scroll(e);

    // Start listening to popstate and scroll
    window.addEventListener('popstate', popstate);
    window.addEventListener('scroll', scroll);

    // Scroll smoothly from now on
    scrollOptions.behavior = 'smooth';
}

window.addEventListener('load', load);
