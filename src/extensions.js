/**
 *
 * Package shinsenter/defer.js
 * https://github.com/shinsenter/defer.js
 *
 * Minified by UglifyJS3
 * http://lisperator.net/uglifyjs/
 *
 * Released under the MIT license
 * https://raw.githubusercontent.com/shinsenter/defer.js/master/LICENSE
 *
 * MIT License
 *
 * Copyright (c) 2019 Mai Nhut Tan <shin@shin.company>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

(function(window, document) {

    // Method names
    var deferstyle_fn   = 'deferstyle';
    var deferimg_fn     = 'deferimg';
    var deferiframe_fn  = 'deferiframe';

    var JQUERY_NAME     = 'jQuery';
    var OBSERVER_CLASS  = 'IntersectionObserver';

    // Real attributes for lazy-loaded media
    var SRC     = 'src';
    var SRCSET  = 'srcset';
    var STYLE   = 'style';
    var DATA    = 'data';

    // Tag names
    var IFRAME  = 'IFRAME';
    var IMG     = 'IMG';
    var LINK    = 'LINK';

    // Tag attributes
    var LAZIED_CLASS    = 'lazied';
    var DATASET_PREFIX  = 'data-';
    var LAZY_SELECTOR   = DATASET_PREFIX + SRC;
    var LAZIED_SELECTOR = DATASET_PREFIX + LAZIED_CLASS;

    var APPEND_CHILD        = 'appendChild';
    var CLASS_NAME          = 'className';
    var CREATE_ELEMENT      = 'createElement';
    var FOR_EACH            = 'forEach';
    var GET_ELEMENT_BY_ID   = 'getElementById';
    var QUERY_SELECTOR_ALL  = 'querySelectorAll';
    var GET_ATTRIBUTE       = 'getAttribute';
    var SET_ATTRIBUTE       = 'setAttribute';

    // Common used constants
    var FALSE   = false;
    var NOOP    = Function();
    var defer   = window.defer || NOOP;

    /**
     * This is a placeholder for jQuery's `$(function() { })` calls.
     * It may be helpful when you want to lazy-load jQuery library.
     */
    if (!window[JQUERY_NAME]) {
        window.$ = window[JQUERY_NAME] = defer;
    }

    /**
     * This function will lazy-load stylesheet from given URL in `src` argument.
     * The tag id and delay time can be set in `id` and `delay` arguments.
     * Sometimes you may call a `callback` function when the file is loaded.
     *
     * @param   {string}        src         The file URL
     * @param   {string|false}  id          The tag id
     * @param   {integer}       delay       The delay time to create the tag
     * @param   {function}      callback    The callback function when load
     * @returns {void}
     */
    function deferstyle (src, id, delay, callback) {
        defer(function(dom) {
            if (!document[GET_ELEMENT_BY_ID](id)) {
                dom = document[CREATE_ELEMENT](LINK);
                dom.rel = 'stylesheet';

                if (id) {
                    dom.id = id;
                }

                if (callback) {
                    dom.onload = callback;
                }

                dom.href = src;
                document.head[APPEND_CHILD](dom);
            }
        }, delay);
    }

    /**
     * Returns a function to create lazy-load for `tagname` element.
     * For example: defermedia('img') with return a function to lazy-load
     *              creating a `<img>` tag.
     *
     * @param   {string}    tagname     The tag name (E.g. IMG, IFRAME)
     * @returns {function}              The returned function
     */
    function defermedia (tagname) {
        return function (query, delay, lazied_class, callback, options, attributes) {
            defer(function(observer, walker) {
                // This function marks item initialized, then applies the callback
                function filter(media){
                    if(media[GET_ATTRIBUTE](LAZIED_SELECTOR)) {return;}
                    media[SET_ATTRIBUTE](LAZIED_SELECTOR, tagname);
                    walker(media);
                }

                // This method sets the real attributes
                function display(media) {
                    if ((callback || NOOP).call(media, media) !== FALSE) {
                        (attributes || [SRCSET, SRC, DATA, STYLE])[FOR_EACH](function(attr, value) {
                            value = media[GET_ATTRIBUTE](DATASET_PREFIX + attr);
                            if (value) {media[attr] = value}
                        });
                    }
                    media[CLASS_NAME] += ' ' + (lazied_class || LAZIED_CLASS);
                }

                // Force using IntersectionObserver when posible
                // It class is the heart of media lazy-loading
                if (OBSERVER_CLASS in window) {
                    observer = new window[OBSERVER_CLASS](function(items) {
                        items[FOR_EACH](function(item, target) {
                            if (item.isIntersecting && (target = item.target)) {
                                observer.unobserve(target);
                                display(target);
                            }
                        });
                    }, options);

                    walker = observer.observe.bind(observer);
                } else {
                    walker = display;
                }

                [][FOR_EACH].call(document[QUERY_SELECTOR_ALL](query || tagname + '[' + LAZY_SELECTOR + ']:not([' + LAZIED_SELECTOR + '])'), filter);
            }, delay);
        }
    }

    // Export functions into the global scope
    window[deferstyle_fn]  = deferstyle;
    window[deferimg_fn]    = defermedia(IMG);
    window[deferiframe_fn] = defermedia(IFRAME);

})(this, document);
