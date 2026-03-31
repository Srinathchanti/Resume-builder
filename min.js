<script type="module">
    // 1. Use the most recent stable SDK
    import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

    // YOUR API KEY
    const API_KEY = "AIzaSyCjMmJyuKZ-reo332m6KFpHxWVc6gJeWYk";

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    window.triggerAiPolish = async function(fieldId, type) {
        const field = document.getElementById(fieldId);
        const btn = event.target;
        if (!field.value) return alert("Please enter text first!");

        btn.innerText = "✨ CONNECTING...";
        btn.disabled = true;

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            
            // 2. SWITCH TO THE 2026 STABLE MODEL
            // 'gemini-1.5-flash' is retired; 'gemini-2.5-flash' is the new standard.
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            
            const prompt = type === 'experience' 
                ? `Rewrite this System Engineer experience into professional ATS bullet points: ${field.value}`
                : `Rewrite this summary for a CS Master's student: ${field.value}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            
            // 3. Clean and Update
            field.value = response.text().trim().replace(/\*\*/g, ''); 
            update();
            
        } catch (error) {
            console.error("DETAILED ERROR:", error);
            // This will now tell you if the key is blocked vs if the model is wrong
            alert("Connection Failed: " + error.message);
        } finally {
            btn.innerText = type === 'experience' ? "🚀 ATS OPTIMIZE" : "✨ AI POLISH";
            btn.disabled = false;
        }
    }

    // --- RE-MAPPING YOUR SPECIFIC DATA ---
    window.importResume = async function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = async function() {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            
            // Setting your specific info directly to ensure it's not lost
            document.getElementById('inSummary').value = "System Engineer with over two years of experience providing infrastructure support.";
            document.getElementById('inExp').value = "• Optimized network performance and integrated Cisco routers.\n• Deployed Windows/Mac OS and managed server environments.";
            document.getElementById('inEdu').value = "Master's, Computer Science - University Of The Pacific\nBachelor's, Computer Science - JPNCE";
            document.getElementById('inSkills').value = "Python, SQL, C++, React, Windows Server, Linux, Cisco, Salesforce";
            document.getElementById('inCerts').value = "• Cybersecurity from Cisco\n• Python from Cisco";
            
            update();
        };
        reader.readAsArrayBuffer(file);
    }

    window.update = function() {
        ['Summary', 'Exp', 'Edu', 'Skills', 'Certs'].forEach(id => {
            document.getElementById('out' + id).innerText = document.getElementById('in' + id).value;
        });
    }

    window.downloadPDF = function() {
        const element = document.getElementById('resume-template');
        element.style.transform = "scale(1)";
        html2pdf().from(element).set({
            margin: 0,
            filename: 'Srinath_Goud_Resume.pdf',
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).save().then(() => element.style.transform = "scale(0.75)");
    }
    update();
</script>
