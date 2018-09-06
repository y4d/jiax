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
