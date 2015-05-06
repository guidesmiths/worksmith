var worksmith = require('..')

var context = { helloMessage:"hello world" }
var workflow = worksmith({task:"log", message:"@helloMessage"})
workflow(context, function(err, res) {
    console.log("workflow executed")
})