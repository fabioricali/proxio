'use strict';

const blacklist = [
    'sort',
    'reverse',
    'splice',
    'pop',
    'unshift',
    'shift',
    'push'
];

module.exports = (object, onChange) => {
    let isBlocked = false;

    const handler = {
        get(target, property, receiver) {
            let result;
            try {
                result = new Proxy(target[property], handler);
            } catch (_) {
                console.error(_);
                result = Reflect.get(target, property, receiver);
            }
            return result;
        },
        defineProperty(target, property, descriptor) {
            const newValue = descriptor.value;
            const previousValue = target[property];

            if(newValue === previousValue) return false;

            const result = Reflect.defineProperty(target, property, descriptor);

            if (!isBlocked) {

                const changes = {
                    target,
                    type: previousValue === undefined ? 'add' : 'update',
                    property,
                    newValue,
                    previousValue,
                    currentPath: ''
                };

                onChange(changes);
            }

            return result;
        },
        deleteProperty(target, property) {
            const newValue = undefined;
            const oldValue = target[property];

            const result = Reflect.deleteProperty(target, property);

            if (!isBlocked) {
                onChange(newValue, oldValue);
            }

            return result;
        },
        apply(target, thisArg, argumentsList) {
            if (blacklist.includes(target.name)) {
                isBlocked = true;
                const result = Reflect.apply(target, thisArg, argumentsList);
                onChange();
                isBlocked = false;
                return result;
            }

            return Reflect.apply(target, thisArg, argumentsList);
        }
    };

    return new Proxy(object, handler);
};