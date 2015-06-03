var assert = require('assert')
var worksmith = require('../')

describe("WorkSmith API - finally workflow", function() {

    function createWf(err, message, steps) {
        return function TestTask(def) {
            return function build(context) {
                return function execute(wfdone) {
                    steps.push(message)
                    wfdone(err);
                }
            }
        }
    }

    var stdError = { "message":"error", "supressMessage":true, stack: "some stack trace"};
    
    it("should be executed on good run", function(done) {

        var steps = [];
        var def = {
            task: createWf(undefined, "wf1", steps),
            "finally": {
                task: createWf(undefined, "wf2", steps)
            }
        };
        
        var workflow = worksmith(def);
        workflow({}, function wfresult() {
            steps.push("wf3")
            assert.equal(steps.join("|"),"wf1|wf2|wf3", "workflow steps must be correct")
           done(); 
        });
    });
    
    
    it("should be executed on run with error", function(done) {
        var steps = [];
        var def = {
            task: createWf(stdError, "wf1", steps),
            "finally": {
                task:createWf(undefined, "wf2", steps)
            }
        };
        
        var workflow = worksmith(def);
        workflow({}, function() {
            steps.push("wf3")
            assert.equal(steps.join("|"),"wf1|wf2|wf3", "workflow steps must be correct")
           done(); 
        });
    });



    it("should be executed on error and the workflow should quit with error", function(done) {
        var flags = {};
        var steps = [];
        var def = 
            {
                task:"sequence",
                items: [{
                             task:createWf(stdError, "wf1", steps),
                            "finally": {
                                task:createWf(undefined, "wf2", steps)
                             }
                        },
                        {
                            task:createWf(undefined, "wf3", steps)
                        }]
          };

        
        var workflow = worksmith(def);
        workflow({}, function wfresult() {
            steps.push("wf4")
            assert.equal(steps.join("|"),"wf1|wf2|wf4", "workflow steps must be correct")
           done(); 
        });
    });
  

    it("should be executed on error and the workflow should quit with error from deep", function(done) {
        var flags = {};
        var steps = [];
        var def = 
            {
                task:"sequence",
                items: [
                        {
                            task:"sequence",
                            items: [{
                                        task: createWf({"message":"error"}, "wf1", steps),
                                        "finally": {
                                            task: createWf(undefined, "wf2", steps)
                                       }
                                   }],
                            "finally": {
                                task:function(fdef) {
                                    return function build(fcontext) {
                                        return function execute(fdone) {
                                            steps.push("wf3")
                                            fdone();
                                        }
                                    }
                                }
                            }
                    },
                    {
                        task: createWf(undefined, "wf4", steps)
                    }
                ]};

        
        var workflow = worksmith(def);
        workflow({}, function wfresult() {
            steps.push("wf5")
            assert.equal(steps.join("|"),"wf1|wf2|wf3|wf5", "workflow steps must be correct")
           done(); 
        });
    });
     
    
    it("should be executed on handled error ", function(done) {
        var flags = {};
        var steps = [];
        var def = {
            task:"sequence",
            items: [
            {
                task: function(def) {
                    return function build(context) {
                        return function execute(wfdone) {
                            steps.push("wf1")
                            wfdone({"some":"error","supressMessage":true});
                        }
                    }
                },
                onError:             {
                handleError:true,
                task: function(def) {
                    return function build(context) {
                        return function execute(wfdone) {
                            steps.push("wf2")
                            wfdone();
                        }
                    }
                }
                }
            },
            {
                task: function(def) {
                    return function build(context) {
                        return function execute(wfdone) {
                            steps.push("wf3")
                            wfdone();
                        }
                    }
                }
            }
            ],
            "finally": {
                task:function(fdef) {
                    return function build(fcontext) {
                        return function execute(fdone) {
                            steps.push("wf4")
                            fdone();
                        }
                    }
                }
            }
        };
        
        var workflow = worksmith(def);
        workflow({}, function() {
            steps.push("wf5")
            assert.equal(steps.join("|"),"wf1|wf2|wf3|wf4|wf5", "workflow steps must be correct")
           done(); 
        });
    });

});