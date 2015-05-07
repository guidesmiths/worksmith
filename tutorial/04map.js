var worksmith = require('..')

var workflow = worksmith({ 
    task:"sequence", 
    items: [
        { task:"log", message:"@p1" },
        { task:"log", message:"@p2" }
    ]
});

workflow({p1:"answer", p2:42}, function(err, res) {
    console.log("workflow executed")
})