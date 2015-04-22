var utils = require('./utils.js')
var debug = require('debug')('workflow:activities:sendToRascalSubscriber')
var Conflab = require('conflab')
var conflab = new Conflab()
var rascal  = require('rascal')

module.exports = function(node) {
	return function (context) {

		return function(done) {
			var publication = utils.readValue(node.publication, context)
			var routingKey = utils.readValue(node.routingKey, context)
			var data = utils.readValue(node.data, context)
			console.log("setting publication, routingKey, data", publication,routingKey, data)

			//TODO
            process.theBroker.publish(publication, data, { routingKey: routingKey }, 
            				function() {
            					console.log("message published")
        						done();					
            				});


			// conflab.load({}, function(err, config) {
			// 	var rascalConfig = rascal.withDefaultConfig(config.rascal)
			// 	console.log("@@@@@", rascalConfig)
			//     rascal.createBroker(rascalConfig, function (err, broker) {
			//         console.log("...rascal broker started")
			//         // setImmediate(function() {


			//         // })


			//          //broker.publish(publication, "alma", { routingKey: routingKey })
			//          // , function(err, results) {
			//          // 	console.log("message published to queue", err, results)
			//          // 	setTimeout(function() {
			//          // 		done(err, results)
			//          // 	}, 1000)
			//          // })
			// 	})
			//  })
			//utils.setValue(context, node.name, value)
		}
	}
}