var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

(function(window) {
  var Builder, View, attrAlias, elements, events, subviewCounter, voidElements;
  elements = 'a abbr acronym address applet area article aside audio b base basefont bdi bdo bgsound big blink blockquote body br button canvas caption center cite code col colgroup content data datalist dd decorator del details dfn dir div dl dt em embed fieldset figcaption figure font footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins isindex kbd keygen label legend li link listing main map mark marquee menu menuitem meta meter nav nobr noframes noscript object ol optgroup option output p param plaintext pre progress q rp rt ruby s samp script section select shadow small source spacer span strike strong style sub summary sup table tbody td template textarea tfoot th thead time title tr track tt u ul var video wbr xmp'.split(' ');
  voidElements = 'area base br col command embed hr img input keygen link meta param source track wbr'.split(' ');
  events = 'blur change click dblckick error focus focusin focusout hover keydown keypress keyup load mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup resize scroll select submit unload'.split(' ');
  attrAlias = {
    '.': 'class',
    '#': 'id',
    '$': 'exports'
  };
  subviewCounter = 0;
  View = (function(_super) {
    __extends(View, _super);

    elements.forEach(function(tagName) {
      return View[tagName] = function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return (_ref = this.currentBuilder).tag.apply(_ref, [tagName].concat(__slice.call(args)));
      };
    });

    View.text = function(string) {
      return this.currentBuilder.text(string);
    };

    View.raw = function(string) {
      return this.currentBuilder.raw(string);
    };

    View.subview = function() {
      var args, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return (_ref = this.currentBuilder).subview.apply(_ref, args);
    };

    View.buildHTML = function(fn) {
      this.currentBuilder = new Builder;
      fn.call(this);
      return this.currentBuilder.buildHTML();
    };

    function View() {
      var args, html, subview, subviewBinders, _i, _len, _ref;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref = this.constructor.buildHTML(function() {
        return this.content.apply(this, args);
      }), html = _ref[0], subviewBinders = _ref[1];
      this.constructor.fn.init.call(this, html);
      this.bindExports(this);
      this.bindEventHandlers(this);
      for (_i = 0, _len = subviewBinders.length; _i < _len; _i++) {
        subview = subviewBinders[_i];
        subview(this);
      }
    }

    View.prototype.bindExports = function(view) {
      var selector;
      selector = "[exports]";
      elements = view.find(selector).add(view.filter(selector));
      return elements.each(function() {
        var element, exports;
        element = $(this);
        exports = element.attr('exports');
        element.attr('exports', null);
        return view[exports] = view[exports] ? $.merge(view[exports], element) : element;
      });
    };

    View.prototype.bindEventHandlers = function(view) {
      return events.forEach(function(eventName) {
        var selector;
        selector = "[" + eventName + "]";
        elements = view.find(selector).add(view.filter(selector));
        return elements.each(function() {
          var element, method;
          element = $(this);
          method = element.attr(eventName);
          element.attr(eventName, null);
          return element.on(eventName, function(event) {
            return view[method](event, element);
          });
        });
      });
    };


    /*
    # 覆盖 jQuery 的 pushStack 和 end 方法
    */

    View.prototype.pushStack = function(elems) {
      var ret;
      ret = jQuery.merge(jQuery(), elems);
      ret.prevObject = this;
      ret.context = this.context;
      return ret;
    };

    View.prototype.end = function() {
      return this.prevObject || jQuery(null);
    };

    return View;

  })(jQuery);
  Builder = (function() {
    function Builder() {
      this.documents = [];
      this.subviewBinders = [];
    }

    Builder.prototype.buildHTML = function() {
      return [this.documents.join(''), this.subviewBinders];
    };

    Builder.prototype.parseOptions = function(args) {
      var option;
      option = {
        attr: {}
      };
      args.forEach(function(arg) {
        var alias, attrName;
        switch (typeof arg) {
          case 'string':
            if (!attrAlias[arg[0]]) {
              return option.text = arg;
            } else {
              for (alias in attrAlias) {
                attrName = attrAlias[alias];
                arg = arg.replace(eval("/\\" + alias + "/g"), "\",\"" + attrName + "\":\"");
              }
              arg = '{' + arg.slice(2) + '"}';
              return $.extend(option.attr, JSON.parse(arg));
            }
            break;
          case 'number':
            return option.text = arg.toString();
          case 'object':
            return $.extend(option.attr, arg);
          case 'function':
            return option.content = arg;
        }
      });
      return option;
    };

    Builder.prototype.tag = function() {
      var args, options, tagName, _ref, _ref1, _ref2, _ref3;
      tagName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      options = this.parseOptions(args);
      this.openTag(tagName, options.attr);
      if (__indexOf.call(voidElements, tagName) >= 0) {
        return;
      }
      if (typeof options.content === "function") {
        options.content();
      }
      if (options.text) {
        this.text(options.text);
      }
      if ((_ref = options.attr) != null ? _ref.text : void 0) {
        this.text((_ref1 = options.attr) != null ? _ref1.text : void 0);
      }
      if ((_ref2 = options.attr) != null ? _ref2.raw : void 0) {
        this.raw((_ref3 = options.attr) != null ? _ref3.raw : void 0);
      }
      return this.closeTag(tagName);
    };

    Builder.prototype.openTag = function(tagName, attrs) {
      var attrName, attrPairs, attrString, value;
      attrPairs = (function() {
        var _results;
        _results = [];
        for (attrName in attrs) {
          value = attrs[attrName];
          if (attrName === 'text' || attrName === 'raw') {
            continue;
          }
          _results.push("" + attrName + "=\"" + value + "\"");
        }
        return _results;
      })();
      attrString = attrPairs.length ? " " + attrPairs.join(' ') : '';
      return this.documents.push("<" + tagName + attrString + ">");
    };

    Builder.prototype.closeTag = function(tagName) {
      return this.documents.push("</" + tagName + ">");
    };

    Builder.prototype.text = function(string) {
      string = string.replace(/&/g, '&amp;'.replace(/</g, '&lt;'.replace(/>/g, '&gt;'.replace(/'/g, '&#39;'.replace(/"/g, '&quot;')))));
      return this.documents.push(string);
    };

    Builder.prototype.raw = function(string) {
      return this.documents.push(string);
    };

    Builder.prototype.subview = function() {
      var args, exports, subview, subviewId;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (args.length === 1) {
        subview = args[0];
      } else {
        exports = args[0], subview = args[1];
      }
      subviewId = "subview-" + (++subviewCounter);
      this.tag('span', {
        id: subviewId
      });
      return this.subviewBinders.push(function(view) {
        subview.parentView = view;
        if (exports) {
          view[exports] = subview;
        }
        return view.find("span#" + subviewId).replaceWith(subview);
      });
    };

    return Builder;

  })();
  return window.View = View;
})(window);
