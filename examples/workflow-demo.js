var workflow = require('../')

var taskDefinition = workflow.define(
    { task: "sequence", items: [
                            {task:"log", message:"hello there"},
                            {task:"log"},
                            {task:"delay", duration:1200},
                            {task:"set", name:"a", value:"b"},
                            {task:"log", message:"@a" },
                            {task:"sequence", items: [
                                    {task:"log", message:"@"},
                                    {task:"log"}
                            ]},
                            { task:"parallel", items: [
                                    {task:"delay", duration:1200},
                                    {task:"log"},
                                    {task:"log"}
                            ]}
                ]
});

var ctx = {}
var task = taskDefinition(ctx);
task(function(err, result) {
    console.log("executed", ctx);
});

//demo_flow_of_tasks();


