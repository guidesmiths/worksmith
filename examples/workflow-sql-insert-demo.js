var workflow = require('./src/tasks')

var config = require('./config/default.json');
var workflowDefinition = { task: "sequence", items: [ 	
							{task:"log"},
							//mapping content --> datarecord
							{task:"set", name:"record", value:{}},
							{task:"parallel", items: [ 
								{task:"set", name:"record.external_id", value:"@content.id" },
								{task:"set", name:"record.version", value:"@content.version" },
								{task:"set", name:"record.type", value: 1 },
								{task:"set", name:"record.data", value:{ foo:'bar' }}
							]},
							//end map

							{task:"insertDbRecord", 
							 		condition:"config.env != 'dev'",
									table:"billing_record", 
									data:"@record", 
									connection: "@config.connectionString",
									resultTo:"insert_result" },
							{task:"log", message: "@insert_result.rows"}

				] 
}

var taskDef = workflow.define(workflowDefinition);
var ctx = { 
	message: {},
	content: { id: 'some_funky_id' + Math.random(), version:1 },
	config: config 
}

var task = taskDef(ctx)

task(function(err, result) {
	console.log("workflow completed", err);
})	
