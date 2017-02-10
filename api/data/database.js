var mysql = require('mysql')
var Q = require('q')
var configuration = require('../config/config')
var _ = require('lodash-node')
var id = 0
var debug = (process.env.NODE_ENV || 'development') === 'development'
var chalk = require('chalk')
var pool


function connect () {
  var d = Q.defer()

  var config = configuration.load() || {}
  var db = config.db || {}

  if (!pool) {
    pool = mysql.createPool({
      connectionLimit: 10,
      debug: false,
      host: db.host,
      port: db.port,
      user: db.user,
      password: db.password,
      database: db.database
    })
  }

  pool.getConnection(function onConnect (err, connection) {
    if (err) {
      d.reject({ name: 'DatabaseError', message: "Can't connect to mysql : " + err, error: err })
    } else {
      connection.query('use ' + db.database, function onQuery (err, rows, fields) {
        if (err) {
          connection.release()

          d.reject({
            name: 'DatabaseError',
            message: 'No mysql database with name = ' + db.database + ' was found : ' + err,
            error: err
          })
        } else {
          d.resolve(connection)
        }
      })
    }
  })
  return d.promise
}

function query (options) {
  options = options || {}
  var sql = options.sql || ''
  var sqlParameters = options.sqlParameters || []
  var d = Q.defer()
  var promise = d.promise
  if (!_.isString(sql) && sql.length > 0) {
    d.reject({ name: 'Invalid query arguments', message: 'The query must be a string and be a valid query.' })
    return promise
  }
  if (!_.isArray(sqlParameters)) {
    d.reject({ name: 'Invalid query arguments', message: 'The query parameters must be an array.' })
    return promise
  }
  connect().then(function onConnected (connection) {
    if (debug) {
      var log = `SQL [${id++}]`
      console.time(log)
    }
    connection.query(sql, sqlParameters, function onQuery (err, rows, fields) {
      if (debug) {
        console.timeEnd(log)
        console.log(chalk.styles.blue.open)
        console.log(sql, sqlParameters)
        console.log(chalk.styles.blue.close)
      }

      connection.release()

      if (err) {
        d.reject({ name: 'DatabaseError', description: 'The mysql query failed : ' + err, inner: err })
      } else {
        d.resolve(rows)
      }
    })
  }, function onConnectError (err) {
    d.reject({ name: 'DatabaseError', message: 'Failed to connect to the mysql database ', inner: err })
  })

  return promise
}

function escape (value) {
  if (typeof value === 'object') {
    value = _.cloneDeep(value)
  }

  if (typeof value === 'object' && value !== null) {
    if (value.__escaped) return value
    var result = recursiveEscape(value)
    result.__escaped = true
    return result
  }

  return recursiveEscape(value)
}

function recursiveEscape (value) {
  if (value === undefined || value === null || typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
    return 'NULL'
  } else if (typeof value === 'object') {
    _.each(value, function (v, k) {
      value[k] = recursiveEscape(v) // recursively for Array or Object properties
    })
    return value
  } else if (typeof value === 'number') {
    return value // no escaping required, prevent from implicit convert toString
  } else {
    return mysql.escape(value)
  }
}

function formatQuery (query, values) {
  return mysql.format(query, values)
}

module.exports = {
  query: query,
  escape: escape,
  formatQuery: formatQuery
}
