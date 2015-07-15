module.exports = {
    "task": "sequence",
    "items": [
        {
            "task": "log",
            "message": "Stress test 1"
        },
        {
            "task": "set",
            "name": "startTime",
            "value": "[eval](new Date()).getTime()[/eval]"
        },
        {
            "task": "createDeepObjects",
            "taskPath": "/stress-test/tasks",
            "size": 1000,
            "depth": 3,
            "resultTo": "objectList"
        },
        {
            "task": "while",
            "test": "[eval]objectList.length > 0[/eval]",
            "subflow": [
                {
                    "task": "lodash/initial",
                    "arguments": [ "@objectList" ],
                    "resultTo": "objectList"
                }
            ]
        },
        {
            "task": "set",
            "name": "duration",
            "value": "[eval](new Date()).getTime() - startTime[/eval]"
        },
        {
            "task": "log",
            "message": "[hbs]End of test. Duration: {{duration}} ms[/hbs]"
        }
    ]
}