
jiax.Event = Object.extend(function (Class) {



    var all = Class.all = Object.create(null);


    
    this.type = '';


    this.target = null;


    this.cancelBubble = false;

    
    this.defaultPrevented = false;



    this.stop = function () {

        this.cancelBubble = true;
    }


    this.prevent = function () {

        this.defaultPrevented = true;
    }



    Class.register = function (name) {

        if (name || (name = this.prototype.type))
        {
            all[name] = this;
        }
    }

    
});

