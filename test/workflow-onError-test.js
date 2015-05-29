var assert = require('assert')
var worksmith = require('../')

describe("WorkSmith API - error handler workflow", function() {

    it("should be executed on an asyn error", function(done) {
        var flags = {};

        var def = {
            task: function(def) {
                return function build(context) {
                    return function execute(done) {
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
            assert.notEqual(flags.nextWfRun, true, "next wf should not be invoked")
           done(); 
        });
    });
    
    it("should allow executing the next workflow if handleError is true", function(done) {
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
                    handleError: true,
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
    
    
     it("should prevent executing the next workflow if handleError is true but errorWf errs", function(done) {
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
                    handleError: true,
                    task:function(def) {
                        return function builde(context) {
                            return function execute(done) {
                                done({some:"error", "supressMessage":true});
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
    
    
    it("should provide a correct err object", function(done) {
        var flags = {};

        var def = {
                task: function(def) {
                    return function build(context) {
                        return function execute(done) {
                            //throw "alma";
                            done({"message":"err", "supressMessage":true});
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
            assert.equal(err.message, "err", "error must be provided")
           done(); 
        });
    });
    
    it("should work with a sequence activity", function(done) {
        var flags = {};

        var def = {
                task: "sequence",
                items: [
                  {  
                    task: function(def) {
                        return function build(context) {
                            return function execute(done) {
                                //throw "alma";
                                flags.step1 = true;
                                done({"message":"err", "supressMessage":true});
                            }
                        }
                    }
                  },{  
                    task: function(def) {
                        return function build(context) {
                            return function execute(done) {
                                flags.step2 = true;
                                done()
                                //throw "alma";
                            }
                        }
                    }
                  }],
                onError: {
                    task:function(def) {
                        return function builde(context) {
                            return function execute(done) {
                                flags.step3 = true;
                                done({message:"hello", supressMessage:true});
                            }
                        }
                    }
                }
        };
        
        var workflow = worksmith(def);
        workflow({}, function(err) {
            assert.equal(flags.step1, true, "first step must be done")
            assert.notEqual(flags.step2, true, "second step mustnt be done")
            assert.equal(flags.step3, true, "third step must be done")
           done(); 
        });
    });
});