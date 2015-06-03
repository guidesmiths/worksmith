# worksmith
A seriously `functional` workflow library, that lets you build composable and configurable process definitions for various reasons.

```npm i worksmith --save```


For a step by step tutorial click [here](https://github.com/guidesmiths/worksmith/blob/master/TUTORIAL.md)
[Release notes](https://github.com/guidesmiths/worksmith/blob/master/ReleaseNotes.md)

## Workflow steps aka tasks aka activities
- worksmith comes with an extensible task library built up from the `core` and the `extension modules`.

### Core activities
| group | activities | description |
| ----- | ---------- | ----------- |

  - Control flow:  ```sequence``` ,  ```parallel``` and ```warezSequence```
  - IO: ```log```,```sql/pg```
  - Tansformation: ```map```, ```regex```, ```set```
  - Extensibitly: ```code``` activity , create custom task types by creating files in the tasks folder

### Extension modules

| name | description |
| ---  | ----------- |
| worksmith_salesforce | Interact with salesforce in a workflow |
| worksmith_etcd | Use network based locking via etcd service |
| coming | soon |
| worksmith_postgres | Execute SQL statements as part of the workflow, supports transactions |
| worksmith_assert | An assertion library to be used conventional workflows or workflows built for testing |
| worksmith_fs | Read/write files from a workflow |

- with worksmith you can build a complex async process chain from functional steps (tasks) - yet keep the application easy to understand and each functional step easy to developer and maintain. forget ```if(err) return next(err)```
- workflow steps are unaware about each other - they communicate over a shared context. WorkSmith provides an intuitive expression syntax for working with the context in a workflow definitions



## usage

### A workflow definition:
This can be in a config file, or as part of your js code as a variable.

```javascript
{ "task": "sequence",
  "items": [
        {
            task:"log", message:"hello workflow"
        },
        {
            task: "map",
            ">insertParams": ["@req.params.id", 1, 1]
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

### The code:

```javascript

var worksmith = require('worksmith')

var workflow = worksmith('./workflow.json')


var context = {
    connection:"postgres://login:pw@host/db",
    other:"data"
}

workflow(context, function(err, result) {
    console.log("workflow completed, %", context.insertResult)
})


```

## How to create your own activity

worksmith lets you build your activities on a super easy way
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
            console.log("Hello world", context.get(node.inParam))
            context.set("myresult","myvalue")
            done();
        }
    }

}
```
Now you can use it the same way as the core activities
```javascript
var wf = workflow( {"task":"hello-world", "inParam":"some thing"} );

var ctx = {"some":"value"};
wf(ctx, function(err) {
    console.log(ctx)
})
```

## List of core activities

### log
Write a log to the console
#### options
message

### delay
Waits a bit
#### options
duration

### insertDbRecord
Like the name suggests
#### options
table
data
connection
resultTo

### softDeleteDbRecord

### deleteDbRecord

### parallel
Execute sub tasks in parallel
#### options
items array

### sequence
Execute sub tasks in sequence
#### options
items array

### warezSequence
Define a sequence on a patching compatible way
#### options
items array


### set
Set variable on the workflow context
#### options
name
value


