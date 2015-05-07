var worksmith = require('..')

var workflow = worksmith({ 
    task:"sequence", 
    items: [
        {  task:"map", map: { f1:"@p1", f2:"@p2" }, resultTo:"mapData.d1" },
        {  task:"map", ">mapData.d2": ["@p1","Hello"] },
        { task:"log", message:"@mapData" }
    ]
});

workflow({p1:"answer", p2:42}, function(err, res) {
    console.log("workflow executed")
})