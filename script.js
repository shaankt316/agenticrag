document.addEventListener("DOMContentLoaded", () => {

    // --- ANIMATION LOGIC START ---
    const initBlurText = () => {
        const title = document.getElementById('animatedTitle');
        if (!title) return;

        // Get the title lines (spans with class title-line)
        const lines = title.querySelectorAll('.title-line');
        if (lines.length === 0) return;

        // Config
        const delay = 150; // ms per line

        lines.forEach((line, lineIndex) => {
            const text = line.textContent.trim();
            const words = text.split(' ');

            // Clear existing text
            line.innerHTML = '';

            words.forEach((word, wordIndex) => {
                const span = document.createElement('span');
                span.textContent = word;
                span.className = 'blur-word';
                // Stagger animation: lines + words
                span.style.animationDelay = `${(lineIndex * words.length + wordIndex) * delay}ms`;

                line.appendChild(span);

                // Add space after word unless it's the last one
                if (wordIndex < words.length - 1) {
                    const space = document.createTextNode(' ');
                    line.appendChild(space);
                }
            });
        });

        // FORCE ANIMATION START
        requestAnimationFrame(() => {
            const spans = title.querySelectorAll('.blur-word');
            spans.forEach(s => s.classList.add('animate'));
        });

        // Safety fallback
        setTimeout(() => {
            const spans = title.querySelectorAll('.blur-word');
            spans.forEach(s => s.style.opacity = '1');
        }, 2000);
    };

    initBlurText();
    // --- ANIMATION LOGIC END ---

    // --- LOGO FADE ON SCROLL ---
    const handleLogoFade = () => {
        const logo = document.querySelector('.site-logo');
        if (!logo) return;

        const scrollY = window.scrollY;
        const fadeDistance = 200; // Pixels to complete fade
        const opacity = Math.max(1 - (scrollY / fadeDistance), 0);

        logo.style.opacity = opacity;
    };

    window.addEventListener('scroll', handleLogoFade);
    // --- LOGO FADE END ---

    // --- GRADUAL BLUR LOGIC ---
    const addGradualBlur = (target) => {
        // Config
        const config = {
            strength: 2,
            divCount: 8,
            height: '6rem',
            position: 'bottom'
        };

        const container = document.createElement('div');
        Object.assign(container.style, {
            position: 'absolute',
            bottom: '0',
            left: '0',
            width: '100%',
            height: config.height,
            pointerEvents: 'none',
            zIndex: '2',
            borderRadius: '0 0 12px 12px',
            opacity: '0',
            animation: 'blurFadeIn 0.8s ease-out forwards'
        });

        const increment = 100 / config.divCount;

        for (let i = 1; i <= config.divCount; i++) {
            const progress = i / config.divCount;
            const blurValue = 0.0625 * (progress * config.divCount + 1) * config.strength;

            const p1 = Math.round((increment * i - increment) * 10) / 10;
            const p2 = Math.round((increment * i) * 10) / 10;
            const p3 = Math.round((increment * i + increment) * 10) / 10;
            const p4 = Math.round((increment * i + increment * 2) * 10) / 10;

            const div = document.createElement('div');

            const gradient = `linear-gradient(to bottom, transparent ${p1}%, black ${p2}%, black ${p3}%, transparent ${p4}%)`;

            Object.assign(div.style, {
                position: 'absolute',
                inset: '0',
                maskImage: gradient,
                webkitMaskImage: gradient,
                backdropFilter: `blur(${blurValue}rem)`,
                webkitBackdropFilter: `blur(${blurValue}rem)`,
            });

            container.appendChild(div);
        }

        target.appendChild(container);
    };


    // Supabase Config
    const SUPABASE_URL = "https://rjhegwuqzujnstlachws.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqaGVnd3VxenVqbnN0bGFjaHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MzM4NDMsImV4cCI6MjA4MzIwOTg0M30.RbWwZG5Y6CQeRim9pcUaiBoresnHR-Sq5QlGsRiBdxA";

    let sb = null;
    if (window.supabase) {
        sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    const form = document.getElementById("certificateForm");
    const input = document.getElementById("fullName");
    const result = document.getElementById("resultContainer");
    const submitBtn = document.getElementById("submitBtn");

    // UI Helpers
    const setLoading = (state) => {
        submitBtn.disabled = state;
        const btnText = submitBtn.querySelector(".btn-text");
        const loader = submitBtn.querySelector(".loader");
        const arrow = submitBtn.querySelector(".arrow-icon");

        if (btnText) btnText.style.display = state ? "none" : "inline";
        if (arrow) arrow.style.display = state ? "none" : "inline";
        if (loader) loader.style.display = state ? "inline-block" : "none";
    };

    const downloadImage = async (url, name) => {
        const btn = document.querySelector('.download-btn');
        if (!btn) return;

        const originalText = btn.innerHTML;
        btn.innerHTML = 'Downloading...';
        btn.style.opacity = '0.7';
        btn.style.pointerEvents = 'none';

        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `${name}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('Download failed:', err);
            window.open(url, '_blank');
        } finally {
            if (btn) {
                btn.innerHTML = originalText;
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
            }
        }
    };

    const showSuccess = (name, url) => {
        result.style.display = "flex";
        result.innerHTML = `
    <div class="success-card">
        <div class="certificate-preview">
            <img src="${url}" alt="Certificate for ${name}" class="cert-image-preview" onload="this.style.display='block'" onerror="this.style.display='none'">
            
            <div style="margin-top: 1rem;">
                <h3 class="cert-name">${name}</h3>
                <div class="cert-details">SPACS CEC Workshop • Sept 2025</div>
            </div>
        </div>
        <p style="margin-bottom: 1rem; color: #aeb1ce; font-size: 0.9rem;">Your certificate is ready!</p>
        <button onclick="downloadImage('${url}', '${name}')" class="download-btn">
            Download Certificate
        </button>
    </div>
`;
        window.downloadImage = downloadImage;

        // Add Gradual Blur Effect to the success card
        const card = result.querySelector('.success-card');
        if (card) addGradualBlur(card);
    };

    const showError = (msg) => {
        result.style.display = "flex";
        result.innerHTML = `<div class="error-message">${msg}</div>`;
    };

    function toTitleCase(str) {
        return str.replace(
            /\w\S*/g,
            text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
        );
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = input.value.trim();
        if (!name) return;

        setLoading(true);
        result.style.display = "none";
        result.innerHTML = "";

        try {
            if (sb) {
                // Generate search variants: Original, Lowercase, Title Case
                const searchVariants = [
                    name,
                    name.toLowerCase(),
                    toTitleCase(name)
                ];
                // Remove duplicates
                const uniqueVariants = [...new Set(searchVariants)];

                let foundMatch = null;

                // Try searching for each variant
                for (const variant of uniqueVariants) {
                    const { data: files, error } = await sb.storage
                        .from('certificates')
                        .list('', {
                            limit: 10,
                            search: variant
                        });

                    if (!error && files && files.length > 0) {
                        // Found a match!
                        foundMatch = files[0];
                        break; // Stop searching once found
                    }
                }

                if (foundMatch) {
                    const { data } = sb.storage.from('certificates').getPublicUrl(foundMatch.name);
                    showSuccess(foundMatch.name.replace(/\.[^/.]+$/, ""), data.publicUrl);
                    return;
                }
            }

            // Fallback for direct file access (if list fails or no partial match found)
            const candidates = [
                name,
                name.toLowerCase(),
                name.toUpperCase(),
                toTitleCase(name)
            ];
            const uniqueNames = [...new Set(candidates)];
            console.log("Checking variants:", uniqueNames);

            for (const variant of uniqueNames) {
                const encodedFile = encodeURIComponent(`${variant}.png`);
                const url = `https://rjhegwuqzujnstlachws.supabase.co/storage/v1/object/public/certificates/${encodedFile}`;

                try {
                    const res = await fetch(url, { method: "HEAD" });
                    if (res.ok) {
                        showSuccess(variant, url);
                        return;
                    }
                } catch (ignore) { }
            }
            showError(`Certificate not found for "${name}". Try typing the full name.`);

        } catch (err) {
            console.error(err);
            showError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    });
});
