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

Tasks can reference values from this shared context via their parameters using '@' as the first character in parameter values.

```javascript
var worksmith = require('worksmith')

var context = { helloMessage:"hello world" }
var workflow = worksmith({task:"log", message:"@helloMessage"})
workflow(context, function(err, res) {
    console.log("workflow executed")
})
```
