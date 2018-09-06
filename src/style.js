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
