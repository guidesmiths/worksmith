var assert = require('assert')
var worksmith = require('../')

describe("WorkSmith API - termination/goto functions", function() {

    function createWf(err, message, steps, checker, finisher) {
        return function TestTask(def) {
            return function build(context) {
                return function execute(wfdone) {
                    //console.log(message)
                    checker && checker.apply(this)
                    steps.push(message)
                    wfdone(err)
                }
            }
        }
    }

    var stdError = { "message":"error", "supressMessage":true, stack: "some stack trace"};
    it("should be provided", function(done) {

        var steps = [];
        var def = {
            task:"sequence",
            items:[
            {
                  task: function(step) {
                      return function(context) {
                          return function(done) {
                              steps.push("wf1")
                              this.workflow.terminate(undefined, {a:1}, done)
                          }
                      }
                  },
                "finally": {
                    task: createWf(undefined, "wf1.fin", steps)
                }
            },{
                  task: createWf(undefined, "wf2", steps, function() {
                    steps.ths = this
                })
            }],
            "finally": {
                task: createWf(undefined, "wf.fin", steps)
            }
        };
        
        var workflow = worksmith(def);
        var ctx = {}
        workflow(ctx, function wfresult() {
            steps.push("wfcomplete")
            assert.equal(steps.join("|"),"wf1|wf1.fin|wfcomplete")
           done(); 
        });
    });
    

    
    it("should be provided", function(done) {

        var steps = [];
        var def = {
            task:"sequence",
            items:[
            {
                  task: createWf(undefined, "wf1", steps),
                "finally": {
                    task: createWf(undefined, "wf1.fin", steps)
                }
            },{
                task:"sequence",
                items: [
                    {
                      task:function() {
                          return function() {
                              return function(done) {
                                 steps.push("sub0")
                                this.workflow.terminateParent(null, {a:1}, done)
                              }
                          }
                      }  
                    },                    
                    {
                    "task": createWf("undefined","sub1", steps)
                }]
            },{
                  task: createWf(undefined, "wf2", steps)
            }],
            "finally": {
                task: createWf(undefined, "wf.fin", steps)
            }
        };
        
        var workflow = worksmith(def);
        var ctx = {}
        workflow(ctx, function wfresult() {
           assert.equal(steps.join("|"),"wf1|wf1.fin|sub0|wf2|wf.fin")
           done(); 
        });
    });
    
    

});