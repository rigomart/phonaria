const { transcribeText } = require('./src/services/llm-transcription');

// Test the transcribeText function
async function testTranscribe() {
  const testText = "hello world";
  const env = {}; // Empty environment for testing

  try {
    const result = await transcribeText(testText, env);
    console.log("Transcription result:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

testTranscribe();