var btoa = require('btoa');

module.exports = function (api, divshot, credentials) {

  var emails = api.endpoint('self/emails', {
    add: function (email, callback) {
      return this.http.request(this.url(), 'POST', {
        form: {
          address: email
        },
        proxy: credentials.proxyServer
      }, callback);
    },

    primary: function (email, callback) {
      return this.http.request(this.url(), 'POST', {
        form: {
          address: email,
          primary: true
        },
        proxy: credentials.proxyServer
      }, callback);
    },

    remove: function (email, callback) {
      return emails.one(email).remove(callback);
    },

    resend: function (email, callback) {
      var email =  emails.one(email);
      var url = email.url() + '/resend';

      return this.http.request(url, 'POST', {proxy: credentials.proxyServer}, callback);
    }
  });

  var password = api.endpoint('self').one('password', {
    reset: function (userId, callback) {
      return this.http.request(this.options.host + '/actions/reset_password/' + userId, 'POST', {proxy: credentials.proxyServer}, callback);
    }
  });

  var user = api.endpoint('users', {
    credentials: credentials,

    emails: emails,
    password: password,

    id: function (id) {
      return user.one(id);
    },

    authenticate: function (callback) {
      var self = this;

      if (this.credentials.token) return callback(null, this.credentials.token);
      if (this.credentials.session) return callback(null);

      return this.http._http(this.options.host + '/token', 'POST', {
        form: {
          username: this.credentials.email,
          password: this.credentials.password,
          grant_type: 'password'
        },
        headers: {
          Authorization: 'Basic ' + btoa(this.options.client_id + ":")
        },
        proxy: credentials.proxyServer
      }, function (err, response, body) {
        if (callback && err || body.status) {
          err = err || body.error;
          return callback(err);
        }

        if (callback) {
          self.credentials.token = body.access_token;
          callback(err, self.credentials.token);
        }
      });
    },

    setCredentials: function (credentials) {
      if (!this.credentials) {
        this.credentials = {};
      }

      this.credentials.email = credentials.email;
      this.credentials.password = credentials.password;
      this.credentials.token = credentials.token;
    },

    setWelcomed: function (callback) {
      return this.http.request(this.options.host + '/self/welcomed', 'PUT', {proxy: credentials.proxyServer}, callback);
    },

    self: function (callback) {
      return this.http.request(this.options.host + '/self', 'GET', {proxy: credentials.proxyServer}, callback);
    },

    deleteAccount: function (email, callback) {
      return this.http.request(this.options.host + '/self', 'DELETE', {
        form: {
          email: email
        },
        headers: {
          Authorization: 'Session ' + this.credentials.client_id,
          'content-type': 'application/json'
        },
        proxy: credentials.proxyServer
      }, callback);
    },

    sendHelpRequest: function (subject, body, callback) {
      return this.http.request(this.options.host + '/self/help', 'POST', {
        form: {
          subject: subject,
          body: body
        },
        proxy: credentials.proxyServer
      }, callback);
    },

    generateTicket: function (callback) {
      return this.http._http(this.options.host + '/token/tickets', 'POST', {
        headers: {
          Authorization: 'Basic ' + btoa(this.credentials.client_id + ":")
        },
        proxy: credentials.proxyServer
      }, callback);
    },

    checkTicketStatus: function (ticket, callback) {
      return this.http._http(this.options.host + '/token', 'POST', {
        form: {
          grant_type: 'ticket',
          ticket: ticket
        },
        headers: {
          Authorization: 'Basic ' + btoa(this.credentials.client_id + ":")
        },
        proxy: credentials.proxyServer
      }, callback);
    }
  });

  return user;
};
