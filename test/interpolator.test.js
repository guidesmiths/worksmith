/// <reference path="../typings/mocha/mocha.d.ts"/>
var assert = require('assert')
var interpolator = require('../src/interpolation')
var worksmith = require('../')

describe("interpolator", function() {
describe("interpolator parser", function() {
    it("should find tags in a text", function() {
        var mark = "abc[123]def[/123]hij"
        var parsed = interpolator.parse(mark) 
        assert.equal(parsed[0](),"abc")
        assert.deepEqual(parsed[1].source,{tag:"123", content:"def"})
        assert.equal(parsed[2](),"hij")
    })
    it("should work with a sole tag", function() {
        var mark = "[123]def[/123]"
        var parsed = interpolator.parse(mark) 
        assert.deepEqual(parsed[0].source,{tag:"123", content:"def"})
    })
})
describe("interpolator v1 interpolation", function() {
    it("should return a string constant", function() {
        assert.equal(interpolator.interpolate({a:1},"alma"),"alma")
    })
    it("should return a simple context reference", function() {
        assert.equal(interpolator.interpolate({a:1},"@a"),1)
    })
    it("should return the context for '@'", function() {
        var ctx = {a:1};
        assert.equal(interpolator.interpolate(ctx,"@"),ctx)
    })
    it("should support the {template:...} clause", function() {
        var ctx = {a:1};
        assert.ok(interpolator.interpolate(ctx,{template:"{{a}}"}) === "1")
    })
    it("should return a number constant", function() {
        var ctx = {a:1};
        assert.equal(interpolator.interpolate(ctx,100),100)
    })
    it("should return a regex constant", function() {
        var ctx = {}
        var v = /x/
        assert.equal(interpolator.interpolate(ctx,v),v)
    })

})

describe("interpolator - object interpolation", function() {
    it("should support object type", function() {
        assert.equal(interpolator.interpolate({a:1},{ abc: "@a" }).abc,1)
    })
    it("should support nested object type", function() {
        assert.equal(interpolator.interpolate({a:1, b:2},{ abc: "@a", def:{ghi: "@b"} }).abc,1)
        assert.equal(interpolator.interpolate({a:1, b:2},{ abc: "@a", def:{ghi: "@b"} }).def.ghi,2)
    })
    it("should support nested object value and markup", function() {
        assert.equal(interpolator.interpolate({a:1, b:2}, {
                abc: "[eval]a[/eval]", 
                def:{ghi: "[eval]b-1[/eval]"} }).abc,1)
        assert.equal(interpolator.interpolate({a:1, b:2}, {
                abc: "[eval]a[/eval]", 
                def:{ghi: "[eval]b-1[/eval]"} }).def.ghi,1)
    })
})

describe("interpolator - array interpolation", function() {
    it("should support array type", function() {
        assert.deepEqual(interpolator.interpolate({a:1, b:2},{ abc: ["@a","@b"] }).abc,[1,2])
    })
    it("should support array type and markup", function() {
        assert.deepEqual(interpolator.interpolate({a:1, b:2},{ abc: ["[eval]a[/eval]","[eval]b-1[/eval]"] }).abc,[1,1])
    })
})

describe("interpolator - non-processed values", function() {
    it("should support array type", function() {
        assert.deepEqual(interpolator.interpolate({a:1, b:2}, 
            {_np_: { abc: ["@a","@b"] }}).abc,["@a","@b"])
    })
})

describe("interpolator [hbs]", function() {
    it("should support constant values", function() {
        var mark = "[hbs]42[/hbs]"
        var parsed = interpolator.parse(mark) 
        assert.equal(parsed[0]({a:1}), "42")
    })
    it("should support context values", function() {
        assert.equal(interpolator.interpolate({a:1},"[hbs]a={{a}}[/hbs]"),"a=1")
    })
})
describe("interpolator # (eval shortcut)", function() {
    it("should support constant values", function() {
        assert.ok(interpolator.interpolate({a:1},"#a+1") === 2)
    })
})

describe("interpolator [eval]", function() {
    it("should support constant values", function() {
        assert.equal(interpolator.interpolate({a:1},"[eval]42[/eval]"),42)
    })
    it("should support solo markup with type return value", function() {
        assert.equal(interpolator.interpolate({a:1},"[eval]a[/eval]"),1)
    })
    it("should support multiple markup with string concat", function() {
        assert.equal(interpolator.interpolate({a:1},"[eval]a[/eval][eval]a[/eval]"),"11")
    })
    it("should support complex expressions", function() {
        var mark = "[eval]a[f][/eval]"
        var parsed = interpolator.parse(mark) 
        assert.equal(parsed[0]({f : 1, a:['x','y','z']}),'y')
    })
})

describe("embedded workflow content", function() {
    it("should not be interpolate too early", function(done) {
        var cache = {};
        var wf = {
            task:"while",
            test:"#fo == 'bar'", 
            subflow: {
                task:"sequence",
                items: [
                    {
                        task: function define(node) {
                            return function build(context) {
                                return function execute(done) {
                                    context.fo = "baz";
                                    done(undefined, "hello there")
                                }
                            }
                        },
                        resultTo:"f1"
                    },
                    {
                        task: function define(node) {
                            return function(context) {
                                execute.annotations = { inject:["p1"] }
                                function execute(p1, done) {
                                    cache.p1 = p1;
                                    done();
                                }
                                return execute;
                            }
                        },
                        p1:"@f1" 
                    }
                ]
            }
        }
        worksmith(wf)({fo:'bar'}, function() {
            done()
        });
    })

})

})



