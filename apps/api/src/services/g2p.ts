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
	private provider: IG2PProvider;

	constructor(providerName: string, config: G2PProviderConfig) {
		switch (providerName) {
			case "openai": {
				const apiKey = config.apiKey;
				if (!apiKey) {
					throw new Error("Provider API key not provided");
				}
				this.provider = new OpenAIG2PProvider(apiKey);
				break;
			}
			default:
				throw new Error(`Unsupported G2P provider: ${providerName}`);
		}
	}

	async textToPhonemes(text: string): Promise<G2PWord[]> {
		return this.provider.textToPhonemes(text);
	}

	getProviderInfo() {
		return { name: this.provider.name, version: this.provider.version };
	}
}
