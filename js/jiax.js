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




jiax.Observe = Object.extend.call({}, function (Class) {



    var $Event = jiax.Event;

    var $Events = Event.all;

    var $events = jiax.events = Object.create(null);

    var $watches = jiax.watches = Object.create(null);


    var components = jiax.components = Object.create(null);

    var observes = jiax.observes = Object.create(null);


    var scheduler = jiax.scheduler = [];

    var delay = 0;


    var uuid = 1;



    scheduler.start = function (observe) {

        if (scheduler[0])
        {
            delay = setTimeout(scheduler.execute, 0);
        }

        return observe.$changes = {};
    }


    scheduler.clear = function () {

        if (delay)
        {
            clearTimeout(delay);
            delay = 0;
        }

        scheduler.length = 0;
    }




    Class.ctor = function (parent, data) {

        var convertor;

        for (var name in data)
        {
            switch (name)
            {
                case 'parent':
                case 'constructor':
                    alert('属性名不能是"parent"或"constructor"!');
                    break;

                case 'children':
                    this.children.load(data[name]);
                    break;

                default:
                    if (convertor = this['__x__' + name])
                    {
                        this['__' + name] = convertor(data[name]);
                    }
                    else
                    {
                        this[name] = data[name];
                    }
                    break;
            }
        }

        this.parent = parent || null;
        observes[this.$uuid = uuid++] = this;
    }


    Class.register = function (name) {

        if (name)
        {
            components[this.name = this.prototype.$type = name] = this;
        }
    }



    function to_boolean(value) {
        
        return !!value;
    }


    function to_integer(value) {

        return value | 0;
    }


    function to_number(value) {

        return +value || 0;
    }


    function to_string(value) {

        return '' + value;
    }


    function to_date(value) {

        return new Date(value);
    }


    function to_observe(Observe) {

        return function (value) {

            return value instanceof Observe ? value : new Observe(this);
        }
    }


    function build(name, options) {

        var type = options.type,
            defaultValue = options.defaultValue,
            convertor = options.convertor,
            alias = options.alias || (options.alias = name),
            key = '__' + name;

        if (defaultValue === void 0)
        {
            options.defaultValue = defaultValue = null;
        }

        if (!type)
        {
            options.type = type = typeof defaultValue;
        }

        switch (type)
        {
            case 'boolean':
                this[key] = defaultValue;
                options.get = build_value_get(key, alias);
                options.set = build_value_set(name, key, alias, convertor || (convertor = to_boolean));
                break;

            case 'int':
            case 'integer':
                this[key] = defaultValue;
                options.get = build_value_get(key, alias);
                options.set = build_value_set(name, key, alias, convertor || (convertor = to_integer));
                break;

            case 'number':
                this[key] = defaultValue;
                options.get = build_value_get(key, alias);
                options.set = build_value_set(name, key, alias, convertor || (convertor = to_number));
                break;

            case 'string':
                this[key] = defaultValue;
                options.get = build_value_get(key, alias);
                options.set = build_value_set(name, key, alias, convertor || (convertor = to_string));
                break;

            case 'date':
                this[key] = defaultValue;
                options.get = build_value_get(key, alias);
                options.set = build_value_set(name, key, alias, convertor || (convertor = to_date));
                break;

            default:
                convertor = to_observe(type = components[type] || Class);
                options.get = build_observe_get(key, alias, type);
                options.set = build_observe_set(name, key, alias, type);
                break;
        }
        
        this['__x_' + key] = options.convertor = convertor;
        this['__y_' + key] = options;
    }



    function build_value_get(name, alias) {

        return function () {

            var value = this.$changes;
            return value && (value = value[alias]) !== void 0 ? value : this[name];
        }
    }

    
    function build_value_set(name, key, alias, convertor) {

        return function (value) {

            var target = this.$changes,
                watches;

            if (convertor)
            {
                value = convertor(value);
            }

            if (value !== this[key])
            {
                (target || scheduler.start(this))[alias] = value;
            }
            else if (target && alias in target)
            {
                delete target[alias];
            }
            else
            {
                return;
            }

            if (watches = $watches[name])
            {
                target = this;

                do
                {
                    if (watches[target.$uuid])
                    {
                        this.$notify(name, value, this[key], target);
                        break;
                    }
                }
                while (target = target.parent);
            }
        }
    }


    function build_observe_get(name, alias, Observe) {

        return function () {

            var changes = this.$changes,
                value;

            if (changes)
            {
                if (value = changes[alias])
                {
                    return value;
                }

                return changes[alias] = new Observe(this);
            }

            return this[name] = new Observe(this);
        }
    }


    function build_observe_set(name, key, alias, Observe) {

        return function (value) {

            var watches;

            value = new Observe(this, value);

            (this.$changes || scheduler.start(this))[alias] = observe;

            if (watches = $watches[name])
            {
                target = this;

                do
                {
                    if (watches[target.$uuid])
                    {
                        this.$notify(name, value, this[key], target);
                        break;
                    }
                }
                while (target = target.parent);
            }
        }
    }



    // 定义属性
    this.$properties = function (properties) {

        if (properties)
        {
            var define = Object.defineProperty;

            for (var name in properties)
            {
                var item = properties[name];

                if (item == null)
                {
                    item = { defaultValue: null };
                }
                else if (typeof item !== 'object')
                {
                    item = { defaultValue: item };
                }
                
                build.call(this, name, item);

                define(this, name, item);
            }
        }
    }


    this.$watch = function (name, listener) {

        if (name && typeof listener === 'function')
        {
            var watches = $watches[name] || ($watches[name] = {}),
                id = this.$uuid;

            (watches[id] || (watches[id] = [])).push(listener);
        }
    }


    this.$unwatch = function (name, listener) {

        var id = this.$uuid,
            watches,
            items;

        if (!name)
        {
            watches = $watches;

            for (name in watches)
            {
                delete watches[name][id];
            }
        }
        else if (watches = $watches[name])
        {
            if (listener)
            {
                if (items = watches[name])
                {
                    for (var i = items.length; i--;)
                    {
                        if (items[i] === listener)
                        {
                            items.splice(i, 1);
                        }
                    }

                    if (!items.length)
                    {
                        watches[name] = null;
                    }
                }
            }
            else
            {
                watches[name] = null;
            }
        }
    }


    this.$notify = function (name, value, oldValue) {

        var watches = $watches[name];

        if (watches)
        {
            var target = arguments[3] || this,
                items,
                index,
                event,
                fn;

            do
            {
                if (items = watches[target.$uuid])
                {
                    index = 0;

                    while (fn = items[index++])
                    {
                        if (!event)
                        {
                            event = {
                                target: this,
                                name: name,
                                value: value,
                                oldValue: oldValue
                            };
                        }

                        if (fn.call(this, event) === false)
                        {
                            return false;
                        }
                    }
                }
            }
            while (target = target.parent);
        }
        
        return true;
    }


    
    this.$on = function (type, listener) {
        
        if (type && typeof listener === 'function')
        {
            var events = $events[type] || ($events[type] = {}),
                id = this.$uuid;

            (events[id] || (events[id] = [])).push(listener);
        }
    }


    this.$once = function (type, listener) {

        if (typeof listener === 'function')
        {
            function callback(event) {

                listener.call(this, event);
                this.$off(type, callback);
            }

            this.$on(type, callback);
        }
    }


    this.$off = function (type, listener) {
        
        var id = this.$uuid,
            events,
            items;

        if (!type)
        {
            events = $events;

            for (type in events)
            {
                delete events[type][id];
            }
        }
        else if (events = $events[type])
        {
            if (listener)
            {
                if (items = events[type])
                {
                    for (var i = items.length; i--;)
                    {
                        if (items[i] === listener)
                        {
                            items.splice(i, 1);
                        }
                    }
    
                    if (!items.length)
                    {
                        events[type] = null;
                    }
                }
            }
            else
            {
                events[type] = null;
            }
        }
    }


    this.$trigger = function (type, payload) {
        
        var events = $events[type];

        if (events)
        {
            var target = arguments[2] || this,
                items,
                index,
                event,
                fn;

            do
            {
                if (items = events[target.$uuid])
                {
                    index = 0;

                    while (fn = items[index++])
                    {
                        if (!event)
                        {
                            event = new ($Events[type] || $Event)();
                            event.target = this;

                            if (payload)
                            {
                                Object.assign(event, payload);
                            }
                        }

                        if (fn.call(target, event) === false)
                        {
                            event.defaultPrevented = true;
                        }
        
                        if (event.cancelBubble)
                        {
                            return !event.defaultPrevented;
                        }
                    }
                }
            }
            while ((fn = this.parent) && (target = target[fn]));

            return !event.defaultPrevented;
        }
        
        return true;
    }



    // 提交变更
    this.$commit = function () {

    }


    // 回滚变更
    this.$rollback = function () {

    }



    this.$destroy = function () {

        this.$off();
        delete observes[this.$uuid];
    }


});



(function (jiax, ObserveArray) {



    var base = Array.prototype;

    var prototype = ObserveArray.prototype = Object.create(base);

    var scheduler = jiax.scheduler.start;


    

    function checkItems(owner, items, list, index) {

        var length = items.length;

        list = [];

        (owner.$changes || scheduler(owner)).children |= 1;

        while (index < length)
        {
            list.push(new Class(owner, items[index++]));
        }

        return list;
    }
    


    prototype.push = function () {

        if (arguments.length > 0)
        {
            return base.push.apply(this, checkItems(this.owner, arguments, [], 0));
        }

        return this.length;
    }


    prototype.pop = function () {

        var item = base.pop.call(this);

        if (item)
        {
            (this.owner.$changes || scheduler(this.owner)).children |= 2;
        }

        return item;
    }


    prototype.unshift = function () {

        if (arguments.length > 0)
        {
            return base.unshift.apply(this, checkItems(this.owner, arguments, [], 0));
        }

        return this.length;
    }


    prototype.shift = function () {

        var item = base.shift.call(this);

        if (item)
        {
            (this.owner.$changes || scheduler(this.owner)).children |= 2;
        }

        return item;
    }


    prototype.splice = function (index, length) {

        var owner = this.owner,
            list;

        switch (arguments.length)
        {
            case 0:
                return [];

            case 1:
                base.splice.call(this, index);
                break;

            case 2:
                base.splice.call(this, index, length);
                break;

            default:
                list = checkItems(owner, arguments, [index, length], 2);
                list = base.splice.apply(this, list);
                break;
        }

        if (list.length > 0)
        {
            (owner.$changes || scheduler(owner)).children |= 2;
        }

        return list;
    }


    prototype.clear = function () {

        if (this.length > 0)
        {
            (this.owner.$changes || scheduler(this.owner)).children |= 2;
            return base.splice.call(this, 0);
        }

        return [];
    }


    prototype.sort = function (sortby) {

        if (this.length > 0)
        {
            base.sort.call(this, fn);
            (this.owner.$changes || scheduler(this.owner)).children |= 4;
        }

        return this;
    }


    prototype.reverse = function () {

        if (this.length > 0)
        {
            base.reverse.call(this);
            (this.owner.$changes || scheduler(this.owner)).children |= 4;
        }

        return this;
    }



})(jiax, jiax.ObserveArray = function ObserveArray(owner, data) {

    var length;

    this.owner = owner;

    if (data && (length = data.length) > 0)
    {
        var Class = owner.$subtype || jiax.Observe,
            index = this.length;

        for (var i = 0; i < length; i++)
        {
            this[index++] = new Class(owner, data[i]);
        }

        this.length = index;
        this.original = array.slice.call(this, 0);
    }
    else
    {
        this.original = [];
    }

});



jiax.Style = jiax.Observe.extend(function (Class) {



    Class.ctor = function (parent) {

        this.parent = parent;
    }

    

    this.$properties((function () {

        var properties = {},
            style = document.documentElement.style,
            regex = /^(?:webkit|ms|moz|o)([A-Z])/;

        function replace(_, key) {

            return key.toLowerCase();
        }

        for (var name in style)
        {
            switch (name)
            {
                case 'cssFloat':
                case 'styleFloat':
                    properties.float = { alias: name, defaultValue: '' };
                    break;

                case 'cssText':
                    break;

                default:
                    properties[name.replace(regex, replace)] = { alias: name, defaultValue: '' };
                    break;
            }
        }

        return properties;

    })());



});



