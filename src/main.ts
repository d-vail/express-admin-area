const express = require('express')

import * as routes from './routes'
import * as mwc from './controllers/'
import { Admin } from './models/Admin'
import { viewsEngineConfig } from './helpers/viewsEngineConfig'

const adminAreaConfig = (app, db, models: Object) => {
  const adminArea = express.Router()
  const adminModel = Admin(db)

  /**
   * Model names need to be lowercase to easier grab the correct model in our
   * model-dependent routes. For an example look at the 'tableDataGet' route
   */
  const lowerCasedModels = { admins: adminModel }
  for (let modelName in models) {
    lowerCasedModels[ modelName.toLowerCase() ] = models[ modelName ]
  }

  // configure express to serve 'Pug' as default template engine
  viewsEngineConfig(app)
  
  // configure 'express-admin-area' middleware
  adminArea.use(express.json())
  adminArea.use((_req, res, next) => {
    res.locals.db = db
    res.locals.models = lowerCasedModels
    next()
  })

  /**
   * ROUTES
   */
  // log in/authentication
  adminArea.get('/', routes.authGet)
  adminArea.post('/', mwc.authenticateUser(db), routes.authPost)

  // dashboard - this is where users will see a list of tables from their DB
  adminArea.get('/dashboard', routes.dashboardGet)
  adminArea.post('/dashboard', routes.dashboardPost)

  // tableData - view information about individual tables
  adminArea.get('/dashboard/:tableName', routes.tableDataGet)
  adminArea.post('/dashboard/:tableName', routes.tableDataPost)
  adminArea.delete('/dashboard/:tableName', routes.tableDataDelete)
  adminArea.put('/dashboard/:tableName', routes.tableDataPut)
  
  // create 'admin' table in database
  adminModel.sync()

  return adminArea
}

export { adminAreaConfig }
