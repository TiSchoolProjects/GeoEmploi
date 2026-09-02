export default () => ({
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: process.env.JWT_EXPIRATION,
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS!, 10) || 10,
  },
});