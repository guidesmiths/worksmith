# worksmith tutorial

## npm install --save worksmith

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
Tasks may have a "return value" - a result that other workflow steps that come later can access.
The context is there to store this return value, if you specify a context field name in the `resultTo` task parameter.

The `map` activity lets you produce a new value on the context based on existing context values - or workflow service method results.
It also supports the `>` resultTo shortcut in the place of the map parameter

```javascript
var workflow = worksmith({ 
    task:"sequence", 
    items: [
        {  task:"map", map: { f1:"@p1", f2:"@p2" }, resultTo:"mapData.d1" },
        {  task:"map", ">mapData.d2": ["@p1","Hello"] },
        { task:"log", message:"@mapData.d2[1]" }
    ]
});

workflow({p1:"answer", p2:42}, function(err, res) {
    console.log("workflow executed")
})
```

## How to create a custom task type (activity)
Tasks are referenced by their names in workflow definitions and are looked up in the `~/src/tasks` folder of your application.
To create a smarter logger activity place a file named `log.js` in your tasks folder. With this you override the default log activity.

`src/tasks/log.js`
```javascript
module.exports = function define(params) {
    //params will contain the tasks json config eg
    // {task:"job", message:"@p1", "level":"warn"}
    return function(context) {
        //context will hold the execution state e.g.
        //{p1:"hello"}
        return function(done) {
            console[context.get(params.level) || 'log'](context.get(params.message));
            done()
        }
    
    }   
}
```

`src/app.js`
```javascript
var workflow = worksmith({ 
    task:"sequence", 
    items: [
        {  task:"map", map: { f1:"@p1", f2:"@p2" }, resultTo:"mapData.d1" },
        { task:"log", message:"@mapData.d1.f1", level:"warn" }
    ]
});

workflow({p1:"answer"}, function(err, res) {
    console.log("workflow executed")
})
```
## Getting task params injected
Use injection rather then context.get - because 1) it is more sexy, 2) it will support async injection of params in remote workflows

`src/tasks/log.js`
```javascript
module.exports = function define(params) {
    //params will contain the tasks json config eg
    // {task:"job2", message:"@p1", "level":"warn"}
    return function(context) {
        //context will hold the execution state e.g.
        //{p1:"hello"}
        execute.inject = ["message","level"]
       function execute(msg, lvl, done) {
            console[lvl || 'log'](msg);
            done()
        }
        return execute
    }   
}
```
## Returning values
To set the value for the field name specified in `resultTo` just provide data for the done() handler.
`src/resulter.js`
```javascript
module.exports = function define(params) {

    return function(context) {

       function execute(done) {
           
            setTimeout(function() {  //async process
                done(undefined, {some:"value"})
            }, 100);

        }
        return execute
    }   
}
```
```
var workflow = worksmith({ 
    task:"sequence", 
    items: [
        {  task:"resulter", resultTo:"result" },
        { task:"log", message:"@result" }
    ]
});
```

## Errors in a workflow
To signal error in a workflow simply set value for the error argument in the done() callback.
No subsequent tasks will be executed.

```javascript
module.exports = function define(params) {

    return function(context) {

       function execute(done) {
           
            setTimeout(function() {  //async process
                done(new Error("something"))
            }, 100);

        }
        return execute
    }   
}
```
### Error receiver
You can have a workflow assigned to an error event. This will receive the error in `context.error`.

```javascript
var workflow = worksmith({ 
    task:"sequence", 
    items: [
        {  
            task:"some_erring_workflow", 
            onError: {
                task: "some_error_receiver"
            }
        },
        {
            task:"some_task_that_will_never_run"
        }
    ]
});
```

### Error handler
You can have a workflow assigned to an error event. This can handle the error in `context.error`.  The error handler workflow has the
option to swallow the error and let the whole main workflow to continue. Just call `done()` w/o an error to have that happen.

```javascript
var workflow = worksmith({ 
    task:"sequence", 
    items: [
        {  
            task:"some_erring_workflow", 
            onError: {
                handleError: true,
                task: "some_error_handler"
            }
        },
        {
            task:"some_task_that_might_still_run"
        }
    ]
});
```

## The `workflow' task type
You can execute a complete workflow as a task. 
Its good for shared workflow steps.

Use the `workflow` task type and
specify workflow `source` with its path or its object definition. 
Subworkflows inherit the parent context by default.
You can optionally set a new `context` for the subworkflow
by specifying value for the `context` param. 

```javascript
var workflow = worksmith({ 
    task:"sequence", 
    items: [
        {  
            task:"set", 
            name:"param",
            value:{ abc:"def" }
        },
        {
            task:"workflow",
            source:"./src/workflows/myworkflow.js",
            context: "@param"
        }
    ]
});
```


