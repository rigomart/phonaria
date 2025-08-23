import { OpenAIService } from "./openai";

/**
 * Core domain types for G2P
 */
export interface G2PWord {
	word: string;
	phonemes: string[];
}

export interface G2PResponse {
	words: G2PWord[];
}

/**
 * Provider configuration type. Keep it open-ended to support provider-specific options.
 */
export interface G2PProviderConfig {
	apiKey: string;
	baseUrl?: string;
	[key: string]: unknown;
}

/**
 * Contract every G2P provider must implement.
 */
export interface IG2PProvider {
	readonly name: string;
	readonly version?: string;
	textToPhonemes(text: string): Promise<G2PWord[]>;
	initialize?(): Promise<void>;
}

/**
 * OpenAI-backed G2P provider that delegates to the existing OpenAIService.
 */
export class OpenAIG2PProvider implements IG2PProvider {
	readonly name = "openai";
	readonly version = "1.0.0";

	private openaiService: OpenAIService;

	constructor(apiKey: string) {
		this.openaiService = new OpenAIService(apiKey);
	}

	async textToPhonemes(text: string): Promise<G2PWord[]> {
		return this.openaiService.textToPhonemes(text);
	}
}

/**
 * Facade service that selects and uses a provider to perform G2P conversion.
 *
 * It intentionally hides provider implementation details from callers.
 */
export class G2PService {
	private provider: IG2PProvider | null = null;
	private initialized = false;
	private config: G2PProviderConfig;

	constructor(providerName: string, config: G2PProviderConfig) {
		this.config = config;

		switch (providerName) {
			case "openai": {
				const apiKey = config.apiKey;
				if (!apiKey) {
					throw new Error("Provider API key not provided");
				}
				this.provider = new OpenAIG2PProvider(apiKey);
				this.initialized = true;
				break;
			}
			case "phonetic": {
				// Create the provider - phonetic engine handles dictionary + rules only
				this.createPhoneticProvider().catch((error) => {
					console.error("Failed to initialize phonetic provider:", error);
				});
				break;
			}
			default:
				throw new Error(`Unsupported G2P provider: ${providerName}`);
		}
	}

	/**
	 * Create phonetic provider (will be initialized later)
	 */
	private async createPhoneticProvider(): Promise<void> {
		try {
			const { PhoneticG2PProvider } = await import("./phonetic-g2p-provider");
			this.provider = new PhoneticG2PProvider();
			// Initialize the provider if it has an init method
			if (this.provider.initialize) {
				await this.provider.initialize();
			}
			this.initialized = true;
		} catch (error) {
			console.error("Failed to create phonetic provider:", error);
			// Fallback to OpenAI provider if phonetic fails
			console.log("Falling back to OpenAI provider");
			if (this.config.apiKey) {
				this.provider = new OpenAIG2PProvider(this.config.apiKey);
				this.initialized = true;
			} else {
				throw new Error("Cannot fallback to OpenAI: no API key provided");
			}
		}
	}

	/**
	 * Initialize the service (for providers that need async initialization)
	 */
	async initialize(): Promise<void> {
		if (this.initialized) return;

		await this.createPhoneticProvider();
	}

	async textToPhonemes(text: string): Promise<G2PWord[]> {
		if (!this.provider) {
			throw new Error("G2P provider not initialized");
		}
		return this.provider.textToPhonemes(text);
	}

	getProviderInfo() {
		if (!this.provider) {
			throw new Error("G2P provider not initialized");
		}
		return { name: this.provider.name, version: this.provider.version };
	}
}
