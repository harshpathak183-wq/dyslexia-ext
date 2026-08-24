// Helper function to find the current active tab
async function getActiveTab() {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
}

// 1. DYSLEXIA FONT
document.getElementById('btn-font').onclick = async function() {
    this.classList.toggle('active-btn');
    chrome.scripting.executeScript({
        target: { tabId: (await getActiveTab()).id },
        function: () => {
            if (!document.getElementById('df-font')) {
                const s = document.createElement('style'); s.id = 'df-font';
                s.innerHTML = `* { font-family: 'Comic Sans MS', 'Chalkboard SE', sans-serif !important; letter-spacing: 1.5px !important; line-height: 1.8 !important; }`;
                document.head.appendChild(s);
            }
            document.getElementById('df-font').disabled = !document.getElementById('df-font').disabled;
        }
    });
};

// 2. COLOR TINT
document.getElementById('btn-tint').onclick = async function() {
    this.classList.toggle('active-btn');
    chrome.scripting.executeScript({
        target: { tabId: (await getActiveTab()).id },
        function: () => {
            if (!document.getElementById('df-tint')) {
                const s = document.createElement('style'); s.id = 'df-tint';
                s.innerHTML = `
                    body, html { background-color: #fdf4e3 !important; color: #111 !important; }
                    main, article, section, p, span, div:not(#df-ruler) { background-color: transparent !important; color: #111 !important; }
                    table, tr, td, ul, li { background-color: transparent !important; }
                `;
                document.head.appendChild(s);
            }
            document.getElementById('df-tint').disabled = !document.getElementById('df-tint').disabled;
        }
    });
};

// 3. READING RULER
document.getElementById('btn-ruler').onclick = async function() {
    this.classList.toggle('active-btn');
    chrome.scripting.executeScript({
        target: { tabId: (await getActiveTab()).id },
        function: () => {
            let ruler = document.getElementById('df-ruler');
            if (!ruler) {
                ruler = document.createElement('div');
                ruler.id = 'df-ruler';
                ruler.style.cssText = 'position:fixed; left:0; width:100%; height:45px; background:rgba(0,0,0,0.15); border-top:2px solid #ff4757; border-bottom:2px solid #ff4757; pointer-events:none; z-index:2147483647; transform:translateY(-50%); display:none;';
                document.body.appendChild(ruler);
                document.addEventListener('mousemove', (e) => {
                    if (ruler.style.display === 'block') ruler.style.top = e.clientY + 'px';
                });
            }
            ruler.style.display = (ruler.style.display === 'block') ? 'none' : 'block';
        }
    });
};

// 4. DICTIONARY (Styled with Tint and Font)
document.getElementById('btn-dict').onclick = async function() {
    this.classList.toggle('active-btn');
    chrome.scripting.executeScript({
        target: { tabId: (await getActiveTab()).id },
        function: () => {
            window.dfDictOn = !window.dfDictOn;
            
            // Custom Toast for instructions instead of alert()
            function showToast(msg) {
                let t = document.getElementById('df-toast');
                if(!t) {
                    t = document.createElement('div');
                    t.id = 'df-toast';
                    t.style.cssText = 'position:fixed; top:20px; right:20px; background:#fdf4e3; color:#111; padding:15px; border-radius:8px; border:2px solid #111; font-family:"Comic Sans MS", sans-serif; letter-spacing:1px; z-index:2147483647; box-shadow:0 4px 12px rgba(0,0,0,0.3); display:none;';
                    document.body.appendChild(t);
                }
                t.innerText = msg;
                t.style.display = 'block';
                setTimeout(() => t.style.display = 'none', 4000);
            }

            if (window.dfDictOn) showToast("📖 Dictionary ON: Highlight any single word!");
            
            if (!document.getElementById('df-tooltip')) {
                const tip = document.createElement('a');
                tip.id = 'df-tooltip';
                // STYLED WITH TINT COLORS AND FONT
                tip.style.cssText = 'display:none; position:absolute; background:#fdf4e3; color:#111; padding:10px 15px; border-radius:8px; border:2px solid #111; font-size:16px; font-family:"Comic Sans MS", sans-serif; letter-spacing:1.5px; text-decoration:none; z-index:2147483647; box-shadow:0 4px 12px rgba(0,0,0,0.3);';
                tip.target = '_blank';
                document.body.appendChild(tip);

                document.addEventListener('mouseup', (e) => {
                    if (!window.dfDictOn) return;
                    let txt = window.getSelection().toString().trim();
                    if (txt && !txt.includes(' ')) {
                        tip.href = "https://www.google.com/search?q=define+" + encodeURIComponent(txt);
                        tip.innerText = "🔍 Define: " + txt;
                        tip.style.left = e.pageX + 'px';
                        tip.style.top = (e.pageY - 50) + 'px';
                        tip.style.display = 'block';
                    } else tip.style.display = 'none';
                });
                document.addEventListener('mousedown', (e) => { if (e.target.id !== 'df-tooltip') tip.style.display = 'none'; });
            }
        }
    });
};

// 5. TEXT-TO-SPEECH (Custom notification added)
document.getElementById('btn-speech').onclick = async function() {
    this.classList.toggle('active-btn');
    chrome.scripting.executeScript({
        target: { tabId: (await getActiveTab()).id },
        function: () => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            } else {
                let txt = window.getSelection().toString().trim();
                if (!txt) {
                    let t = document.getElementById('df-toast');
                    if(!t) {
                        t = document.createElement('div');
                        t.id = 'df-toast';
                        t.style.cssText = 'position:fixed; top:20px; right:20px; background:#fdf4e3; color:#111; padding:15px; border-radius:8px; border:2px solid #111; font-family:"Comic Sans MS", sans-serif; letter-spacing:1px; z-index:2147483647; box-shadow:0 4px 12px rgba(0,0,0,0.3);';
                        document.body.appendChild(t);
                    }
                    t.innerText = "🔊 Highlight a paragraph of text first!";
                    t.style.display = 'block';
                    setTimeout(() => t.style.display = 'none', 4000);
                    return;
                }
                let speech = new SpeechSynthesisUtterance(txt);
                speech.rate = 0.9;
                window.speechSynthesis.speak(speech);
            }
        }
    });
};

// 6. IMAGE DETECTOR (Styled centered popup instead of alert)
document.getElementById('btn-img').onclick = async function() {
    this.classList.toggle('active-btn');
    chrome.scripting.executeScript({
        target: { tabId: (await getActiveTab()).id },
        function: () => {
            window.dfImgOn = !window.dfImgOn;
            
            // Custom Centered Popup for Images
            function showImgPopup(msg) {
                let popup = document.getElementById('df-img-popup');
                if (!popup) {
                    popup = document.createElement('div');
                    popup.id = 'df-img-popup';
                    popup.style.cssText = 'display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:#fdf4e3; color:#111; padding:25px; border-radius:12px; border:3px solid #111; font-size:18px; font-family:"Comic Sans MS", sans-serif; letter-spacing:1.5px; z-index:2147483647; box-shadow:0 10px 25px rgba(0,0,0,0.5); max-width:400px; text-align:center; line-height: 1.6;';
                    document.body.appendChild(popup);
                }
                popup.innerText = msg;
                popup.style.display = 'block';
                setTimeout(() => { popup.style.display = 'none'; }, 6000);
            }

            if (!document.getElementById('df-img-style')) {
                const s = document.createElement('style'); s.id = 'df-img-style';
                s.innerHTML = `.df-img-detect img { cursor:crosshair !important; outline:4px solid #007BFF !important; box-shadow: 0 0 15px #007BFF !important;}`;
                document.head.appendChild(s);
                
                document.addEventListener('click', (e) => {
                    if (!window.dfImgOn) return;
                    if (e.target.tagName.toLowerCase() === 'img') {
                        e.preventDefault(); e.stopPropagation();
                        let desc = e.target.getAttribute('alt') || "No description available for this image.";
                        window.speechSynthesis.cancel();
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance("Image details: " + desc));
                        
                        showImgPopup("🖼️ Image Alt-Text:\n\n" + desc);
                    }
                }, true);
            }
            
            if (window.dfImgOn) {
                document.body.classList.add('df-img-detect');
                showImgPopup("🖼️ Image Detector ON:\n\nClick on any image bordered in blue to read its hidden data.");
            } else {
                document.body.classList.remove('df-img-detect');
                let p = document.getElementById('df-img-popup');
                if(p) p.style.display = 'none';
            }
        }
    });
};