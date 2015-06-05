# Worksmith release notes

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