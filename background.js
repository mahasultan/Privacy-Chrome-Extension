chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "processText") {
        const prompt = `Rewrite the following privacy policy to be understandable for a 10th-grade student. Keep legal accuracy:\n${request.text}`;

        fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer API KEY"
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { "role": "system", "content": "You are an AI that simplifies legal text for better readability." },
                    { "role": "user", "content": prompt }
                ],
                temperature: 0.7,
                max_tokens: 1500
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Full API Response:", data);

            if (data.error) {
                console.error("OpenAI API Error:", data.error);
                sendResponse({ summary: `Error: ${data.error.message || "Unknown error"}` });
                return;
            }

            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                sendResponse({ summary: data.choices[0].message.content });
            } else {
                console.error("Unexpected API Response Format:", data);
                sendResponse({ summary: "Error: Unexpected API response format." });
            }
        })
        .catch(error => {
            console.error("Network/Fetch Error:", error);
            sendResponse({ summary: "Error: Unable to connect to API." });
        });

        return true;
    }
    if (request.action === "askQuestion") {
        const prompt = `Answer the following question based on this privacy policy:\n\n"${request.policyText}"\n\nQuestion: ${request.question}`;
    
        fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer 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"
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: "You are a privacy assistant that answers user questions based on privacy policies." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.6,
                max_tokens: 1000
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.choices && data.choices[0]?.message?.content) {
                sendResponse({ answer: data.choices[0].message.content });
            } else {
                sendResponse({ answer: "Sorry, I couldn’t generate a response." });
            }
        })
        .catch(error => {
            console.error("Q&A API Error:", error);
            sendResponse({ answer: "There was an error connecting to the AI." });
        });
    
        return true;
    }
    
});
