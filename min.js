<script type="module">
    import { GoogleGenerativeAI } from "@google/generative-ai";

    window.triggerAiPolish = async function(fieldId, type) {
        const apiKey = document.getElementById('apiKey').value;
        if(!apiKey) return alert("Please enter your Gemini API Key!");

        const field = document.getElementById(fieldId);
        const originalText = field.value;
        const btn = event.target;

        if(!originalText) return alert("Please enter text first!");

        btn.innerText = "✨ THINKING...";
        btn.disabled = true;

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            // UPDATED MODEL STRING BELOW
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            const prompt = type === 'experience' 
                ? `Act as an ATS expert. Rewrite this experience for a System Engineer into professional bullet points: "${originalText}"`
                : `Rewrite this resume summary for a CS Master's student: "${originalText}"`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            field.value = response.text().trim().replace(/\*/g, '•'); 
            update();
        } catch (error) {
            console.error("Gemini Error:", error);
            alert("API Error: " + error.message);
        } finally {
            btn.innerText = type === 'experience' ? "🚀 ATS OPTIMIZE" : "✨ AI POLISH";
            btn.disabled = false;
        }
    }
</script>
