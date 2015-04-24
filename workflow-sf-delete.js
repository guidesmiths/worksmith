
var workflow = require('./src/tasks')

var taskDef = workflow('./config/delete-sf-entities.json')

var ctx = {
	config: require('./config/default.json'),
	content: {
		id: "sf-id" + Math.random(),
		version:1
	},
	message: {
		routingKey: "salesforce.v1.notifications.order.cancelled"
	}
}
var task = taskDef(ctx);

task(function(err, result) {
	console.log("!!@@done", err)
})
