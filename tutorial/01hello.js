var worksmith = require('..')

var workflow = worksmith({task:"log", message:"hello"})
workflow({}, function(err, res) {
    console.log("workflow executed")
})