const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('clinica-tro-node', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados bem-sucedida.');

    const Paciente = sequelize.define('Paciente', {
      cpf: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false
      },
      idade: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      diaMarcado: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      horaMarcada: {
        type: DataTypes.TIME,
        allowNull: false
      }
    });

    await sequelize.sync();
    console.log('Modelo Paciente sincronizado com o banco de dados.');

  } catch (error) {
    console.error('Erro ao conectar ou sincronizar:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
