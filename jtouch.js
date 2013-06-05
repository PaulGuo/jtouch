/*
 * jtouch.js - http://jtouch.org
 * -----------------------------------------------------------
 * Forgetting the past and looking forward to what lies ahead.
 * -----------------------------------------------------------
 * Since 2013-06-01
 * */

(function() {

    "use strict";

    var jtouch;

    jtouch = function() {
        this.init.apply(this, arguments);
    };

    jtouch.app = function(container) {
        return new jtouch(container);
    };

    jtouch.prototype = {
        init: function(container) {
            this.views = [];
            this.slider = new PageSlider(container);
        },

        view: function(name, url, handler) {
            var that = this;

            this.views[name] = {
                name: name,
                url: url,
                handler: handler,
                show: function(callback) {
                    var _this = this;
                    var _handler = that.io.push(this.handler);

                    seajs.use(this.handler, function(handler) {
                        var view_req;

                        that.io.pop(_handler);

                        if(_this._beforeshow.length) {
                            $.each(_this._beforeshow, function(i, o) {
                                o.call(_this, handler);
                            });
                        }

                        that.io.ajax({
                            url: _this.url,
                            context: _this,

                            success: function(resp) {
                                var _view = $(resp);
                                var _cur = $(that.selector);

                                _view.attr('id', this.name);
                                _view.removeClass('current');
                                _cur.after(_view);

                                window.scrollTo(0, 0);
                                that.slider.slidePage(_view);
                                callback && callback.call(this, handler);
                            },

                            complete: function() {}
                        });

                        that.io.onend(function() {
                            //jQT.goTo('#' + _this.name, 'slideleft');
                        });

                    });
                },

                _beforeshow: [],
                beforeshow: function(fn) {
                    this._beforeshow.push(fn);
                }
            };

            return this.views[name];
        },

        route: function() {
            jHash.route.apply(jHash, arguments);
        },

        start: function() {
            jHash.processRoute.apply(jHash, arguments);
        }
    };

    Events.mixTo(jtouch);

    this.jtouch = jtouch;

}).call(this);

// IO

(function() {

    jtouch.prototype.io = {
        queue: {},
        abort: function() {
            var that = this;

            $.each(this.queue, function(i, o) {
                if(o.hasOwnProperty('abort')) {
                    o.abort();
                }

                that.pop(i);
            });
        },

        push: function(req) {
            var uuid = new Date().getTime() + '_' + parseInt(Math.random() * 1000);
            this.queue[uuid] = req;
            return uuid;
        },

        pop: function(uuid) {
            var _delete = delete this.queue[uuid];

            if(!this.length()) {
                if(this._onend.length) {
                    $.each(this._onend, function(i, o) {
                        o.call(this);
                    });
                }
            }

            return _delete;
        },

        length: function() {
            return Object.keys(this.queue).length;
        },

        ajax: function(opt) {
            var that = this;
            var uuid;

            opt.url += '?t=' + Math.random();

            uuid = this.push($.ajax({
                    url: opt.url,
                    context: opt.context,
                    success: opt.success,
                    complete: function() {
                        opt.complete && opt.complete();
                        that.pop(uuid);
                    }
                })
            );
        },

        _onend: [],
        onend: function(fn) {
            this._onend.push(fn);
        }
    };

}).call(this);
