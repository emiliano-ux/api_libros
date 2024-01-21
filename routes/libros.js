const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Libro = require("../models/Libro " );

// Middleware para validar scopes
const { requiredScopes } = require("express-oauth2-jwt-bearer");

// Esquema de validación con Joi
const libroSchema = Joi.object({
    titulo: Joi.string().required().label('Título'),
    autor: Joi.string().required().label('Autor')
});

// Obtener todos los libros
router.get('/', async (req, res, next) => {
    try {
        const libros = await Libro.find();
        res.json(libros);
    } catch (error) {
        next(error);
    }
});

// Obtener un libro por ID
router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const libro = await Libro.findById(id);

        if (!libro) {
            const error = new Error('Libro no encontrado');
            error.status = 404;
            throw error;
        }

        res.json(libro);
    } catch (error) {
        next(error);
    }
});

// Crear un nuevo libro
router.post("/", requiredScopes("write:libros"), async (req, res, next) => {
    try {
        const { error, value } = libroSchema.validate(req.body);

        if (error) {
            const validationError = new Error('Error de validación');
            validationError.status = 400;
            validationError.details = error.details.map(detail => detail.message);
            throw validationError;
        }

        const { titulo, autor } = value;
        const nuevoLibro = new Libro({ titulo, autor });

        await nuevoLibro.save();
        res.status(201).json(nuevoLibro);
    } catch (error) {
        next(error);
    }
});

// Actualizar un libro existente
router.put('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const { error, value } = libroSchema.validate(req.body);

        if (error) {
            const validationError = new Error('Error de validación');
            validationError.status = 400;
            validationError.details = error.details.map(detail => detail.message);
            throw validationError;
        }

        const { titulo, autor } = value;
        const libro = await Libro.findByIdAndUpdate(id, { titulo, autor }, { new: true });

        if (!libro) {
            const error = new Error('Libro no encontrado');
            error.status = 404;
            throw error;
        }

        res.json(libro);
    } catch (error) {
        next(error);
    }
});

// Eliminar un libro
router.delete('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const libroEliminado = await Libro.findByIdAndRemove(id);

        if (!libroEliminado) {
            const error = new Error('Libro no encontrado');
            error.status = 404;
            throw error;
        }

        res.json(libroEliminado);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
