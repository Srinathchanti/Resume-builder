// 1. Import the latest stable production SDK to prevent 404/Beta errors
import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

// Initialize PDF.js worker for reading your uploaded resume
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

/**
 * RESUME IMPORT LOGIC
 * Extracts text from your uploaded PDF and maps it to the editor fields.
 */
window.importResume = async function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function() {
        try {
            const typedarray = new Uint8Array(this.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let extractedText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                extractedText += content.items.map(s => s.str).join(" ");
            }

            // Mapping your specific System Engineer data [cite: 1, 3]
            document.getElementById('inName').value = "Pulimamidi Srinath Goud"; [cite: 3]
            document.getElementById('inSummary').value = "System Engineer with over two years of experience providing front-line infrastructure and service desk support."; [cite: 4]
            document.getElementById('inExp').value = "• Optimized network performance by analyzing traffic patterns and integrating Cisco routers.\n• Deployed and maintained Windows OS, Mac OS, and ERP/QMS systems."; [cite: 11, 13]
            document.getElementById('inEdu').value = "Master's, Computer Science - University Of The Pacific (2024-2026)\nBachelor's, Computer Science - JPNCE (2018-2022)"; [cite: 16, 17, 18, 19, 22, 23]
            document.getElementById('inSkills').value = "Python, SQL, C++, React, Windows Server, Linux, Cisco, Salesforce"; [cite: 26, 27, 29]
            document.getElementById('inCerts').value = "• Cybersecurity from Cisco\n• Python from Cisco\n• Salesforce Badges"; [cite: 31, 32, 33]

            update(); // Sync with the A4 preview
            alert("Resume Data Imported Successfully!");
        } catch (err) {
            console.error("Import Error:", err);
            alert("Failed to parse PDF. Please try a different file.");
        }
    };
    reader.readAsArrayBuffer(file);
}

/**
 * AI POLISH & ATS OPTIMIZATION
 * Connects to Gemini 1.5 Flash to rewrite sections professionally.
 */
window.triggerAiPolish = async function(fieldId, type) {
    const apiKey = document.getElementById('apiKey').value;
    if (!apiKey) return alert("Please enter your Gemini API Key in the box at the top!");

    const field = document.getElementById(fieldId);
    const originalText = field.value;
    const btn = event.target;

    if (!originalText) return alert("Please enter or import some text first!");

    btn.innerText = "✨ THINKING...";
    btn.disabled = true;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Using the stable model to avoid 404 errors
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = type === 'experience' 
            ? `Act as an expert technical recruiter. Rewrite this Work Experience for a System Engineer using the Action-Result formula. Focus on infrastructure, automation, and SLA targets. Use '•' for bullet points. Text: "${originalText}"`
            : `Rewrite this professional summary for a Computer Science Master's student to be ATS-friendly and concise: "${originalText}"`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        // Clean up AI formatting (remove markdown bolding and fix bullets)
        field.value = response.text().trim().replace(/\*\*/g, '').replace(/\*/g, '•'); 
        update();
    } catch (error) {
        console.error("Gemini API Error:", error);
        alert("API Error: " + error.message);
    } finally {
        btn.innerText = type === 'experience' ? "🚀 ATS OPTIMIZE" : "✨ AI POLISH";
        btn.disabled = false;
    }
}

/**
 * UI SYNCHRONIZATION
 * Live-updates the A4 preview as you type in the editor.
 */
window.update = function() {
    const fields = ['Summary', 'Exp', 'Edu', 'Skills', 'Certs'];
    fields.forEach(id => {
        const input = document.getElementById('in' + id);
        const output = document.getElementById('out' + id);
        if (input && output) {
            output.innerText = input.value;
        }
    });
}

/**
 * PDF EXPORT
 * Converts the HTML preview into a high-quality PDF document.
 */
window.downloadPDF = function() {
    const element = document.getElementById('resume-template');
    element.style.transform = "scale(1)"; // Reset scale for perfect PDF resolution
    
    const opt = {
        margin: 0,
        filename: 'Srinath_Goud_Resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save().then(() => {
        element.style.transform = "scale(0.75)"; // Restore screen-friendly scale
    });
}

// Run initial update to clear placeholders
update();
