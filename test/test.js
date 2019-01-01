const proxio = require('../');

describe('proxio', function () {
    it('should be ok', function () {
        const myObj = {};
        const myProxy = proxio(myObj, (changes) => {
            //console.log('change', changes)
        });
        myProxy.myProp = {a: 1};

        console.log(myProxy);

        //myProxy.myProp.a = 2;
    })
});