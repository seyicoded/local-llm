import { detectIntent, getPipelines } from "../resources/xenova.js";

export const processChatCompletion = async ({prompt, context})=>{
    try {
        const pipelines = await getPipelines();
        const intent = detectIntent(prompt);
        let result;

        switch (intent) {
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
        default: // generate
            result = await pipelines.generator(prompt, { max_new_tokens: 30 });
        }

        return ({ intent, result });
    } catch (err) {
        console.error(err);
        throw err;
  }
}