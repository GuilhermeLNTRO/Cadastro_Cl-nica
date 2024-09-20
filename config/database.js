const { Sequelize } = require('sequelize');

// Configurando o Sequelize para usar SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite' // O arquivo do banco de dados será criado no diretório raiz do projeto
});

module.exports = sequelize;
