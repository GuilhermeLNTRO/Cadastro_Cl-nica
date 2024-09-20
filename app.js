const express = require('express');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();
const PORT = 3000;

// Configuração do banco de dados
const sequelize = new Sequelize('sqlite::memory:'); // Usando SQLite como banco de dados em memória

// Função de validação personalizada para CPF
const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos

    if (cpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;

    // Validação de dígitos verificadores
    let soma = 0;
    let resto;
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
};

// Função de validação personalizada para o formato de hora
const validaHora = (hora) => {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(hora);
};

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
                if (!validaHora(value)) {
                    throw new Error('Hora deve estar no formato de 24 horas (HH:MM).');
                }
            }
        }
    }
});

// Configuração do Express
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rotas
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/pacientes', async (req, res) => {
    try {
        const pacientes = await Paciente.findAll();
        res.render('pacientes', { pacientes });
    } catch (error) {
        console.error('Erro ao buscar pacientes:', error);
        res.status(500).send('Erro ao buscar pacientes.');
    }
});

app.get('/pacientes/novo', (req, res) => {
    res.render('createPaciente', { error: null });
});

app.post('/pacientes/criar', async (req, res) => {
    const { cpf, nome, idade, diaMarcado, horaMarcada } = req.body;

    // Limpa caracteres não numéricos do CPF
    const cpfLimpo = cpf.replace(/[^\d]+/g, '');

    if (!validarCPF(cpfLimpo)) {
        return res.status(400).render('createPaciente', { error: 'CPF inválido.', paciente: req.body });
    }

    if (!validaHora(horaMarcada)) {
        return res.status(400).render('createPaciente', { error: 'Hora inválida. Deve estar no formato de 24 horas (HH:MM).', paciente: req.body });
    }

    try {
        await Paciente.create({
            CPF: cpfLimpo,
            nomeCompleto: nome,
            idade,
            diaMarcado,
            horaMarcada
        });
        res.redirect('/pacientes');
    } catch (error) {
        console.error('Erro ao criar paciente:', error);
        res.status(500).render('createPaciente', { error: 'Erro ao criar paciente.', paciente: req.body });
    }
});

app.get('/pacientes/editar/:cpf', async (req, res) => {
    const { cpf } = req.params;
    const cpfLimpo = cpf.replace(/[^\d]+/g, '');
    try {
        const paciente = await Paciente.findByPk(cpfLimpo);
        if (!paciente) {
            return res.status(404).send('Paciente não encontrado.');
        }
        res.render('updatePaciente', { paciente, error: null });
    } catch (error) {
        console.error('Erro ao buscar paciente:', error);
        res.status(500).send('Erro ao buscar paciente.');
    }
});

app.post('/pacientes/atualizar', async (req, res) => {
    const { cpf, nome, idade, diaMarcado, horaMarcada } = req.body;

    const cpfLimpo = cpf.replace(/[^\d]+/g, '');

    if (!validarCPF(cpfLimpo)) {
        return res.status(400).render('updatePaciente', { error: 'CPF inválido.', paciente: req.body });
    }

    if (!validaHora(horaMarcada)) {
        return res.status(400).render('updatePaciente', { error: 'Hora inválida. Deve estar no formato de 24 horas (HH:MM).', paciente: req.body });
    }

    try {
        await Paciente.update({
            nomeCompleto: nome,
            idade,
            diaMarcado,
            horaMarcada
        }, {
            where: { CPF: cpfLimpo }
        });
        res.redirect('/pacientes');
    } catch (error) {
        console.error('Erro ao atualizar paciente:', error);
        res.status(500).render('updatePaciente', { error: 'Erro ao atualizar paciente.', paciente: req.body });
    }
});

app.get('/pacientes/deletar/:cpf', async (req, res) => {
    const { cpf } = req.params;
    const cpfLimpo = cpf.replace(/[^\d]+/g, '');
    try {
        await Paciente.destroy({
            where: { CPF: cpfLimpo }
        });
        res.redirect('/pacientes');
    } catch (error) {
        console.error('Erro ao deletar paciente:', error);
        res.status(500).send('Erro ao deletar paciente.');
    }
});

// Inicialização do banco de dados e do servidor
sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
});
