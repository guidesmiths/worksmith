var workflow = require('./src/tasks')

var config = require('./config/default.json');
var workflowDefinition = { task: "sequence", items: [ 	
							{task:"set", name:"keys", value:{ external_id: "abc", version:1, type:1 }},
							{task:"softDeleteDbRecord", 
									table:"billing_record", 
									keys:"@keys", 
									connection: "@config.connectionString",
									resultTo:"result" },
							{task:"log", message: "@result"}
				] 
}

var taskDef = workflow.define(workflowDefinition);
var ctx = {}
var task = taskDef(ctx)

task(function(err, result) {
	console.log("workflow completed", err);
})	
