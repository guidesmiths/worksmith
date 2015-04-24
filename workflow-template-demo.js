
var workflow = require('./src/tasks')

var taskDef = workflow.define({
	task:"sequence",
	items:[
		{task:"set",name:"a", value:"value_a" },
		{task:"set",name:"b", value:"value_b" },
		{task:"log", message: { template: "{{a}}/{{b}}"}}
	]
})


var ctx = { }
var task = taskDef(ctx);

task(function(err, result) {
	console.log("!!@@done", err)
})
