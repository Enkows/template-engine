var Demo, SubDemo, demo, _ref, _ref1,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Demo = (function(_super) {
  __extends(Demo, _super);

  function Demo() {
    _ref = Demo.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Demo.content = function(param) {
    var _this = this;
    return this.header('#header.head.visible', '$head', function() {
      _this.div(param.title, {
        click: 'demoClick'
      });
      return _this.nav('.wrapper.top', '$wrapper', function() {
        _this.subview('subview', SubDemo.render(param.subTitle));
        return _this.ul('.second', function() {
          _this.li(function() {
            return _this.a('.icon-link.message-link', '消息', {
              'href': '#!/message/list?target=story'
            });
          });
          return _this.li(function() {
            return _this.a('.icon-link.message-link', '账号', {
              'href': '#!/account/profile'
            });
          });
        });
      });
    });
  };

  Demo.prototype.demoClick = function() {
    event.preventDefault();
    return console.log('demo click');
  };

  return Demo;

})(View);

SubDemo = (function(_super) {
  __extends(SubDemo, _super);

  function SubDemo() {
    _ref1 = SubDemo.__super__.constructor.apply(this, arguments);
    return _ref1;
  }

  SubDemo.content = function(param) {
    var _this = this;
    this.div(param, {
      click: 'demoClick'
    });
    return this.ul('.master', '$master', function() {
      _this.li(function() {
        return _this.a({
          href: '#'
        }, '首页');
      });
      _this.li(function() {
        return _this.a({
          href: '#!/feed'
        }, '动态');
      });
      return _this.li(function() {
        return _this.a({
          href: '#!/story'
        }, '故事');
      });
    });
  };

  SubDemo.prototype.demoClick = function() {
    return console.log('sub view click');
  };

  return SubDemo;

})(View);

demo = Demo.render({
  title: 'demo',
  subTitle: 'sub demo'
});

$('#main').append(demo);
