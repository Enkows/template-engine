do (window) ->

  elements =
    'a abbr acronym address applet area article aside audio b base basefont bdi bdo bgsound big blink blockquote body br button canvas caption center cite code col colgroup content data datalist dd decorator del details dfn dir div dl dt em embed fieldset figcaption figure font footer form frame frameset h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins isindex kbd keygen label legend li link listing main map mark marquee menu menuitem meta meter nav nobr noframes noscript object ol optgroup option output p param plaintext pre progress q rp rt ruby s samp script section select shadow small source spacer span strike strong style sub summary sup table tbody td template textarea tfoot th thead time title tr track tt u ul var video wbr xmp'.split ' '

  voidElements =
    'area base br col command embed hr img input keygen link meta param source track wbr'.split ' '

  events =
    'blur change click dblckick error focus focusin focusout hover keydown keypress keyup load mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup resize scroll select submit unload'.split ' '

  attrAlias =
    '.': 'class'
    '#': 'id'
    '$': 'exports'

  subviewCounter = 0

# Base View Class
  class View

    for tagName in elements
      do (tagName) ->
        View[tagName] = (args...) ->
          @currentBuilder.tag tagName, args...

    @text: (string) ->
      @currentBuilder.text string

    @raw: (string) ->
      @currentBuilder.raw string

    @subview: (args...) ->
      @currentBuilder.subview args...

    @buildHTML: (fn) ->
      @currentBuilder = new Builder
      fn.call this
      @currentBuilder.buildHTML()

    @render: (args...) ->
      view = new this args...
      return view.view

    constructor: (args...) ->
      [html, subviewBinders] = @constructor.buildHTML -> @content args...
      @view = $ html
      @bindExports @view
      @bindEventHandlers @view
      subview @view for subview in subviewBinders

    bindExports: (view) ->
      selector = "[exports]"
      elements = view.find(selector).add view.filter(selector)
      elements.each ->
        element = $ this
        exports = element.attr 'exports'
        element.attr 'exports', null
        view[exports] =
          if view[exports]
            $.merge view[exports], element
          else
            element

    bindEventHandlers: (view) ->
      for eventName in events
        selector = "[#{eventName}]"
        elements = view.find(selector).add view.filter(selector)
        elements.each ->
          element = $ this
          method = element.attr eventName
          element.attr eventName, null
          element.on eventName, (event) -> view[method] event, element


  # Builder Class
  class Builder

    constructor: ->
      @documents = []
      @subviewBinders = []

    buildHTML: ->
      [@documents.join(''), @subviewBinders]

    parseOptions: (args) ->
      option = attr : {}
      for arg in args
        switch typeof arg
          when 'string'
            unless attrAlias[arg[0]]
              option.text = arg
            else
              for alias, attrName of attrAlias
                arg = arg.replace eval("/\\#{alias}/g"), ",#{attrName}:"
              attr = {}
              for argPair in arg[1..-1].split /,/
                [key, val] = argPair.split ':'
                attr[key] =
                  if attr[key]
                    attr[key] + " #{val}"
                  else
                    val
              $.extend option.attr, attr
          when 'number'
            option.text = arg.toString()
          when 'object'
            $.extend option.attr, arg
          when 'function'
            option.content = arg
      return option

    tag: (tagName, args...) ->
      options = @parseOptions args
      @openTag tagName, options.attr

      if tagName in voidElements then return
      options.content?()
      @text options.text       if options.text
      @text options.attr?.text if options.attr?.text
      @raw options.attr?.raw   if options.attr?.raw

      @closeTag tagName

    openTag: (tagName, attrs) ->
      attrPairs =
        for attrName, value of attrs
          if attrName in ['text', 'raw'] then continue
          "#{attrName}=\"#{value}\""

      attrString =
        if attrPairs.length
          " " + attrPairs.join ' '
        else
          ''

      @documents.push "<#{tagName}#{attrString}>"

    closeTag: (tagName) ->
      @documents.push "</#{tagName}>"

    text: (string) ->
      string = string
        .replace /&/g, '&amp;'
        .replace /</g, '&lt;'
        .replace />/g, '&gt;'
        .replace /'/g, '&#39;'
        .replace /"/g, '&quot;'
      @documents.push string

    raw: (string) ->
      @documents.push string

    subview: (args...) ->
      if args.length is 1
        subview = args[0]
      else
        [exports, subview] = args
      subviewId = "subview-#{++subviewCounter}"
      @tag 'span', id: subviewId
      @subviewBinders.push (view) ->
        subview.parentView = view
        view[exports] = subview if exports
        view.find("span##{subviewId}").replaceWith subview

  window.View = View


