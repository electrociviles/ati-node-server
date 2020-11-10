module.exports = {
  namespace: '/ati',
  jwt: {
    secret: process.env.SECRET,
    expiration: '48h'
  },
  db: {
    url: "mongodb://localhost:20612/ati",
    user: 'nTorres#*Enrrique@Cleo:?mama',
    pass: 'nTJacob*$%@Cleo*..bnSystem'
  },
  origins: ['http://www.ati.com.co', 'www.ati.com.co', 'ati.com.co', 'http://ati.com.co'],

}