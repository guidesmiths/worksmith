#WorkSmith

```npm i worksmith --save```

A Seriously functional workflow library.

Compose hyper complex async program parts in ways that is easy to understand and also to maintain, and favors configuration over coding.

-Use prebuilt activites like ```sequence``` or ```parallel``` or the ```warezSequence``` to manage program flow
-Use the conditional property to opt out from workflow steps on condition
-Use "@propertyname" to reference values on the workflow context
-Use {template: "{{xy}}/{{asd}}" to access the context with a templating engine

##usage

###The config:

```JSON
{ "task": "sequence",
  "items": [
	{"task":"log", "message":"hello there"},
	{"task":"delay", "duration":1200},
	{"task":"set", "new_record": { "Title":"War and peace", "Author":"Leo Tolstoy" }},
	{"task":"insertDbRecord",
	 	"table":"billing_record",
	 	"data":"@new_record",
	 	"connection":"@config.cnString",
	 	"resultTo":"insert_result"
	},
	{ "task":"log", "message":"@insert_result.rows"}
  ]
}
```

###The code:

```javascript
var workflow = require('.src/tasks')

var taskDefinition = workflow(require('./config/workflow.json'))
var context = {config: config, message: message, etc: etc}

taskDefinition(context)(function(err, result) {
		console.log("wf completed")
})

```

mini-workflow has some core workflow task types for controlling process flow. These are the
-sequence
-parallel
-warezSequence
activities

##How to create your own activity

mini-workflow lets you build your activities on a super easy way
Place the following code as ```"hello-world.js"``` in the ```tasks``` folder

```javascript
var utils = require('./utils.js')
module.exports = function (node) {
	//use the node variable to access workflow params
	return function(context) {
	//use the context to access workflow execution state
		return function(done) {
		//set done when your acitivity finished its job
		//read and write data from the context
			console.log("Hello world", utils.readValue(node.inParam, context))
			utils.setValue(context,"myresult","myvalue")
			done();
		}
	}

}
```
Now you can use it the same way as the core activities
```javascript
var wf = workflow.define({ "task": "sequence",
  "items": [
	{"task":"hello-world", "inParam":"some thing"} ]});

var ctx = {"some":"value"};
wf(ctx)(function(err) {
	console.log(ctx)
})
```

##List of core activities

###log
Write a log to the console
####options
message

###delay
Waits a bit
####options
duration

###insertDbRecord
Like the name suggests
####options
table
data
connection
resultTo

###softDeleteDbRecord

###deleteDbRecord

###parallel
Execute sub tasks in parallel
####options
items array

###sequence
Execute sub tasks in sequence
####options
items array

###warezSequence
Define a sequence on a patching compatible way
####options
items array


###set
Set variable on the workflow context
####options
name
value


