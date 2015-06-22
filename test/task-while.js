var workflow = require('../')
var assert = require('assert')

describe("whileActivity", function () {

    it("should iterate until condition is falsey", function (done) {
        var context = { flag: true, count: 0 };

        var wi = workflow({
            task: "while",
            test: "@flag",
            subflow: {
                task: function(definition) {
                    return function(context) {
                        return function(done) {
                            context.count >= 10 ? context.flag = false : context.count++
                            done()
                        }
                    }
                }
            }
        })(context)

        wi(function (err, result) {
            assert.ifError(err)
            assert.equal(context.count, 10)
            done()
        })
    })

    it("should not barf on infinte loops", function (done) {
        var context = {};

        var wi = workflow({
            task: "while",
            test: true,
            subflow: {
                task: function(definition) {
                    return function(context) {
                        return function(done) {
                            done()
                        }
                    }
                }
            }
        })(context)

        wi(function (err, result) {
            assert.ifError(err)
            assert.ok(false, 'Loop was not infinite enough')
        })

        setTimeout(done, 1000)
    })

    it("should yield the result of the subflow", function (done) {
        var context = { flag: true, count: 0 };

        var wi = workflow({
            task: "while",
            test: "@flag",
            subflow: {
                task: function(definition) {
                    return function(context) {
                        return function(done) {
                            context.count >= 10 ? context.flag = false : context.count++
                            done(null, context.count)
                        }
                    }
                }
            },
            resultTo: 'result'
        })(context)

        wi(function (err, result) {
            assert.ifError(err)
            console.log(context)
            assert.equal(context.result, 10)
            assert.equal(result, 10)
            done()
        })
    })
})