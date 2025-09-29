/**
 * SDD Implementation Verification Extension
 * Main entry point for VS Code extension
 */

import * as vscode from 'vscode';
import { FunctionAnalysisCommand } from './commands/FunctionAnalysisCommand';
import { ContractValidationCommand } from './commands/ContractValidationCommand';
import { ContractGenerationCommand } from './commands/ContractGenerationCommand';
import { ImplementationVerificationPanel } from './webview/ImplementationVerificationPanel';
import { SDDStatusBarManager } from './services/SDDStatusBarManager';
import { ExtensionContext } from './types/ExtensionTypes';

export function activate(context: vscode.ExtensionContext) {
	console.log('🚀 SDD Implementation Verification extension activated');

	// Initialize extension context
	const extensionContext: ExtensionContext = {
		context,
		outputChannel: vscode.window.createOutputChannel('SDD Tools'),
		statusBar: new SDDStatusBarManager()
	};

	// Register commands
	registerCommands(context, extensionContext);

	// Set up file system watchers for SDD compliance
	setupFileWatchers(context, extensionContext);

	// Initialize status bar
	extensionContext.statusBar.initialize();

	// Welcome message
	extensionContext.outputChannel.appendLine('✅ SDD Tools extension fully activated');
	extensionContext.outputChannel.appendLine('💡 Use Ctrl+Shift+P and type "SDD" to see available commands');
	
	// Check for Grok API key
	const config = vscode.workspace.getConfiguration('sdd');
	if (!config.get('grokApiKey')) {
		vscode.window.showWarningMessage(
			'SDD Extension: Configure your Grok API key for full functionality.',
			'Open Settings'
		).then((selection) => {
			if (selection === 'Open Settings') {
				vscode.commands.executeCommand('workbench.action.openSettings', 'sdd.grokApiKey');
			}
		});
	}

	console.log('✅ SDD Tools extension fully activated');
}

export function deactivate() {
	console.log('👋 SDD Implementation Verification extension deactivated');
}

/**
 * Register all SDD commands
 */
function registerCommands(context: vscode.ExtensionContext, extensionContext: ExtensionContext) {
	const functionAnalysis = new FunctionAnalysisCommand(extensionContext);
	const contractValidation = new ContractValidationCommand(extensionContext);
	const contractGeneration = new ContractGenerationCommand(extensionContext);

	// Function Analysis Command
	context.subscriptions.push(
		vscode.commands.registerCommand('sdd.analyzeFunction', () => {
			functionAnalysis.execute();
		})
	);

	// Contract Validation Command
	context.subscriptions.push(
		vscode.commands.registerCommand('sdd.validateContract', (uri?: vscode.Uri) => {
			contractValidation.execute(uri);
		})
	);

	// Contract Generation Command
	context.subscriptions.push(
		vscode.commands.registerCommand('sdd.generateContract', () => {
			contractGeneration.execute();
		})
	);

	// Implementation Verification Panel
	context.subscriptions.push(
		vscode.commands.registerCommand('sdd.showImplementationVerification', () => {
			ImplementationVerificationPanel.createOrShow(extensionContext, context.extensionUri);
		})
	);

	// Context menu commands for code analysis
	context.subscriptions.push(
		vscode.commands.registerCommand('sdd.analyzeSelectedFunction', () => {
			functionAnalysis.execute();
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('sdd.generateContractFromSelection', () => {
			contractGeneration.execute();
		})
	);

	// Explorer context menu command for contract validation
	context.subscriptions.push(
		vscode.commands.registerCommand('sdd.validateContractFromExplorer', (uri: vscode.Uri) => {
			contractValidation.execute(uri);
		})
	);
}

/**
 * Set up file system watchers for SDD compliance monitoring
 */
function setupFileWatchers(context: vscode.ExtensionContext, extensionContext: ExtensionContext) {
	// Watch for TypeScript/JavaScript file changes
	const codeWatcher = vscode.workspace.createFileSystemWatcher('**/*.{ts,tsx,js,jsx}');
	
	codeWatcher.onDidChange((uri) => {
		const config = vscode.workspace.getConfiguration('sdd');
		if (config.get('autoAnalyzeOnSave', true)) {
			extensionContext.outputChannel.appendLine(`📝 File changed: ${uri.fsPath}`);
		}
	});

	// Watch for contract file changes
	const contractWatcher = vscode.workspace.createFileSystemWatcher('**/*.contract.ts');
	
	contractWatcher.onDidChange((uri) => {
		const config = vscode.workspace.getConfiguration('sdd');
		if (config.get('autoValidateContracts', true)) {
			extensionContext.outputChannel.appendLine(`📋 Contract changed: ${uri.fsPath} - Auto-validating...`);
			vscode.commands.executeCommand('sdd.validateContract', uri);
		}
	});

	contractWatcher.onDidCreate((uri) => {
		extensionContext.outputChannel.appendLine(`📋 New seam contract created: ${uri.fsPath}`);
	});

	context.subscriptions.push(codeWatcher, contractWatcher);
}