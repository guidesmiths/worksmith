# worksmith tutorial
Your definitive guide to build worksmith workflows



## The hello world workflow
One of the simplest activities in worksmith is the `logActivity` that outputs its message to the JavaScript console.
```javascript
var worksmith = require('worksmith')

var workflow = worksmith({task:"log", message:"hello"})
workflow({}, function(err, res) {
    console.log("workflow executed")
})
```
## Workflow as a json
You can also keep your workflow definitions in separate files.

json file
```json
{ 
    "task":"log", "message":"hello"
}
```
javascript file
```javascript
module.exports = {
    task:"log", message:"hello"
}
```
```javascript
var workflow = require('worksmith')('./definition.json')
workflow({}, function(err, res) {
    console.log("workflow executed")
})
```

## The workflow context
Workflow steps communicate with the world using the workflow context, a shared state between individual tasks. 
They get input and write output from and to the context.

Tasks can reference values from this shared context via their parameters using '@' as the first character in parameter values.

```javascript
var worksmith = require('worksmith')

var context = { helloMessage:"hello world" }
var workflow = worksmith({task:"log", message:"@helloMessage"})
workflow(context, function(err, res) {
    console.log("workflow executed")
})
```

## Multiple workflow steps
A typical workflow will have multiple tasks to execute. Use one of the flow control activities to schedule them.
The `sequence` activity will execute its steps one after the other.
The  `parallel` activity runs them well parallel.

```javascript
var workflow = worksmith({ 
    task:"sequence", 
    items: [
        { task:"log", message:"@p1" },
        { task:"log", message:"@p2" }
    ]
});

workflow({p1:"answer", p2:42}, function(err, res) {
    console.log("workflow executed")
})
```

## Task results and the `map` activity
Tasks may have a "return value" - a result that other workflow step that come later can access.
The context is there to store this return value, if you specify a context field name in the `resultTo` task parameter.

The `map` activity lets you produce a new value on the context based on existing context values - or workflow service method results.

```javascript
var workflow = worksmith({ 
    task:"sequence", 
    items: [
        {  task:"map", map: { f1:"@p1", f2:"@p2" }, resultTo:"mapResult" },
        { task:"log", message:"@mapResult" }
    ]
});

workflow({p1:"answer", p2:42}, function(err, res) {
    console.log("workflow executed")
})
```

. 