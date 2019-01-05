const Proxio = require('../');

describe('proxio', function () {
    it('should be ok', function () {
        const myObj = {};
        const myProxy = Proxio.create(myObj,
            change => {

                console.log(change);

                if (change.property === 'b')
                    change.newValue *= 5;

                return true
            },
            (value, prop, path) => {
                if (prop === 'b')
                    return value * 5;
                else
                    return value;
            }
        );
        myProxy.myProp = {a: 1};
        myProxy.myProp.a = {b: 5, c: [1, {d: 2}, 3]};
        myProxy.myProp.a.b = 6;
        myProxy.myProp.a.c[1].d = 5;

    })
});