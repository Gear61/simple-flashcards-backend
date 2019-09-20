const fs = require('fs');
const jwt = require('jsonwebtoken');

// Use 'utf8' to get string instead of byte array (512 bit key)
var privateKey  = fs.readFileSync(require('path').resolve(__dirname, './keys/private.key'), 'utf8');
var publicKey  = fs.readFileSync(require('path').resolve(__dirname, './keys/public.key'), 'utf8');

module.exports = {

  // The payload should contain the user ID
  sign: (payload) => {
    var signOptions = {
      issuer: "simple_flashcards_server",
      algorithm: "RS256"    
    };
    return jwt.sign(payload, privateKey, signOptions);
  },

  verify: (token) => {
    var verifyOptions = {
      issuer: "simple_flashcards_server",
      algorithm: ["RS256"]
    };

    try {
      return jwt.verify(token, publicKey, verifyOptions);
    } catch (err) {
      return false;
    }
  }
}
