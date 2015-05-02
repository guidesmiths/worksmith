var assert = require('assert')
var workflow = require('../')

describe("regexActivity", function () {
    
    
    it("should match and split a constant string and return result", function (done) {
        var context = {};
        var flag;
        
        var wi = workflow({
            "task": "regex", 
            "pattern": "(?<part1>[^.]*).(?<part2>[^.]*).(?<part3>[^.]*)",
            "value": "abc.def.ghi",
            "resultTo": "result"
        })(context);
        
        wi(function (err, result) {
            assert.equal(context.result.part1, "abc", "regex field must match")
            done();
        })
    })
    

    it("should match and split a context reference and return result", function (done) {
        var context = {"stringToChop":"how-much-wood"};
        var flag;
        
        var wi = workflow({
            "task": "regex", 
            "pattern": "(?<part1>[^.]*)-(?<part2>[^.]*)-(?<part3>[^.]*)",
            "value": "@stringToChop",
            "resultTo": "result"
        })(context);
        
        wi(function (err, result) {
            assert.equal(context.result.part1, "how", "regex field must match")
            done();
        })
    })

})