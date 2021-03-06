class Demo extends View
  @content: (param) ->
    @header '#header.head.visible', '$head', =>
      @div param.title, click: 'demoClick'
      @nav '.wrapper.top', '$wrapper', =>
        @subview 'subview', SubDemo.render param.subTitle
        @ul '.second', =>
          @li =>
            @a '.icon-link.message-link', '消息', 'href': '#!/message/list?target=story'
          @li =>
            @a '.icon-link.message-link', '账号', 'href': '#!/account/profile'

  demoClick: ->
    event.preventDefault()
    console.log 'demo click'

class SubDemo extends View
  @content: (param) ->
    @div param, click: 'demoClick'
    @ul '.master', '$master', =>
      @li =>
        @a href: '#', '首页'
      @li =>
        @a href: '#!/feed', '动态'
      @li =>
        @a href: '#!/story', '故事'

  demoClick: ->
    console.log 'sub view click'

demo = Demo.render title: 'demo', subTitle: 'sub demo'

$('#main').append demo