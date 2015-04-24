var workflow = require('./index.js')

var wfDef = {
    "task": "sequence",
    "items": [
        { task: "log", message: "hello world" },
        { task: "log", message: "@text" }
    ]
}

var def = workflow(wfDef)

var fn = def({ text: "42 hello" });

fn(function (err, res) {
    console.log("err", err, "res", res)
})

var fn2 = def({text:"Az Oz"});
fn2(function(err, res) {
    console.log("err", err, "res", res)
})