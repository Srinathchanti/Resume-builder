<script type="module">
    // 1. Import the STABLE production SDK (Avoids the 404/v1beta error)
    import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

    // YOUR API KEY
    const API_KEY = "AIzaSyCjMmJyuKZ-reo332m6KFpHxWVc6gJeWYk";

    // Initialize PDF.js worker for the resume import feature
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    /**
     * AI POLISH LOGIC
     * Uses Gemini 1.5 Flash to rewrite your Summary or Experience.
     */
    window.triggerAiPolish = async function(fieldId, type) {
        const field = document.getElementById(fieldId);
        const btn = event.target;
        const originalText = field.value;

        if (!originalText) return alert("Please enter or import some text first!");

        btn.innerText = "✨ THINKING...";
        btn.disabled = true;

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            // Specifically using the stable model string
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            const prompt = type === 'experience' 
                ? `Act as an ATS expert and Technical Recruiter. Rewrite this Work Experience for a System Engineer using strong action verbs and quantifiable metrics. Format with professional bullet points using '•'. Text: "${originalText}"`
                : `Rewrite this professional resume summary for a Computer Science Master's student to be high-impact and ATS-friendly: "${originalText}"`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const polishedText = response.text();
            
            // Clean AI formatting (removes markdown stars like **)
            field.value = polishedText.trim().replace(/\*\*/g, '').replace(/\*/g, '•'); 
            update(); // Sync with the A4 preview
            
        } catch (error) {
            console.error("Gemini Error:", error);
            // Tells you the exact reason if it fails again
            alert("API Connection Error: " + error.message);
        } finally {
            btn.innerText = type === 'experience' ? "🚀 ATS OPTIMIZE" : "✨ AI POLISH";
            btn.disabled = false;
        }
    }

    /**
     * RESUME IMPORT LOGIC
     * Maps your specific background from the PDF to the editor.
     */
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
            
            // Auto-populate based on your System Engineer / CS profile
            document.getElementById('inSummary').value = "System Engineer with over two years of experience providing infrastructure and service desk support for enterprise environments.";
            document.getElementById('inExp').value = "• Optimized network performance and integrated Cisco routers.\n• Deployed Windows/Mac OS and managed server environments.\n• Automated data reporting workflows using Python.";
            document.getElementById('inEdu').value = "Master's, Computer Science - University Of The Pacific (2024-2026)\nBachelor's, Computer Science - JPNCE (2018-2022)";
            document.getElementById('inSkills').value = "Python, SQL, C++, React, Windows Server, Linux, Cisco Troubleshooting, Salesforce, VM Management";
            document.getElementById('inCerts').value = "• Cybersecurity from Cisco\n• Python from Cisco\n• Salesforce Badges\n• Computer Hardware Basics";
            
            update();
        };
        reader.readAsArrayBuffer(file);
    }

    /**
     * UI SYNC LOGIC
     * Updates the white A4 preview in real-time.
     */
    window.update = function() {
        const ids = ['Summary', 'Exp', 'Edu', 'Skills', 'Certs'];
        ids.forEach(id => {
            const input = document.getElementById('in' + id);
            const output = document.getElementById('out' + id);
            if (input && output) {
                output.innerText = input.value;
            }
        });
    }

    /**
     * EXPORT LOGIC
     */
    window.downloadPDF = function() {
        const element = document.getElementById('resume-template');
        element.style.transform = "scale(1)"; // Reset scale for high-quality export
        html2pdf().from(element).set({
            margin: 0,
            filename: 'Srinath_Goud_Resume.pdf',
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).save().then(() => element.style.transform = "scale(0.75)");
    }

    // Initial sync to clear placeholders
    update();
</script>
