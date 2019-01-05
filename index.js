"use strict";

/**
 * Simple utility function to add a new property to an existing object path.  Examples:
 *
 * - getPath('obj.nested', 'prop') => 'obj.nested.prop'
 * - getPath('', 'prop') => 'prop'
 */
function getPath(path, prop) {
    if (path.length !== 0)
        return path + "." + prop;
    else
        return prop;
}

module.exports = (function () {
    function _create(target, validator, manipulator, path, lastInPath) {
        // Keeps track of the proxies we've already made so that we don't have to recreate any.
        const proxies = {};

        const proxyHandler = {
            get(target, prop) {
                // Special properties
                if (prop === '__target')
                    return target;
                if (prop === '__isProxy')
                    return true;
                // Cache target[prop] for performance
                let value = target[prop];
                // Functions
                if (typeof value === 'function') {
                    return function () {
                        const args = [];
                        for (let _i = 0; _i < arguments.length; _i++) {
                            args[_i] = arguments[_i];
                        }
                        if (validator({
                            currentPath: path,
                            property: lastInPath,
                            target,
                            type: 'function',
                            function: prop,
                            arguments: args
                        })) {
                            // If `this` is a proxy, be sure to apply to __target instead
                            return value.apply(this.__isProxy ? this.__target : this, args);
                        }
                    };
                } // Objects
                else if (typeof value === 'object' && value !== null && target.hasOwnProperty(prop)) {
                    // Return existing proxy if we have one, otherwise create a new one
                    let existingProxy = proxies[prop];
                    if (existingProxy && existingProxy.__target === value) {
                        return existingProxy;
                    }
                    else {
                        const proxy = _create(value, validator, manipulator, getPath(path, prop), prop);
                        proxies[prop] = proxy;
                        return proxy;
                    }
                }
                // All else
                else {
                    return value;
                }
            },
            set(target, prop, value) {

                const previousValue = target[prop];
                const currentPath = getPath(path, prop);

                if (typeof manipulator === 'function') {
                    value = manipulator(value, prop, currentPath);
                }

                if (validator({
                    currentPath,
                    target,
                    type: previousValue === undefined ? 'add' : 'update',
                    property: prop,
                    newValue: value,
                    previousValue
                })) {
                    target[prop] = value;
                }
                return true;
            },
            deleteProperty(target, prop) {

                const previousValue = target[prop];

                if (validator({
                    currentPath: getPath(path, prop),
                    target,
                    type: 'delete',
                    property: prop,
                    newValue: null,
                    previousValue
                })) {
                    delete target[prop];
                }
                return true;
            }
        };
        return new Proxy(target, proxyHandler);
    }
    return {
        create(target, validator, manipulator) {
            return _create(target, validator, manipulator, '', '');
        }
    };
})();