var jiax = Object.create(null);


Object.extend = function (fn) {
	
    var base = this.prototype || null,
        prototype = Object.create(base),
        ctor;

    function Class() {
		
		if (ctor)
		{
			ctor.apply(this, arguments);
		}
	}
	
	prototype.constructor = Class;

    Class.ctor = this.ctor;
    Class.register = this.register;
    Class.extend = this.extend || Object.extend;
    Class.prototype = prototype;

    if (fn)
    {
        fn.call(prototype, Class, base);
    }

    ctor = Class.ctor;
	
	return Class;
}

