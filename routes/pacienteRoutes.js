const express = require('express');
const Paciente = require('../models/paciente');
const router = express.Router();

// Listar pacientes
router.get('/', async (req, res) => {
    const pacientes = await Paciente.findAll();
    res.render('pacientes', { pacientes });
});

// Página de criar paciente
router.get('/create', (req, res) => {
    res.render('createPaciente');
});

// Criar paciente
router.post('/create', async (req, res) => {
    try {
        await Paciente.create(req.body);
        res.redirect('/pacientes');
    } catch (error) {
        res.status(400).send('Erro ao criar paciente: ' + error.message);
    }
});

// Página de editar paciente
router.get('/edit/:cpf', async (req, res) => {
    const paciente = await Paciente.findByPk(req.params.cpf);
    res.render('updatePaciente', { paciente });
});

// Atualizar paciente
router.post('/edit/:cpf', async (req, res) => {
    try {
        await Paciente.update(req.body, { where: { CPF: req.params.cpf } });
        res.redirect('/pacientes');
    } catch (error) {
        res.status(400).send('Erro ao atualizar paciente: ' + error.message);
    }
});

// Apagar paciente
router.post('/delete/:cpf', async (req, res) => {
    try {
        await Paciente.destroy({ where: { CPF: req.params.cpf } });
        res.redirect('/pacientes');
    } catch (error) {
        res.status(400).send('Erro ao apagar paciente: ' + error.message);
    }
});

module.exports = router;
