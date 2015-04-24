var workflow = require('./src/tasks')

var taskDefinition = workflow.define({ 	
		task: "warezSequence", 
		items: ["log1","regex","log2"],
		warez: {
			log1: {task:"log", message:"hello there"}, 
			regex: {task:"regex", 
					value:"@message.routingKey",
					pattern:"(?<origin>[^.]*).\
							 (?<version>[^.]*).\
						 	 (?<api>[^.]*).\
						 	 (?<entity>[^.]*).\
						 	 (?<command>[^.]*).",
					resultTo:"result"},
			log2: {task:"log", message:"@result"}
		} 		
});

var ctx = {
	message: {
		routingKey: "salesforce.v1.notifications.order.created"
	}
}
var task = taskDefinition(ctx);
task(function(err, result) {
	//console.log("executed", ctx);
});

//demo_flow_of_tasks();


