class Proxio {

    constructor(target, opts = {}) {

        this.opts = Object.assign({}, opts);

        return new Proxy(target, {
            set: (obj, prop, value) => {
                const oldValue = obj[prop];

                if (oldValue !== value) {
                    if (value && typeof value === 'object') {
                        value = new Proxio(value, this.opts);
                    }
                    obj[prop] = value;
                    if (typeof this.opts.onChange === 'function')
                        this.opts.onChange(value, oldValue);
                }

            }
        });
    }

}

module.exports = Proxio;