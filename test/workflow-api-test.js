var assert = require('assert')
var workflow = require('../')

describe("WorkSmith API", function() {

    it("should run a workflow", function(done) {
        var flags = {};

        var def = {
            task: function(def) {
                flags.define = true;
                return function build(context) {
                    flags.build = true;
                    return function execute(done) {
                        flags.run = true;
                        done();
                    }
                }
            },
            param1: "value1"
        };

        var wf = workflow(def)
        var wi = wf({});
        assert.ok(flags.define, "definition function must have run")
        assert.ok(flags.build, "build function must have run")
        wi(function(err, res) {
            assert.ok(flags.run, "execute   function must have run")
            assert.ok(true,"always")
            done();
        })
    })

    it("should provide worksmith as 'this' for definer", function(done) {
        var flags = {};

        var def = {
            task: function(def) {
                flags.definerThis = this;
                return function build(context) {
                    return function execute(done) {
                        done();
                    }
                }
            }
        };

        var wf = workflow(def)
        var wi = wf({});
        wi(function(err, res) {
            assert.equal(flags.definerThis,workflow, "worksmith instance does not match")
            done();
        })
    })

    it("should pass definition to builder", function(done) {
        var flags = {};

        var def = {
            task: function(def) {
                flags.definition = def;
                return function build(context) {
                    return function execute(done) {
                        done();
                    }
                }
            },
            param1: "value1"
        };

        var wf = workflow(def)
        var wi = wf({});
        wi(function(err, res) {
            assert.equal(flags.definition,def, "definition must be passed correctly")
            done();
        })
    })

    it("should pass context to executor", function(done) {
        var flags = {};

        var def = {
            task: function(def) {
                return function build(context) {
                    flags.context = context;
                    return function execute(done) {
                        done();
                    }
                }
            },
            param1: "value1"
        };

        var wf = workflow(def)
        var context = {};
        var wi = wf(context);
        wi(function(err, res) {
            assert.equal(flags.context,context, "context    must be passed correctly")
            done();
        })
    })

    it("should handle 'resultTo' pipeline", function(done) {
        var def = {
            task: function(def) {
                return function build(context) {
                    return function execute(done) {
                        done(null, 42);
                    }
                }
            },
            resultTo:"result"
        };
        var wf = workflow(def)
        var context = {};
        var wi = wf(context);
        wi(function(err, res) {
            assert.equal(context.result,42, "result must be passed correctly")
            done();
        })

    })

    it("should provide 3 args to result callbacks", function(done) {
        var def = {
            task: function(def) {
                return function build(context) {
                    return function execute(done) {
                        done(null, 42);
                    }
                }
            },
            resultTo:"result"
        };
        var wf = workflow(def)
        var context = {};
        var wi = wf(context);
        wi(function(err, res, ctx) {
            assert.equal(arguments.length, 3, "args count must match")
            assert.equal(ctx, context, "context must match")
            done();
        })

    })


    
    describe("parameter injector", function() {
      it("should inject definition fields correctly - static value", function(done) {
        var flags = {};

        var def = {

            task: function(def) {
                function build(context) {
                    function execute(param1, done) {
                        flags.param1 = param1;
                        done();
                    }
                    execute.annotations = { inject:["param1"] }
                    return execute
                }
                return build
            },
            param1: "value1"
        };

        var wf = workflow(def)
        var context = { field1:"value1" };
        var wi = wf(context);
        wi(function(err, res) {
            assert.equal(flags.param1,"value1", "injected must be passed correctly")
            done();
        })
      })

    it("should inject context fields correctly", function(done) {
        var flags = {};

        var def = {

            task: function(def) {
                function build(context) {
                    function execute(param1, done) {
                        flags.param1 = param1;
                        done();
                    }
                    execute.annotations = { inject:["@field1"] }
                    return execute
                }
                return build
            }
        };

        var wf = workflow(def)
        var context = { field1:"value1" };
        var wi = wf(context);
        wi(function(err, res) {
            assert.equal(flags.param1,"value1", "injected must be passed correctly")
            done();
        })
      })
    })

    it("should handle inject shortcut ", function(done) {
        var flags = {};

        var def = {

            task: function(def) {
                function build(context) {
                    function execute(param1, done) {
                        flags.param1 = param1;
                        done();
                    }
                    execute.inject = ["@field1"]
                    return execute
                }
                return build
            }
        };

        var wf = workflow(def)
        var context = { field1:"value1" };
        var wi = wf(context);
        wi(function(err, res) {
            assert.equal(flags.param1,"value1", "injected must be passed correctly")
            done();
        })
    })

    it("should handle injecting arrays ", function(done) {
        var flags = {};

        var def = {

            task: function(def) {
                function build(context) {
                    function execute(f1, f2, done) {
                        flags.f1 = f1;
                        flags.f2 = f2;
                        done();
                    }
                    execute.annotations = { inject:["f1","f2"] }
                    return execute
                }
                return build
            },
            f1: "@field1",
            f2: "@field2"
        };

        var wf = workflow(def)
        var context = { field1:"value1", field2:["a","b","c"] };
        var wi = wf(context);
        wi(function(err, res) {
            assert.equal(flags.f1,"value1", "injected must be passed correctly")
            assert.equal(flags.f2, context.field2, "injected must be passed correctly")
            done();
        })
    })
})