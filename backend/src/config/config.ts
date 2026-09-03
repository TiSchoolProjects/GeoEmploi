export default () => ({
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'jwt_secret',
    jwtExpiration: process.env.JWT_EXPIRATION || '1h',
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
    frontIp: process.env.FRONT_ID || 'http://localhost:5173',
  },
  database: {
    type: 'postgres',
    host: process.env.DB_HOST || 'db',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'GeoUser',
    password: process.env.DB_PASSWORD || 'GeoPassword',
    database: process.env.DB_NAME || 'GeoDB',
  },
});
