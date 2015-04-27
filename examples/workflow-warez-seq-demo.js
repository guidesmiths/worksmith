var workflow = require('./src/tasks')

var taskDefinition = workflow.define(
	{ task: "warezSequence", items: ["log1","log2","delay","set"],
				warez: {
					log1: {task:"log", message:"hello there"}, 
					log2: {task:"log"},
					delay: {task:"delay", duration:1200},
					set: {task:"set", name:"a", value:"b"}
				} 		
});

var ctx = {}
var task = taskDefinition(ctx);
task(function(err, result) {
	console.log("executed", ctx);
});

//demo_flow_of_tasks();


