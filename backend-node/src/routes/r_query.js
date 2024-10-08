var express = require('express');
const queryController = require("../controllers/c_query")

const queryRouter = express.Router();
queryRouter.post('/basicQuery', queryController.basicQuery)
queryRouter.post('/basicQueryNoCount', queryController.basicQueryNoCount)
queryRouter.post('/wliboxplotquery', queryController.wliBoxplotQuery)
queryRouter.post('/basicRequestQuery', queryController.basicRequestQuery)
queryRouter.post('/basicRequestQueryNoCount', queryController.basicRequestNoCountQuery)
queryRouter.post('/test', queryController.test)
queryRouter.post('/linechartquery', queryController.linechartQuery)
queryRouter.post('/pcaquery', queryController.pcaRequestQuery)
queryRouter.post('/logquery', queryController.logQuery)
queryRouter.post('/requestQuery', queryController.requestQuery)



module.exports = queryRouter;