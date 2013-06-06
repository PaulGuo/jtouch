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
            this.slider = new PageSlider(container);
            this.view = new jtouch.view(this);
            this.views = this.view.views;
            this.io = new jtouch.io(this);
            this.events = new Events();
        },

        route: function() {
            jHash.route.apply(jHash, arguments);
        },

        start: function() {
            jHash.processRoute.apply(jHash, arguments);
        }
    };

    this.jtouch = jtouch;

}).call(this);

// VIEWS

(function() {

    jtouch.view = function(superthis) {
        this.init.apply(this, arguments);
    };

    jtouch.view.prototype = {
        init: function(superthis) {
            this.views = [];
            this.superthis = superthis;
        },

        create: function(name, url, handler) {
            var that = this;
            var view = {};

            view.name = name;
            view.url = url;
            view.handler = handler;
            view.show = function(callback) {
                var _this = this;
                var _handler = that.superthis.io.push(this.handler);

                seajs.use(this.handler, function(handler) {
                    var view_req;

                    that.superthis.io.pop(_handler);
                    _this.trigger('beforeshow');

                    that.superthis.io.ajax({
                        url: _this.url,
                        context: _this,

                        success: function(resp) {
                            var _view = $(resp);
                            var _cur = $(that.selector);

                            _view.attr('id', this.name);
                            _view.removeClass('current');
                            _cur.after(_view);

                            window.scrollTo(0, 0);
                            that.superthis.slider.slidePage(_view);
                            callback && callback.call(this, handler);
                        },

                        complete: function() {}
                    });

                    that.superthis.io.on('end', function() {
                        // 
                    });

                });
            };

            Events.mixTo(view);
            this.views[name] = view;
            return this.views[name];
        }
    };

}).call(this);

// IO

(function() {

    jtouch.io = function(superthis) {
        this.init.apply(this, arguments);
    };

    jtouch.io.prototype = {
        init: function(superthis) {
            this.queue = {};
            this.superthis = superthis;
            Events.mixTo(this);
        },

        abort: function() {
            var that = this;

            $.each(this.queue, function(uuid, req) {
                if(req.hasOwnProperty('abort')) {
                    req.abort();
                }

                that.pop(uuid);
            });
        },

        push: function(req) {
            var uuid = new Date().getTime() + '_' + parseInt(Math.random() * 1000);
            this.queue[uuid] = req;
            this.trigger('loading');
            return uuid;
        },

        pop: function(uuid) {
            var _delete = delete this.queue[uuid];

            if(!this.length()) {
                this.trigger('end');
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
        }
    };

}).call(this);
