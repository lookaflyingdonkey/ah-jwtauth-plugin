exports.jwtauth_middleware = function(api, next) {
  var jwtAuthPreProcessor = function(connection, actionTemplate, next) {
    if(actionTemplate.authenticated === true && api.config.jwtauth.enabled[connection.type] && api.config.jwtauth.enabled[connection.type] === true) {
      var req = connection.rawConnection.req;
      if(!req && connection.mockHeaders) {
        req = {
          headers: connection.mockHeaders
        };
      }
      if(req.headers && req.headers['authorization']) {
        var parts = req.headers['authorization'].split(' ');
        if(parts.length != 2) {
          connection.rawConnection.responseHttpCode = 500;
          connection.error = {
            code: 500,
            message: 'Invalid Authorization Header'
          };
          next(connection, false);
        } else {
          if(parts[0].toLowerCase() != 'token') {
            connection.rawConnection.responseHttpCode = 500;
            connection.error = {
              code: 500,
              message: 'Invalid Authorization Header'
            };
            next(connection, false);
          } else {
            api.jwtauth.processToken(parts[1], function(data) {
              // Valid data, lets set it and continue
              connection.user = data;
              next(connection, true);
            }, function(err) {
              connection.rawConnection.responseHttpCode = err.http_status;
              delete err.http_status;
              connection.error = err;
              next(connection, false);
            });
          }
        } 
      } else {
          connection.rawConnection.responseHttpCode = 500;
          connection.error = {
            code: 500,
            message: 'Authorization Header Not Set'
          };
          next(connection, false);
      }
    } else {
      next(connection, true);
    }
  };
  
  api.actions.addPreProcessor(jwtAuthPreProcessor);
  
  next();
}