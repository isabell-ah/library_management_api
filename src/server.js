const app = require('./app');
const config = require('./config/config');
const { sequelize } = require('./models');

sequelize.sync().then(() => {
  app.listen(config.port, () => {
    console.log(
      `Server is running  in ${config.nodeEnv} mode on port ${config.port}`
    );
  });
});
// app.listen(config.port, () => {
//   console.log(
//     `Server is running  in ${config.nodeEnv} mode on port ${config.port}`
//   );
// });
