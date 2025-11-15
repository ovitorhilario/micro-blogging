import { ObjectId } from 'mongodb';
import { ValidationError } from './errors.js';

class Validator {
	/**
	 * Valida se todos os campos obrigatórios estão presentes
	 */
	validateRequired(fields, data) {
		const missingFields = [];
		
		for (const field of fields) {
			if (data[field] === undefined || data[field] === null || data[field] === '') {
				missingFields.push(field);
			}
		}
		
		if (missingFields.length > 0) {
			throw new ValidationError(
				`Campos obrigatórios não preenchidos: ${missingFields.join(', ')}`
			);
		}
		
		return true;
	}

	/**
	 * Valida formato de email
	 */
	validateEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		
		if (!emailRegex.test(email)) {
			throw new ValidationError('Formato de email inválido');
		}
		
		return true;
	}

	/**
	 * Valida tamanho de string
	 */
	validateStringLength(str, min, max, fieldName = 'campo') {
		if (typeof str !== 'string') {
			throw new ValidationError(`${fieldName} deve ser uma string`);
		}
		
		const length = str.length;
		
		if (length < min) {
			throw new ValidationError(
				`${fieldName} deve ter no mínimo ${min} caracteres (atual: ${length})`
			);
		}
		
		if (max && length > max) {
			throw new ValidationError(
				`${fieldName} deve ter no máximo ${max} caracteres (atual: ${length})`
			);
		}
		
		return true;
	}

	/**
	 * Valida ObjectId do MongoDB
	 */
	validateObjectId(id, fieldName = 'ID') {
		if (!id) {
			throw new ValidationError(`${fieldName} não fornecido`);
		}
		
		if (!ObjectId.isValid(id)) {
			throw new ValidationError(`${fieldName} inválido`);
		}
		
		return true;
	}

	/**
	 * Valida se o valor é um array
	 */
	validateArray(value, fieldName = 'campo') {
		if (!Array.isArray(value)) {
			throw new ValidationError(`${fieldName} deve ser um array`);
		}
		
		return true;
	}

	/**
	 * Valida username
	 */
	validateUsername(username) {
		this.validateStringLength(username, 3, 30, 'Username');
		
		// Apenas letras, números e underscore
		const usernameRegex = /^[a-zA-Z0-9_]+$/;
		if (!usernameRegex.test(username)) {
			throw new ValidationError(
				'Username deve conter apenas letras, números e underscore'
			);
		}
		
		return true;
	}
}

export default new Validator();
