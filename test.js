var workflow = require('./index.js')

var wfDef = {
    "task": "sequence",
    "items": [

        { task: "map", map: ["@req.params.id", "@req.params.version", "@req.params.type" ], resultTo:"insertParams" },

        { task:"sql/pg", connection: "@connection",
            command:  "insert into billing_record (external_id, version, type) \
                       values ($1, $2, $3) returning id",
            params:  "@insertParams",
            resultTo: "result.rows"
        },
        { task:"sql/pg",
            connection: "@connection",
            command:  "select * from billing_record where  \
                        external_id = ($1) and version = ($2) and type = ($3)",
            params: "@insertParams",
            resultTo: "selectResult" },

        { task: "log", message: "@selectResult.rows[0]" },

    ]
}

var def = workflow(wfDef)

var context = {
    req: {
        params: {
            id: Math.random(),
            version:1,
            type:1
        },
        config: {
            connection: "postgres://postgres:@127.0.0.1/postgres"
        }
   }
}

var fn = def(context);

fn(function (err, res) {
    console.log("err", err, "res", res.length)
})

// var fn2 = def({text:"Az Oz"});
// fn2(function(err, res) {
//     console.log("err", err, "res", res.length)
// })