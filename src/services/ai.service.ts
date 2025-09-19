import { detectIntent, getPipelines } from "../resources/xenova.js";

export const processChatCompletion = async ({prompt, context})=>{
    try {
        const pipelines = await getPipelines();
        // const intent = detectIntent(prompt);
        let intent: any = "";
        let result;

        // const chat_res = await pipelines.chatbot(`
        //     You are an intent classifier.
        //     Your task is to classify the user input into ONE of the following intents:
        //     "correct", "summarize", "translate", "classify", "embed", "normal-chat"

        //     Examples:
        //     User: "fix this sentence: He go to market"
        //     Intent: correct

        //     User: "summarize this text about Nigeria"
        //     Intent: summarize

        //     User: "translate hello to French"
        //     Intent: translate

        //     User: "is this review positive or negative?"
        //     Intent: classify

        //     User: "who is the president of Nigeria?"
        //     Intent: qna

        //     User: "convert this text to embedding"
        //     Intent: embed

        //     User: "hi, how are you?"
        //     Intent: normal-chat

        //     User: "hi, can you explain the universe?"
        //     Intent: normal-chat

        //     User: "hello, please tell me a very long story"
        //     Intent: normal-chat

        //     Now classify:
        //     User: "${prompt}"
        //     Intent:
        //     `, {
        //     max_new_tokens: 5,
        //     temperature: 0.0 // <-- deterministic
        // });
        // intent = chat_res[0]?.generated_text;

        console.log("intent", intent);

        // switch (intent) {
        switch ("normal-chat") {
        case "correct":
            result = await pipelines.corrector(prompt.replace("correct:", "").trim());
            break;
        case "summarize":
            result = await pipelines.summarizer(prompt.replace("summarize:", "").trim());
            break;
        case "translate":
            result = await pipelines.translator(prompt.replace("translate:", "").trim());
            break;
        case "classify":
            result = await pipelines.classifier(prompt.replace("classify:", "").trim());
            break;
        case "qna":
            result = await pipelines.qna({
            question: prompt.replace("question:", "").trim(),
            context: context || "Please provide context in the request body"
            });
            break;
        case "embed":
            result = await pipelines.embedder(prompt.replace("embed:", "").trim());
            break;
        case "normal-chat":
            const systemPrompt = `
            You are a helpful AI assistant. 
            Answer clearly, politely, and informatively.
            `;
            result = await pipelines.chatbot(`${systemPrompt}\nUser: ${prompt}\nAssistant:`,
                {
                    max_new_tokens: 128,
                    temperature: 0.7,
                    stop: ["\nUser:"]
                }
            );
            // result = await pipelines.chatbot(prompt);
            break;
        // default: // generate
        //     result = await pipelines.generator(prompt, { max_new_tokens: 30 });
        }

        return ({ intent, result });
    } catch (err) {
        console.error(err);
        throw err;
  }
}