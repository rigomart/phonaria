import { describe, expect, it, vi } from "vitest";
import { createAzureProvider } from "./azure";

describe("Azure pronunciation generation", () => {
	it("requests Ogg/Opus and accepts its audio response", async () => {
		const fetcher = vi
			.fn()
			.mockResolvedValue(
				new Response(new Uint8Array([4, 5, 6]), { headers: { "Content-Type": "audio/ogg" } }),
			);
		const provider = createAzureProvider({
			apiKey: "key",
			region: "eastus",
			audioFormat: "ogg",
			fetcher,
		});
		const [result] = await provider.synthesize([{ id: "seat", text: "seat" }]);
		expect(fetcher.mock.calls[0][1].headers["X-Microsoft-OutputFormat"]).toBe(
			"ogg-24khz-16bit-mono-opus",
		);
		expect(result.audio).toEqual(Buffer.from([4, 5, 6]));
	});
	it("rejects MP3 bytes when Ogg output was requested", async () => {
		const provider = createAzureProvider({
			apiKey: "key",
			region: "eastus",
			audioFormat: "ogg",
			fetcher: vi
				.fn()
				.mockResolvedValue(
					new Response(new Uint8Array([4]), { headers: { "Content-Type": "audio/mpeg" } }),
				),
		});
		await expect(provider.synthesize([{ id: "seat", text: "seat" }])).rejects.toThrow(/audio type/);
	});
	it("changes speaking speed without changing the IPA request", async () => {
		const fetcher = vi
			.fn()
			.mockResolvedValue(
				new Response(new Uint8Array([4, 5, 6]), { headers: { "Content-Type": "audio/mpeg" } }),
			);
		const provider = createAzureProvider({
			apiKey: "key",
			region: "eastus",
			ratePercent: -10,
			fetcher,
		});
		await provider.synthesize([
			{ id: "adapt", text: '<phoneme alphabet="ipa" ph="ə.ˈdæpt">adapt</phoneme>' },
		]);
		expect(fetcher.mock.calls[0][1].body).toContain(
			'<prosody rate="-10%"><phoneme alphabet="ipa" ph="ə.ˈdæpt">adapt</phoneme></prosody>',
		);
	});
	it.each([
		-51,
		101,
		Number.NaN,
		0.5,
	])("rejects invalid rate %s before requesting audio", (ratePercent) => {
		expect(() => createAzureProvider({ apiKey: "key", region: "eastus", ratePercent })).toThrow(
			/rate/,
		);
	});
	it("sends explicit IPA and returns the audio bytes", async () => {
		const fetcher = vi
			.fn()
			.mockResolvedValue(
				new Response(new Uint8Array([4, 5, 6]), { headers: { "Content-Type": "audio/mpeg" } }),
			);
		const provider = createAzureProvider({ apiKey: "test-key", region: "eastus", fetcher });
		const [result] = await provider.synthesize([
			{
				id: "seat",
				text: '<phoneme alphabet="ipa" ph="sit">seat</phoneme>',
			},
		]);
		expect(fetcher).toHaveBeenCalledWith(
			"https://eastus.tts.speech.microsoft.com/cognitiveservices/v1",
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({
					"Ocp-Apim-Subscription-Key": "test-key",
					"Content-Type": "application/ssml+xml",
					"X-Microsoft-OutputFormat": "audio-24khz-160kbitrate-mono-mp3",
				}),
				body: expect.stringContaining(
					'<voice name="en-US-JennyNeural"><phoneme alphabet="ipa" ph="sit">seat</phoneme></voice>',
				),
			}),
		);
		expect(result.audio).toEqual(Buffer.from([4, 5, 6]));
	});
	it("reports failed synthesis without saving an error page as audio or exposing credentials", async () => {
		const fetcher = vi.fn().mockResolvedValue(new Response("secret-key", { status: 401 }));
		const provider = createAzureProvider({ apiKey: "secret-key", region: "eastus", fetcher });
		await expect(provider.synthesize([{ id: "seat", text: "seat" }])).rejects.toThrow(
			"Azure synthesis failed for seat (HTTP 401)",
		);
	});
	it("requires a US English voice and a valid region", () => {
		expect(() =>
			createAzureProvider({ apiKey: "key", region: "eastus", voiceId: "en-GB-SoniaNeural" }),
		).toThrow(/en-US/);
		expect(() => createAzureProvider({ apiKey: "key", region: "eastus/evil" })).toThrow(/region/);
	});
	it.each([
		[new Response("{}", { headers: { "Content-Type": "application/json" } }), /audio type/],
		[new Response(null, { headers: { "Content-Type": "audio/mpeg" } }), /empty audio/],
	])("rejects successful responses that contain no usable audio", async (response, message) => {
		const provider = createAzureProvider({
			apiKey: "key",
			region: "eastus",
			fetcher: vi.fn().mockResolvedValue(response),
		});
		await expect(provider.synthesize([{ id: "seat", text: "seat" }])).rejects.toThrow(message);
	});
	it("sanitizes network errors without leaking request headers", async () => {
		const provider = createAzureProvider({
			apiKey: "secret-key",
			region: "eastus",
			fetcher: vi.fn().mockRejectedValue(new Error("secret-key")),
		});
		await expect(provider.synthesize([{ id: "seat", text: "seat" }])).rejects.toThrow(
			"Azure request failed for seat; check connectivity or timeout",
		);
	});
});
