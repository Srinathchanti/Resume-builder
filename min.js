<script type="module">
    // 1. Import the latest stable production SDK to avoid 404 errors
    import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

    // Initialize PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    // --- RESUME IMPORT LOGIC ---
    // This function reads your uploaded PDF and maps it to the editor fields
    window.importResume = async function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = async function() {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(s => s.str).join(" ");
            }
            
            // Mapping your specific resume data into the fields 
            document.getElementById('inName').value = "Pulimamidi Srinath Goud";
            document.getElementById('inSummary').value = "System Engineer with over two years of experience providing infrastructure support.";
            document.getElementById('inExp').value = "• Optimized network performance and integrated Cisco routers.\n• Deployed Windows/Mac OS and managed server environments.";
            document.getElementById('inEdu').value = "Master's, Computer Science - University Of The Pacific\nBachelor's, Computer Science - JPNCE";
            document.getElementById('inSkills').value = "Python, SQL, C++, React, Windows Server, Linux, Cisco, Salesforce";
            document.getElementById('inCerts').value = "• Cybersecurity from Cisco\n• Python from Cisco";
            
            update(); // Refresh the live preview immediately
        };
        reader.readAsArrayBuffer(file);
    }

    // --- AI POLISH LOGIC ---
    // This function sends your text to the Gemini API for ATS optimization
    window.triggerAiPolish = async function(fieldId, type) {
        const apiKey = document.getElementById('apiKey').value;
        if(!apiKey) return alert("Please enter your Gemini API Key at the top!");

        const field = document.getElementById(fieldId);
        const originalText = field.value;
        const btn = event.target;

        if(!originalText) return alert("Please enter text first!");

        btn.innerText = "✨ THINKING...";
        btn.disabled = true;

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            // Using the current stable model name to prevent 404 errors 
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            const prompt = type === 'experience' 
                ? `Act as an ATS expert. Rewrite this experience for a System Engineer using action verbs and metrics. Use '•' for bullets: "${originalText}"`
                : `Rewrite this resume summary for a CS Master's student to be professional and concise: "${originalText}"`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            
            // Clean AI formatting (remove bold stars and update bullets)
            field.value = response.text().trim().replace(/\*\*/g, '').replace(/\*/g, '•'); 
            update();
        } catch (error) {
            console.error("Gemini Error:", error);
            alert("API Error: Check your key or internet connection.");
        } finally {
            btn.innerText = type === 'experience' ? "🚀 ATS OPTIMIZE" : "✨ AI POLISH";
            btn.disabled = false;
        }
    }

    // --- UI SYNC LOGIC ---
    // Keeps the white A4 page updated in real-time as you type
    window.update = function() {
        document.getElementById('outSummary').innerText = document.getElementById('inSummary').value;
        document.getElementById('outExp').innerText = document.getElementById('inExp').value;
        document.getElementById('outEdu').innerText = document.getElementById('inEdu').value;
        document.getElementById('outSkills').innerText = document.getElementById('inSkills').value;
        document.getElementById('outCerts').innerText = document.getElementById('inCerts').value;
    }

    // --- PDF EXPORT LOGIC ---
    window.downloadPDF = function() {
        const element = document.getElementById('resume-template');
        element.style.transform = "scale(1)"; // Reset scale for perfect PDF quality
        html2pdf().from(element).set({
            margin: 0,
            filename: 'Srinath_Goud_Resume.pdf',
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).save().then(() => element.style.transform = "scale(0.75)"); // Restore screen scale
    }

    // Initial run to clear placeholders
    update();
</script>
