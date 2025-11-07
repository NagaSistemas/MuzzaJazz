const Joi = require('joi');

// Esquemas de validação
const schemas = {
  reserva: Joi.object({
    nome: Joi.string().min(2).max(100).required(),
    sobrenome: Joi.string().min(2).max(100).required(),
    whatsapp: Joi.string().pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/).required(),
    data: Joi.date().min('now').required(),
    adultos: Joi.number().integer().min(1).max(20).required(),
    criancas: Joi.number().integer().min(0).max(20).default(0),
    area: Joi.string().valid('interna', 'externa').required(),
    valor: Joi.number().min(0).required(),
    observacoes: Joi.string().max(500).allow('')
  }),

  login: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required()
  }),

  mesa: Joi.object({
    numero: Joi.string().required(),
    capacidade: Joi.number().integer().min(1).max(20).required(),
    area: Joi.string().valid('interna', 'externa').required(),
    status: Joi.string().valid('ativa', 'inativa').default('ativa'),
    observacoes: Joi.string().max(200).allow('')
  })
};

// Middleware de validação
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schemas[schema].validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.details.map(d => d.message)
      });
    }
    
    req.body = value;
    next();
  };
};

module.exports = { validate, schemas };
