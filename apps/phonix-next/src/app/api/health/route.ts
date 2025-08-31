import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json({
		name: "Phonix G2P API",
		version: "0.0.1",
		endpoints: {
			"/api/g2p": "POST - Convert text to phonemic transcription",
		},
	});
}
