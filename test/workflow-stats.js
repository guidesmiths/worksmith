var worksmith = require('..')
var assert = require('assert')

describe("workflow status", function() {
    it("should be created", function(done) {
        this.slow()
        var wf = worksmith([
          {
            name:"t1",
            taskName:"t1",
            task: function(def) {
              return function build(context) {
                return function execute(d) {

                    //console.log("d1")
                    setTimeout(function() {
                      d()
                    }, 500)
                }
              }
            }
          },
          {
            taskName:"t2",
            name: "t2",
            task: function(def) {
              return function build(context) {
                return function execute(d) {
                    //console.log("d2")
                    setTimeout(function() {
                      d()
                    }, 500)
                }
              }
            }
          }

        ]);
        var before = Date.now()
        var ctx = { $$$stats: []}
        wf(ctx, function(err, result, ctx) {
            assert(ctx.$$$stats.join("").match(/t1 execution time: [0-9]{3}mst2 execution time: [0-9]{3}mssequence execution time: [0-9]{4}ms/))
              done(null, result)
        })
    })
})