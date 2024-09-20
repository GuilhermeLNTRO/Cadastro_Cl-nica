const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo Paciente
const Paciente = sequelize.define('Paciente', {
    CPF: {
        type: DataTypes.STRING(11),
        primaryKey: true,
        allowNull: false,
        validate: {
            is: {
                args: /^\d{11}$/,
                msg: 'CPF deve conter exatamente 11 dígitos numéricos.'
            }
        }
    },
    nomeCompleto: {
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
        allowNull: false,
        validate: {
            isValidHora(value) {
                const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
                if (!regex.test(value)) {
                    throw new Error('Hora deve estar no formato de 24 horas (HH:MM).');
                }
            }
        }
    }
});

module.exports = Paciente;
