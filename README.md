#WorkSmith

```npm i worksmith --save```

A seriously ```functional``` workflow library.

Compose hyper complex async program parts in a way that is easy to understand and also to maintain, and favors configuration over coding.

- Use prebuilt activites like ```sequence``` or ```parallel``` or the ```warezSequence``` to manage program flow
- Use the conditional property to opt out from workflow steps on condition
- Use "@propertyname" to reference values on the workflow context
- Use {template: "{{xy}}/{{asd}}" to access the context with a templating engine

##usage

###The workflow definition:

```javascript
{ "task": "sequence",
  "items": [
        {
            task: "set",
            value: ["some_id", 1, 1],
            resultTo: "@insertParams"
        },
        {
            task:"sql/pg",
            connection: "@connection",
            command:  "insert into order (order_id, version, type) \
                       values ($1, $2, $3) returning id",
            params:  "@insertParams",
            resultTo: "insertResult"
        },
        {...}
  ]
}
```

###The code:

```javascript

var worksmith = require('worksmith')


var Workflow = worksmith('./workflow.json')

var context = {connection:"postgres://login:pw@host/db", other:"data"}

var task = Workflow(context);

task(function(err, result) {
    console.log("workflow completed, context potentially changed")
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
var utils = require('worksmith')
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


