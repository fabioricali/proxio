const Proxio = require('../');

describe('proxio', function () {
    it('should be ok', function () {
        const myObj = {};
        const myProxy = new Proxio(myObj, {
            onChange(value, oldValue) {
                console.log(value, oldValue)
            }
        });
        myProxy.myProp = {a: 1};
        myProxy.myProp.a = 2;
    })
});