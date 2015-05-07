var worksmith = require('..')

var wf = {
    task : function define(params) {
        //params will contain the tasks json config eg
        // {task:"job2", message:"@p1", "level":"warn"}
        return function(context) {
            //context will hold the execute state e.g.
            //{p1:"hello"}
            return function(done) {
                console[context.get(params.level)](context.get(params.message));
                done()
            }
        
        }   
    },
    message:"@p1",
    level:"error"
}

worksmith(wf)({p1:"hello"}, console.log)