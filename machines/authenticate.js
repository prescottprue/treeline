module.exports = {


  friendlyName: 'Authenticate',


  description: 'Look up the Treeline secret for the specified username/password combination.',


  extendedDescription: '',


  inputs: {

    username: {
      description: 'A Treeline username or email address',
      example: 'mikermcneil',
      required: true
    },

    password: {
      description: 'The password for the Treeline account with this username',
      example: 'sh4rkw33k',
      protect: true,
      required: true
    },

    treelineApiUrl: {
      description: 'The base URL for the Treeline API (useful if you\'re in a country that can\'t use SSL, etc.)',
      example: 'http://api.treeline.io',
      defaultsTo: 'https://api.treeline.io'
    }

  },


  defaultExit: 'success',


  exits: {

    error: {
      description: 'Unexpected error occurred'
    },

    forbidden: {
      description: 'Unrecognized username/password combination.',
      extendedDescription: 'Please try again or visit http://treeline.io to reset your password or locate your username.'
    },

    requestFailed: {
      description: 'Could not communicate with Treeline.io -- are you connected to the internet?'
    },

    success: {
      description: 'Treeline secret key fetched successfully.',
      example: '29f559ae-3bec-4d0a-8458-1f4e32a72407'
    },

  },


  fn: function (inputs, exits){

    var Http = require('machinepack-http');
    var Util = require('machinepack-util');


    // Send an HTTP request and receive the response.
    Http.sendHttpRequest({
      method: 'put',
      baseUrl: inputs.treelineApiUrl || process.env.TREELINE_API_URL || 'https://api.treeline.io',
      url: '/cli/login',
      params: {
        username: inputs.username,
        password: inputs.password,
      },
      headers: {}
    }).exec({
      // An unexpected error occurred.
      error: function(err) {
        return exits.error(err);
      },
      // 403 status code returned from server
      forbidden: function(result) {
        return exits.forbidden(result.body);
      },
      // Unexpected connection error: could not send or receive HTTP request.
      requestFailed: function() {
        return exits.requestFailed();
      },
      // OK.
      success: function(result) {
        var secret;
        try {
          secret = (Util.parseJson({
            json: result.body,
            schema: {
              secret: 'ab3193401-138a8b-e81399d1-21940e-a13b4'
            }
          }).execSync()).secret;

          return exits.success(secret);
        }
        catch (e) {
          return exits.error(e);
        }
      },
    });

  }

};
