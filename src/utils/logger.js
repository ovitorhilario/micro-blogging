import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Logger {
	constructor(logFilePath = null) {
		this.logFilePath = logFilePath || path.join(__dirname, '..', 'logs', 'errors.log');
		this.ensureLogDirectory();
	}

	/**
	 * Garante que o diretório de logs existe
	 */
	ensureLogDirectory() {
		const logDir = path.dirname(this.logFilePath);
		if (!fs.existsSync(logDir)) {
			fs.mkdirSync(logDir, { recursive: true });
		}
	}

	/**
	 * Formata a data e hora atual
	 */
	getTimestamp() {
		return new Date().toISOString();
	}

	/**
	 * Formata a mensagem de log
	 */
	formatLogMessage(level, context, message, error = null) {
		let logMessage = `[${this.getTimestamp()}] [${level}] [${context}] - ${message}\n`;
		
		if (error) {
			logMessage += `Error Name: ${error.name}\n`;
			logMessage += `Error Message: ${error.message}\n`;
			if (error.stack) {
				logMessage += `Stack Trace:\n${error.stack}\n`;
			}
			if (error.originalError) {
				logMessage += `Original Error: ${error.originalError}\n`;
			}
		}
		
		logMessage += '---\n';
		return logMessage;
	}

	/**
	 * Escreve no arquivo de log
	 */
	writeToFile(message) {
		try {
			fs.appendFileSync(this.logFilePath, message, 'utf8');
		} catch (err) {
			console.error('Erro ao escrever no arquivo de log:', err);
		}
	}

	/**
	 * Registra erro
	 */
	logError(error, context = 'SYSTEM') {
		const message = error.message || 'Erro desconhecido';
		const logMessage = this.formatLogMessage('ERROR', context, message, error);
		this.writeToFile(logMessage);
		console.error(logMessage);
	}

	/**
	 * Registra informação
	 */
	logInfo(message, context = 'SYSTEM') {
		const logMessage = this.formatLogMessage('INFO', context, message);
		this.writeToFile(logMessage);
		console.log(logMessage);
	}

	/**
	 * Registra aviso
	 */
	logWarning(message, context = 'SYSTEM') {
		const logMessage = this.formatLogMessage('WARNING', context, message);
		this.writeToFile(logMessage);
		console.warn(logMessage);
	}
}

export default new Logger();
