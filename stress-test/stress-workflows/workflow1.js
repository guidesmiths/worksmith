module.exports = {
    "task": "sequence",
    "items": [
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
            "prefix": "level",
            "resultTo": "objectList"
        },
        {
            "task": "while",
            "test": "[eval]objectList.length > 0[/eval]",
            "subflow": [
                {
                    "task": "lodash/last",
                    "arguments": [ "@objectList" ],
                    "resultTo": "object"
                },
                {
                    "task": "set",
                    "name": "extractedValue",
                    "value": "@object.level3.level2.level1.level0"
                },
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
        }
    ]
}