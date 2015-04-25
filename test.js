var workflow = require('./')


var context = {
    req: {
        params: {
            id: Math.random(),
            version:1,
            type:1
        }
   },
    config: {
            connection: "postgres://postgres:@127.0.0.1/postgres"
    }
}

var wfDef = {
    "task": "sequence",
    "items": [
        { task: "map", map: ["@req.params.id", "@req.params.version", "@req.params.type" ], resultTo:"insertParams" },

        {
            task:"sql/pg", connection: "@config.connection",
            command:  "insert into billing_record (external_id, version, type) \
                       values ($1, $2, $3) returning id",
            params:  "@insertParams",
            resultTo: "insertResult"
        },
        {
            task:"log", message: {template: "Total inserted items: {{insertResult.rowCount}}" }
        },
        {
            task:"code",
            execute: function (newRecord, re, done) {
                done(null, "alma")
            },
            inject:["insertResult.rows[0]","insertResult"],
            resultTo: "convertedSomething"
        },
        {
            task:"log",
            message:"@convertedSomething"
        },
        { task:"sql/pg",
            connection: "@config.connection",
            command:  "select * from billing_record where  \
                        external_id = ($1) and version = ($2) and type = ($3)",
            params: "@insertParams",
            resultTo: "selectResult" },

        { task: "log", message: "@selectResult.rows[0]" },

    ]
}

var fn = workflow(wfDef)(context);

fn(function (err, res) {
    console.log("err", err, "res", res.length)
})

// var fn2 = def({text:"Az Oz"});
// fn2(function(err, res) {
//     console.log("err", err, "res", res.length)
// })