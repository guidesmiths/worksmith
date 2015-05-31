var assert = require('assert')
var worksmith = require('../')

describe("WorkSmith API - finally workflow", function() {

    it("should be executed on good run", function(done) {
        var flags = {};
        var steps = [];
        var def = {
            task: function(def) {
                return function build(context) {
                    return function execute(wfdone) {
                        steps.push("wf1")
                        wfdone();
                    }
                }
            },
            "finally": {
                task:function(fdef) {
                    return function build(fcontext) {
                        return function execute(fdone) {
                            steps.push("wf2")
                            fdone();
                        }
                    }
                }
            }
        };
        
        var workflow = worksmith(def);
        workflow({}, function() {
            steps.push("wf3")
            assert.equal(steps.join("|"),"wf1|wf2|wf3", "workflow steps must be correct")
           done(); 
        });
    });
    
    
    it("should be executed on error ", function(done) {
        var flags = {};
        var steps = [];
        var def = {
            task: function(def) {
                return function build(context) {
                    return function execute(wfdone) {
                        steps.push("wf1")
                        wfdone({"some":"error", "supressMessage":true});
                    }
                }
            },
            "finally": {
                task:function(fdef) {
                    return function build(fcontext) {
                        return function execute(fdone) {
                            steps.push("wf2")
                            fdone();
                        }
                    }
                }
            }
        };
        
        var workflow = worksmith(def);
        workflow({}, function() {
            steps.push("wf3")
            assert.equal(steps.join("|"),"wf1|wf2|wf3", "workflow steps must be correct")
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