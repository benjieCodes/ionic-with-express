
var mysql_host = '127.0.0.1'
var mysql_port = '3306'
var mysql_user = 'root'
var mysql_password = ''
var mysql_database = 'todo_list'

module.exports = {
  load: function load (options) {
    options = options || {}

    var config = {
      db: {
        host: mysql_host,
        port: mysql_port,
        user: mysql_user,
        password: mysql_password,
        database: mysql_database
      }
    }

    return config
  }
}
