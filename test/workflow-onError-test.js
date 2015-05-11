var assert = require('assert')
var worksmith = require('../')

describe("WorkSmith API - error handler workflow", function() {

    it("should be executed on an asyn error", function(done) {
        var flags = {};

        var def = {
            task: function(def) {
                return function build(context) {
                    return function execute(done) {
                        //throw "alma";
                        done({"some":"err", "supressMessage":true});
                    }
                }
            },
            onError: {
                task:function(def) {
                    return function builde(context) {
                        return function execute(done) {
                            flags.errorSet = true;
                            done();
                        }
                    }
                }
            }
        };
        
        var workflow = worksmith(def);
        workflow({}, function() {
            assert.ok(flags.errorSet, "error handler must be invoked")            
           done(); 
        });
    });
    
    it("should prevent executing the next workflow", function(done) {
        var flags = {};

        var def = {
            task:"sequence",
            items: [{
                task: function(def) {
                    return function build(context) {
                        return function execute(done) {
                            //throw "alma";
                            done({"some":"err", "supressMessage":true});
                        }
                    }
                },
                onError: {
                    task:function(def) {
                        return function builde(context) {
                            return function execute(done) {
                                flags.errorSet = true;
                                done({error:"bad things happen", "supressMessage":true});
                            }
                        }
                    }
                }
            },
            {task:function(def) { return function(context) {return function(done) { flags.nextWfRun = true; done() }}}}
            
            ]
        };
        
        var workflow = worksmith(def);
        workflow({}, function() {
            assert.notEqual(flags.nextWfRun, true, "next wf should not be invoked")
           done(); 
        });
    });
    
    it("should allow executing the next workflow", function(done) {
        var flags = {};

        var def = {
            task:"sequence",
            items: [{
                task: function(def) {
                    return function build(context) {
                        return function execute(done) {
                            //throw "alma";
                            done({"some":"err", "supressMessage":true});
                        }
                    }
                },
                onError: {
                    task:function(def) {
                        return function builde(context) {
                            return function execute(done) {
                                done();
                            }
                        }
                    }
                }
            },
            {task:function(def) { return function(context) {return function(done) { flags.nextWfRun = true; done() }}}}
            
            ]
        };
        
        var workflow = worksmith(def);
        workflow({}, function() {
            assert.equal(flags.nextWfRun, true, "next wf should be invoked")
           done(); 
        });
    });
    
    
    it("should provide a correct err object", function(done) {
        var flags = {};

        var def = {
                task: function(def) {
                    return function build(context) {
                        return function execute(done) {
                            //throw "alma";
                            done({"some":"err", "supressMessage":true});
                        }
                    }
                },
                onError: {
                    task:function(def) {
                        return function builde(context) {
                            return function execute(done) {
                                done({message:"hello", supressMessage:true});
                            }
                        }
                    }
                }
        };
        
        var workflow = worksmith(def);
        workflow({}, function(err) {
            assert.equal(err.message, "hello", "error must be provided")
           done(); 
        });
    });
});