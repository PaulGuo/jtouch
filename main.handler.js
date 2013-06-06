define(function(require, exports, module) {

    var handler = function() {
        this.init.apply(this, arguments);
    };

    handler.prototype = {
        init: function() {
            var that = this;

            Events.mixTo(this);
            this.on('load', function() {
                console.log('i am loaded.');
                console.log('my view is:');
                console.log(that.view);
            });
        }
    };

    module.exports = new handler();

});
