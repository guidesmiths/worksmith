# Worksmith release notes
## 0.2.3
An array in  place of a task or workflow variable means an implicit "sequence" task
```javascript
var wf = worksmith([
    { task: "set", name:"p1", value:"hello" }
    { task:"log" }
    { task:"eachSeries", item:[1,2,3], subflow: [
        { task:"log" message:"@item" }, 
        {task:"delay", duration:"[eval]item * 250[/eval]" }
     ]}
]);
wf({}, function(err, res) { });
```

## 0.2.2
Totally revamped interpolation logic, deep tree interpolation, array interpolation

tag support to drive interpolation mode: {{hbs}} and {{eval}} are support out of the box

## 0.1.7
eachSeriesActivity and whileActivity

## 0.1.5
Terminate a workflow or sequence from code (a programmable alternative to conditional="predicate" attribute)

in execute scope `this` holds workflow execution api. you do pass your done, and not invoke it yourself.

Note: in later versions you will not have to provide done
```javascript
//terminate a workflow
function execute(done) {
    this.workflow.terminate(/*err*/, /*result*/, done)
}
//terminate the current parent scope
function execute(done) {
    this.workflow.terminateParent(/*err*/, /*result*/, done)
}
```

## 0.1.4
Error logging temporalily removed

## 0.1.2, 0.1.3
Readme update

## 0.1.1

### worksmith.createAdapter
connect existing functionality into a workflow using worksmith.use + worksmith.createAdapter

```javascript
    worksmith.use("_", worksmith.createAdapter(require('lodash')))

    var context = {items:[{field:"value"}, {field2:"value2"}]}
    var workflow = worksmith({
        task: "_/filter",
        arguments: ["@items", { field:"value"} ],
        resultTo: "myresult"
    })
    workflow(context, function wfresult(err, res, context) {
        assert.equal(context.myresult[0], context.items[0])
       done(); 
    });
```