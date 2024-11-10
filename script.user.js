// ==UserScript==
// @name         Mtest
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Combined Multi Controls, Chat Phrases, and Skin Changer
// @author       You
// @match        https://agma.io/*
// @icon         https://cdn.discordapp.com/avatars/273991316730544128/ec62988dfc40e0f5313a8923d0883a43.webp?size=80
// @updateURL    https://raw.githubusercontent.com/frameagma/agmaio/new/script.meta.js
// @downloadURL  https://raw.githubusercontent.com/frameagma/agmaio/new/script.user.js
// @grant        none
// ==/UserScript==

// Core variables
let amountpellet;
let ischecked = false;
let isQuickChatEnabled = false;
let isSkinChangerEnabled = false;
let activeTab = 'multi';
let skinChangerActive = false;
const multikeyData = JSON.parse(localStorage.getItem("Multikey")) || {};
const phraseKeyData = JSON.parse(localStorage.getItem("PhraseKey")) || {};
const savedSlots = JSON.parse(localStorage.getItem('skinChangerSlots')) || {};
let lastUsedTime = 0;
const COOLDOWN_TIME = 6000;
let currentKeyPressHandler = null;


const settings = JSON.parse(localStorage.getItem('scriptSettings')) || {
    soundEnabled: true
};

// Power definitions
const powers = [
    {
        name: "multiple"
        , label: "Mul-pellet"
        , key: ""
    }
    , {
        name: "rec"
        , label: "Rec"
        , key: ""
    }
    , {
        name: "speed"
        , label: "Speed"
        , key: ""
    }
    , {
        name: "virus"
        , label: "Virus"
        , key: ""
    }
    , {
        name: "mothercell"
        , label: "Mothercell"
        , key: ""
    }
    , {
        name: "portal"
        , label: "Portal"
        , key: ""
    }
    , {
        name: "block"
        , label: "Block"
        , key: ""
    }
    , {
        name: "freeze"
        , label: "Freeze"
        , key: ""
    }
    , {
        name: "antiFreeze"
        , label: "Anti Freeze"
        , key: ""
    }
    , {
        name: "antiRec"
        , label: "Anti Rec"
        , key: ""
    }
    , {
        name: "shield"
        , label: "Shield"
        , key: ""
    }
    , {
        name: "virusantifreeze"
        , label: "Mul-virus"
        , key: ""
    }
    , {
        name: "mothercellantirecfreeze"
        , label: "Mul-mothercl"
        , key: ""
    }
];

// Phrase definitions
const phrases = [
    {
        name: "phrase1"
        , label: "GG"
        , key: ""
        , text: "Good game!"
    }
    , {
        name: "phrase2"
        , label: "Hello"
        , key: ""
        , text: "Hello everyone!"
    }
    , {
        name: "phrase3"
        , label: "Team?"
        , key: ""
        , text: "Want to team?"
    }
    , {
        name: "phrase4"
        , label: "Thanks"
        , key: ""
        , text: "Thanks for helping!"
    }
    , {
        name: "phrase5"
        , label: "Nice"
        , key: ""
        , text: "Nice play!"
    }
    , {
        name: "phrase6"
        , label: "Sorry"
        , key: ""
        , text: "Sorry about that!"
    }
    , {
        name: "phrase7"
        , label: "Run"
        , key: ""
        , text: "Run!"
    }
    , {
        name: "phrase8"
        , label: "Split"
        , key: ""
        , text: "Split!"
    }
    , {
        name: "phrase9"
        , label: "Feed"
        , key: ""
        , text: "Feed me!"
    }
    , {
        name: "phrase10"
        , label: "No Team"
        , key: ""
        , text: "No teaming please"
    }
];

// Key handling utilities

// Add this function near the top with other utility functions

// Sound Effects Utility
const SoundEffects = {
    success: new Audio('https://cdn.freesound.org/previews/220/220206_4100837-lq.mp3'),
    remove: new Audio('https://cdn.freesound.org/previews/220/220203_4100837-lq.mp3'),
    error: new Audio('https://cdn.freesound.org/previews/220/220208_4100837-lq.mp3'),

    playSound(type) {
        try {
            if (!settings.soundEnabled) return; // Check if sounds are enabled
            const sound = this[type];
            if (sound) {
                sound.currentTime = 0;
                sound.volume = 0.3;
                sound.play();
            }
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    }
};





const createStatusPanel = () => {
    const panel = document.createElement('div');
    panel.id = 'status-panel';

    // Wait for minimap to be available
    const positionPanel = () => {
        const minimap = document.getElementById('minimap');
        if (minimap) {
            const minimapRect = minimap.getBoundingClientRect();
            panel.style.cssText = `
                position: fixed;
                right: ${window.innerWidth - minimapRect.right}px;
                top: ${minimapRect.top - 25}px;
                width: ${minimapRect.width}px;
                background-color: transparent;
                padding: 5px;
                border-radius: 3px;
                font-size: 12px;
                color: black;
                z-index: 999;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
        }
    };

    // Initial positioning
    positionPanel();

    // Update position when window resizes
    window.addEventListener('resize', positionPanel);

    const updatePanel = () => {
        panel.innerHTML = `
            <div style="display: flex; gap: 15px;">
                <div style="display: flex; align-items: center;">
                    <span style="color: ${ischecked ? '#2ecc71' : '#e74c3c'}">⬤</span>
                    <span style="margin-left: 5px; color: ${ischecked ? '#2ecc71' : '#e74c3c'}">Multi</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <span style="color: ${isQuickChatEnabled ? '#2ecc71' : '#e74c3c'}">⬤</span>
                    <span style="margin-left: 5px; color: ${isQuickChatEnabled ? '#2ecc71' : '#e74c3c'}">Chat</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <span style="color: ${isSkinChangerEnabled ? '#2ecc71' : '#e74c3c'}">⬤</span>
                    <span style="margin-left: 5px; color: ${isSkinChangerEnabled ? '#2ecc71' : '#e74c3c'}">Skin</span>
                </div>
            </div>
        `;
    };

    // Initial update
    updatePanel();

    // Listen for status updates
    window.addEventListener('statusUpdate', () => {
        requestAnimationFrame(updatePanel);
    });

    return panel;
};




const curserMsg = (message, color) => {
    const msgContainer = document.createElement('div');
    msgContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: ${color || '#ffffff'};
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        z-index: 10000;
        pointer-events: none;
        animation: fadeInOut 2s ease-in-out;
    `;

    // Add animation keyframes if not already added
    if (!document.querySelector('#cursor-msg-style')) {
        const style = document.createElement('style');
        style.id = 'cursor-msg-style';
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, 20px); }
                15% { opacity: 1; transform: translate(-50%, 0); }
                85% { opacity: 1; transform: translate(-50%, 0); }
                100% { opacity: 0; transform: translate(-50%, -20px); }
            }
        `;
        document.head.appendChild(style);
    }

    msgContainer.textContent = message;
    document.body.appendChild(msgContainer);

    // Remove the message after animation
    setTimeout(() => {
        msgContainer.remove();
    }, 2000);
};

const showErrorPopup = (message) => {
    // Remove any existing error popup
    const existingPopup = document.querySelector('.error-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup
    const popup = document.createElement('div');
    popup.className = 'error-popup';
    popup.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(255, 0, 0, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        animation: slideDown 0.3s ease-out;
    `;

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from { transform: translate(-50%, -100%); }
            to { transform: translate(-50%, 0); }
        }
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    popup.textContent = message;
    document.body.appendChild(popup);

    // Remove popup after 3 seconds
    setTimeout(() => {
        popup.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => popup.remove(), 300);
    }, 3000);
};

const findExistingKeybind = (keyCode, storageKey, excludeName) => {
    const data = JSON.parse(localStorage.getItem(storageKey)) || {};
    for (const [name, binding] of Object.entries(data)) {
        if (binding.keyCode === keyCode && name !== excludeName) {
            return name;
        }
    }
    return null;
};



const getKeyInfo = (keyCode) => {
    const specialCharacters = {
        186: ";"
        , 187: "="
        , 188: ","
        , 189: "-"
        , 190: "."
        , 191: "/"
        , 192: "`"
        , 219: "["
        , 220: "\\"
        , 221: "]"
        , 222: "'"
    };

    const numpadNumbers = {
        96: "0"
        , 97: "1"
        , 98: "2"
        , 99: "3"
        , 100: "4"
        , 101: "5"
        , 102: "6"
        , 103: "7"
        , 104: "8"
        , 105: "9"
        , 111: "/"
        , 106: "*"
        , 109: "-"
        , 107: "+"
        , 110: "."
    };

    // Remove browser-reserved keys from invalid keys
    const invalidKeys = {
        9: "Tab", // Keep Tab as invalid
        20: "CapsLock"
        , 144: "NumLock"
        , 145: "ScrollLock",
        // Removed: Ctrl, Alt, Shift, Enter, Space, etc.
    };

    if (invalidKeys.hasOwnProperty(keyCode)) {
        return {
            valid: false
        };
    }

    let key = "";
    if ((keyCode >= 65 && keyCode <= 90) || (keyCode >= 48 && keyCode <= 57)) {
        key = String.fromCharCode(keyCode)
            .toLowerCase();
    } else if (specialCharacters.hasOwnProperty(keyCode)) {
        key = specialCharacters[keyCode];
    } else if (numpadNumbers.hasOwnProperty(keyCode)) {
        key = numpadNumbers[keyCode];
    } else {
        // Allow other keys that aren't explicitly invalid
        key = String.fromCharCode(keyCode)
            .toLowerCase();
        return {
            valid: true
            , key
        };
    }

    return {
        valid: true
        , key
    };
};

// Multi Controls Functions
const multiple = async (num, type) => {
    const delay = parseInt(multikeyData.dropDelay || '50');
    for (let i = 0; i < num; i++) {
        sendPw(type);
        if (delay > 0 && i < num - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

// Chat Functions
const sendChat = (text) => {
    const chatbox = document.getElementById('chtbox');
    if (chatbox) {
        chatbox.value = text;
        chatbox.dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Enter'
            , code: 'Enter'
            , keyCode: 13
            , which: 13
            , bubbles: true
        }));

        // Force the chat to send immediately
        const enterEvent = new KeyboardEvent('keypress', {
            key: 'Enter'
            , code: 'Enter'
            , keyCode: 13
            , which: 13
            , bubbles: true
        });
        chatbox.dispatchEvent(enterEvent);
    }
};


// Skin Changer Functions
async function checkSkinExists(skinId) {
    try {
        const response = await fetch(`https://agma.io/skins/${skinId}.png`);
        return response.ok;
    } catch {
        return false;
    }
}

async function updateSkinPreview(skinId) {
    const preview = document.getElementById('skinPreview');
    if (!preview) return;

    try {
        const response = await fetch(`https://agma.io/skins/${skinId}.png`);
        if (response.ok) {
            preview.style.backgroundImage = `url('https://agma.io/skins/${skinId}.png')`;
        } else {
            preview.style.backgroundImage = 'none';
            updateStatus('Skin not found');
        }
    } catch (error) {
        preview.style.backgroundImage = 'none';
        updateStatus('Error loading skin preview');
    }
}

async function checkSkinExists(skinId) {
    try {
        const response = await fetch(`https://agma.io/skins/${skinId}.png`);
        return response.ok;
    } catch {
        return false;
    }
}

async function updateSkinPreview(skinId) {
    const preview = document.getElementById('skinPreview');
    if (!preview) return;

    try {
        const response = await fetch(`https://agma.io/skins/${skinId}.png`);
        if (response.ok) {
            preview.style.backgroundImage = `url('https://agma.io/skins/${skinId}.png')`;
            SoundEffects.playSound('success'); // Added sound for successful preview
        } else {
            preview.style.backgroundImage = 'none';
            updateStatus('Skin not found');
            SoundEffects.playSound('error'); // Added sound for failed preview
        }
    } catch (error) {
        preview.style.backgroundImage = 'none';
        updateStatus('Error loading skin preview');
        SoundEffects.playSound('error'); // Added sound for error
    }
}

async function useSkin(skinId) {
    const exists = await checkSkinExists(skinId);
    if (!exists) {
        updateStatus('This skin ID does not exist!');
        SoundEffects.playSound('error'); // Added sound
        return;
    }

    const currentTime = Date.now();
    const timeElapsed = currentTime - lastUsedTime;

    if (timeElapsed < COOLDOWN_TIME) {
        const remainingTime = Math.ceil((COOLDOWN_TIME - timeElapsed) / 1000);
        updateStatus(`Please wait ${remainingTime}s to change skin`);
        showWarning();
        SoundEffects.playSound('error'); // Added sound
        return;
    }

    try {
        lastUsedTime = currentTime;
        startCooldownTimer();
        await updateSkinPreview(skinId);

        window.azad(true);

        setTimeout(() => {
            $('#skinExampleMenu').click();

            const checkLoaded = () => {
                if ($('#skinsFree tr').length > 1) {
                    window.toggleSkin(skinId);

                    setTimeout(() => {
                        $('#shopModalDialog button.close').click();

                        setTimeout(() => {
                            const nick = document.getElementById('nick').value;
                            window.setNick(nick || 'Player');
                            SoundEffects.playSound('success'); // Added sound for successful skin change
                        }, 50);
                    }, 50);
                } else {
                    setTimeout(checkLoaded, 100);
                }
            };
            checkLoaded();
        }, 50);

        updateStatus('Skin changed!');

    } catch (error) {
        console.error(`Error using skin: ${error}`);
        updateStatus('Error changing skin');
        SoundEffects.playSound('error'); // Added sound
    }
}

function startCooldownTimer() {
    const slots = document.querySelectorAll('.slot');
    const applyBtn = document.getElementById('applySkinBtn');

    if (applyBtn) {
        applyBtn.disabled = true;
        applyBtn.classList.add('cooldown');
    }

    slots.forEach(slot => slot.classList.add('cooldown'));

    let timeLeft = COOLDOWN_TIME / 1000;
    updateCooldownDisplay(timeLeft);

    const countdownInterval = setInterval(() => {
        timeLeft--;
        updateCooldownDisplay(timeLeft);

        if (timeLeft <= 0) {
            slots.forEach(slot => slot.classList.remove('cooldown'));
            if (applyBtn) {
                applyBtn.disabled = false;
                applyBtn.classList.remove('cooldown');
                applyBtn.textContent = 'Apply';
                SoundEffects.playSound('success'); // Added sound when cooldown ends
            }
            clearInterval(countdownInterval);
        } else if (applyBtn) {
            applyBtn.textContent = `Wait ${timeLeft}s`;
        }
    }, 1000);
}

function updateCooldownDisplay(timeLeft) {
    const timerEl = document.getElementById('cooldownTimer');
    if (timerEl) {
        if (timeLeft > 0) {
            timerEl.textContent = `${timeLeft}s`;
            timerEl.classList.remove('hidden');
        } else {
            timerEl.classList.add('hidden');
        }
    }
}

function showWarning() {
    const timerEl = document.getElementById('cooldownTimer');
    if (timerEl) {
        timerEl.classList.remove('hidden');
        timerEl.classList.add('warning-flash');
        SoundEffects.playSound('error'); // Added sound
        setTimeout(() => timerEl.classList.remove('warning-flash'), 500);
    }
}

function updateStatus(message) {
    const statusEl = document.getElementById('statusMessage');
    if (statusEl) {
        statusEl.textContent = message;
        // Play appropriate sound based on message content
        if (message.toLowerCase().includes('error') || message.toLowerCase().includes('not found') || message.toLowerCase().includes('wait')) {
            SoundEffects.playSound('error');
        } else if (message.toLowerCase().includes('success') || message.toLowerCase().includes('changed') || message.toLowerCase().includes('saved')) {
            SoundEffects.playSound('success');
        }
        setTimeout(() => statusEl.textContent = '', 3000);
    }
}

// Get current key codes
const getKeyCodes = () => {
    const multiControls = JSON.parse(localStorage.getItem('Multikey')) || {};
    const phraseControls = JSON.parse(localStorage.getItem('PhraseKey')) || {};

    return {
        // Multi controls
        rec: multiControls.rec?.keyCode || ''
        , speed: multiControls.speed?.keyCode || ''
        , virus: multiControls.virus?.keyCode || ''
        , mothercell: multiControls.mothercell?.keyCode || ''
        , portal: multiControls.portal?.keyCode || ''
        , block: multiControls.block?.keyCode || ''
        , freeze: multiControls.freeze?.keyCode || ''
        , antiFreeze: multiControls.antiFreeze?.keyCode || ''
        , antiRec: multiControls.antiRec?.keyCode || ''
        , shield: multiControls.shield?.keyCode || ''
        , multiple: multiControls.multiple?.keyCode || ''
        , virusantifreeze: multiControls.virusantifreeze?.keyCode || ''
        , mothercellantirecfreeze: multiControls.mothercellantirecfreeze?.keyCode || '',
        // Phrase controls
        ...Object.fromEntries(
            Object.entries(phraseControls)
            .map(([key, value]) => [
                `phrase_${key}`
                , value.keyCode
            ])
        )
    };
};

const keyCodes = getKeyCodes();

// Create minimize button
const createMinimizeButton = () => {
    const button = document.createElement('div');
    button.className = 'multi-minimize-btn';
    button.style.cssText = `
        position: fixed;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: #ff9900;
        width: 20px;
        height: 60px;
        border-radius: 0 5px 5px 0;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        writing-mode: vertical-rl;
        text-orientation: mixed;
        font-size: 12px;
        padding: 5px;
        z-index: 1000;
        transition: all 0.3s ease;
        user-select: none;
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
    `;
    button.textContent = 'Controls';
    return button;
};

// Create main menu section with tabs

const createTab = (name, label) => {
    const tab = document.createElement('div');
    const firstLetter = label.charAt(0);

    tab.style.cssText = `
        flex: 1;
        padding: 8px 2px;
        cursor: pointer;
        color: ${activeTab === name ? '#ff9900' : '#999'};
        border-bottom: 2px solid ${activeTab === name ? '#ff9900' : 'transparent'};
        transition: all 0.2s ease;
        text-align: center;
        user-select: none;
        font-size: 11px;
        white-space: nowrap;
        overflow: visible;
        position: relative;
    `;

    // Create span for first letter (always visible)
    const letterSpan = document.createElement('span');
    letterSpan.textContent = firstLetter;
    letterSpan.style.cssText = `
        display: inline-block;
        transition: opacity 0.2s ease;
    `;

    // Create span for full text (hidden initially)
    const fullTextSpan = document.createElement('span');
    fullTextSpan.textContent = label;
    fullTextSpan.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        transition: opacity 0.2s ease;
        background-color: rgba(0, 0, 0, 0.8);
        padding: 2px 8px;
        border-radius: 3px;
        pointer-events: none;
        white-space: nowrap;
        z-index: 1000;
    `;

    tab.appendChild(letterSpan);
    tab.appendChild(fullTextSpan);

    // Hover effects
    tab.addEventListener('mouseenter', () => {
        fullTextSpan.style.opacity = '1';
    });

    tab.addEventListener('mouseleave', () => {
        fullTextSpan.style.opacity = '0';
    });

    tab.addEventListener('click', () => {
        activeTab = name;
        updateContent();
        document.querySelectorAll('.controls-section > div:first-child > div')
            .forEach(t => {
                if (!t.classList.contains('close-btn')) {
                    t.style.color = '#999';
                    t.style.borderBottom = '2px solid transparent';
                }
            });
        tab.style.color = '#ff9900';
        tab.style.borderBottom = '2px solid #ff9900';
    });

    return tab;
};

const createMenuSection = () => {
    const settingsTab = createTab('settings', 'Settings');
    const section = document.createElement('div');
    section.className = 'controls-section';
    section.style.cssText = `
        background-color: rgba(0, 0, 0, 0.8);
        color: #999999;
        padding: 10px;
        border-radius: 3px;
        font-family: Arial, sans-serif;
        position: fixed;
        left: 10px;
        top: calc(32%);  // Added 20px to move it down
        transform: translateY(-50%);
        width: 250px;
        height: 400px;
        z-index: 999;
        transition: all 0.3s ease;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
    `;

    // Create tabs container
    const tabsContainer = document.createElement('div');
    tabsContainer.style.cssText = `
        display: flex;
        margin-bottom: 10px;
        border-bottom: 1px solid #333;
        flex-shrink: 0;
    `;


    const multiTab = createTab('multi', 'Multi Controls');
    const chatTab = createTab('chat', 'Chat Phrases');
    const skinTab = createTab('skins', 'Skin Changer');

    tabsContainer.appendChild(multiTab);
    tabsContainer.appendChild(chatTab);
    tabsContainer.appendChild(skinTab);
    tabsContainer.appendChild(settingsTab);

    // Create close button
    const closeBtn = document.createElement('span');
    closeBtn.textContent = '−';
    closeBtn.className = 'close-btn';
    closeBtn.style.cssText = `
        cursor: pointer;
        color: #ff9900;
        font-size: 20px;
        padding: 0 5px;
        margin-left: auto;
        transition: color 0.2s ease;
    `;

    tabsContainer.appendChild(closeBtn);

    // Content container with corrected scrollbar styles
    const contentContainer = document.createElement('div');
    contentContainer.className = 'content-container';
    contentContainer.style.cssText = `
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding-right: 5px;
        margin-right: -5px;
    `;

    // Add scrollbar styles directly to the document head
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .content-container::-webkit-scrollbar {
            width: 5px !important;
            background: transparent !important;
        }

        .content-container::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2) !important;
            border-radius: 3px !important;
            margin: 2px !important;
        }

        .content-container::-webkit-scrollbar-thumb {
            background: rgba(255, 153, 0, 0.3) !important;
            border-radius: 3px !important;
            border: 1px solid rgba(255, 153, 0, 0.1) !important;
        }

        .content-container::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 153, 0, 0.5) !important;
        }

        .content-container::-webkit-scrollbar-thumb:active {
            background: rgba(255, 153, 0, 0.7) !important;
        }
    `;
    document.head.appendChild(styleSheet);

    section.appendChild(tabsContainer);
    section.appendChild(contentContainer);

    return section;
};




    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .content-container {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding-right: 5px;
            margin-right: -5px;
        }

        .content-container::-webkit-scrollbar {
            width: 5px;
            background: transparent;
        }

        .content-container::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 3px;
            margin: 2px;
        }

        .content-container::-webkit-scrollbar-thumb {
            background: rgba(255, 153, 0, 0.3);
            border-radius: 3px;
            border: 1px solid rgba(255, 153, 0, 0.1);
        }

        .content-container::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 153, 0, 0.5);
        }

        .content-container::-webkit-scrollbar-thumb:active {
            background: rgba(255, 153, 0, 0.7);
        }
    `;





const createMultiClearButton = () => {
    const clearButton = document.createElement('div');
    clearButton.style.cssText = `
        background-color: rgba(0, 0, 0, 0.3);
        color: #999999;
        padding: 5px 10px;
        border-radius: 3px;
        font-size: 12px;
        cursor: pointer;
        text-align: center;
        margin: 8px 0;
        transition: all 0.2s;
        user-select: none;
    `;
    clearButton.textContent = 'Clear All Multi Keybinds';

    clearButton.addEventListener('mouseover', () => {
        clearButton.style.color = '#ff9900';
    });

    clearButton.addEventListener('mouseout', () => {
        clearButton.style.color = '#999999';
    });

    clearButton.addEventListener('click', () => {
        // Clear localStorage
        localStorage.setItem('Multikey', '{}');

        // Reset all power keys
        powers.forEach(power => {
            power.key = '';
            if (multikeyData[power.name]) {
                delete multikeyData[power.name];
            }
        });

        // Update all key buttons
        const keyButtons = document.querySelectorAll('[data-power]');
        keyButtons.forEach(button => {
            button.textContent = '';
        });

        curserMsg('All Multi Controls keybinds cleared', '#ff9900');
    });

    return clearButton;
};


// Create clear button for Chat Phrases
const createChatClearButton = () => {
    const clearButton = document.createElement('div');
    clearButton.style.cssText = `
        background-color: rgba(0, 0, 0, 0.3);
        color: #999999;
        padding: 5px 10px;
        border-radius: 3px;
        font-size: 12px;
        cursor: pointer;
        text-align: center;
        margin: 8px 0;
        transition: all 0.2s;
        user-select: none;
    `;
    clearButton.textContent = 'Clear All Chat Keybinds';

    clearButton.addEventListener('mouseover', () => {
        clearButton.style.color = '#ff9900';
    });

    clearButton.addEventListener('mouseout', () => {
        clearButton.style.color = '#999999';
    });

    clearButton.addEventListener('click', () => {
        // Clear localStorage
        localStorage.setItem('PhraseKey', '{}');

        // Reset all phrase keys
        phrases.forEach(phrase => {
            phrase.key = '';
            if (phraseKeyData[phrase.name]) {
                delete phraseKeyData[phrase.name];
            }
        });

        // Update all key buttons
        const keyButtons = document.querySelectorAll('[data-phrase]');
        keyButtons.forEach(button => {
            button.textContent = '';
        });

        curserMsg('All Chat Phrases keybinds cleared', '#ff9900');
    });

    return clearButton;
};

// Create Multi Controls content
const createMultiContent = () => {
    const container = document.createElement('div');

    // Add clear button at the top
    container.appendChild(createMultiClearButton());

    // Toggle button
const toggle = document.createElement('div');
toggle.style.cssText = `
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 10px;
    margin: 8px 0;
    padding: 5px;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
`;

const toggleLabel = document.createElement('span');
toggleLabel.textContent = 'Multi Mode'; // or 'Quick Chat' or 'Skin Changer'
toggleLabel.style.cssText = `
    color: #999999;
    text-align: center;
    font-size: 12px;
`;

    const toggleBtn = document.createElement('div');
    toggleBtn.style.cssText = `
        background-color: ${ischecked ? '#ff9900' : '#333333'};
        color: #ffffff;
        padding: 2px 8px;
        border-radius: 3px;
        font-size: 12px;
        cursor: pointer;
        min-width: 40px;
        text-align: center;
        transition: all 0.2s;
    `;
    toggleBtn.textContent = ischecked ? 'ON' : 'OFF';

toggleBtn.addEventListener('click', () => {
    ischecked = !ischecked;
    toggleBtn.textContent = ischecked ? 'ON' : 'OFF';
    toggleBtn.style.backgroundColor = ischecked ? '#ff9900' : '#333333';
    if (ischecked) {
        SoundEffects.playSound('success');
        curserMsg(`Multi turned ON`, 'green');
    } else {
        SoundEffects.playSound('remove');
        curserMsg(`Multi turned OFF`, 'red');  // Changed to red for OFF state
    }

    // Update status panel immediately
    const panel = document.getElementById('status-panel');
    if (panel) {
        const multiDot = panel.querySelector('div:first-child span:first-child');
        const multiText = panel.querySelector('div:first-child span:last-child');
        if (multiDot && multiText) {
            multiDot.style.color = ischecked ? '#2ecc71' : '#e74c3c';
            multiText.style.color = ischecked ? '#2ecc71' : '#e74c3c';
        }
    }
});

    toggle.appendChild(toggleLabel);
    toggle.appendChild(toggleBtn);
    container.appendChild(toggle);


    const delaySliderContainer = document.createElement('div');
delaySliderContainer.style.cssText = `
    margin: 12px 0;
    padding: 5px;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
`;

const delaySliderLabel = document.createElement('div');
delaySliderLabel.style.cssText = `
    color: #999999;
    margin-bottom: 5px;
    font-size: 12px;
    display: flex;
    justify-content: space-between;
`;
delaySliderLabel.innerHTML = `<span>Drop Delay (ms)</span><span id="delayValue">${multikeyData.dropDelay || '50'}</span>`;

const delaySlider = document.createElement('input');
delaySlider.type = 'range';
delaySlider.min = '0';
delaySlider.max = '200';
const savedDelay = multikeyData.dropDelay || '50';
delaySlider.value = savedDelay;

// Calculate initial gradient position
const delayValue = (savedDelay - delaySlider.min) / (delaySlider.max - delaySlider.min) * 100;
delaySlider.style.cssText = `
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    background: linear-gradient(to right, #ff9900 0%, #ff9900 ${delayValue}%, #333 ${delayValue}%, #333 100%);
    border-radius: 2px;
    outline: none;
    opacity: 0.7;
    transition: opacity 0.2s;
`;

delaySlider.addEventListener('input', function() {
    const value = (this.value - this.min) / (this.max - this.min) * 100;
    this.style.background = `linear-gradient(to right, #ff9900 0%, #ff9900 ${value}%, #333 ${value}%, #333 100%)`;
    document.getElementById('delayValue').textContent = this.value;
    multikeyData.dropDelay = this.value;
    localStorage.setItem("Multikey", JSON.stringify(multikeyData));
});

delaySliderContainer.appendChild(delaySliderLabel);
delaySliderContainer.appendChild(delaySlider);
container.appendChild(delaySliderContainer);

    // Pellet slider
    const sliderContainer = document.createElement('div');
    sliderContainer.style.cssText = `
        margin: 12px 0;
        padding: 5px;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 3px;
    `;

    const sliderLabel = document.createElement('div');
    sliderLabel.style.cssText = `
        color: #999999;
        margin-bottom: 5px;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
    `;
    sliderLabel.innerHTML = `<span>Pellet Amount</span><span id="pelletValue">15</span>`;

const slider = document.createElement('input');
slider.type = 'range';
slider.min = '1';
slider.max = '30';
const savedAmount = amountpellet || '15';
slider.value = savedAmount;

// Calculate initial gradient position
const pelletValue = (savedAmount - slider.min) / (slider.max - slider.min) * 100;
slider.style.cssText = `
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    background: linear-gradient(to right, #ff9900 0%, #ff9900 ${pelletValue}%, #333 ${pelletValue}%, #333 100%);
    border-radius: 2px;
    outline: none;
    opacity: 0.7;
    transition: opacity 0.2s;
`;

    slider.addEventListener('input', function () {
        const value = (this.value - this.min) / (this.max - this.min) * 100;
        this.style.background = `linear-gradient(to right, #ff9900 0%, #ff9900 ${value}%, #333 ${value}%, #333 100%)`;
        document.getElementById('pelletValue')
            .textContent = this.value;
        amountpellet = parseInt(this.value);

        multikeyData["multiple"] = {
            ...multikeyData["multiple"]
            , amount: this.value
        };
        localStorage.setItem("Multikey", JSON.stringify(multikeyData));
    });

    sliderContainer.appendChild(sliderLabel);
    sliderContainer.appendChild(slider);
    container.appendChild(sliderContainer);

    // Create power bindings
    powers.forEach(power => {
        const binding = createPowerBinding(power);
        container.appendChild(binding);
    });

    return container;
};

// Create power binding for Multi Controls
const createPowerBinding = (power) => {
    const container = document.createElement('div');
    container.style.cssText = `
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: 10px;
        padding: 5px;
        margin: 5px 0;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 3px;
        transition: background-color 0.2s ease;
    `;

    const label = document.createElement('span');
    label.textContent = power.label;
    label.style.cssText = `
        color: #999999;
        font-size: 12px;
        text-align: center;
    `;

    const keyButton = document.createElement('div');
    keyButton.style.cssText = `
        background-color: #333333;
        color: #ffffff;
        padding: 2px 8px;
        border-radius: 3px;
        font-size: 12px;
        cursor: pointer;
        min-width: 20px;
        text-align: center;
        user-select: none;
        transition: all 0.2s;
    `;
    keyButton.dataset.power = power.name;

    power.key = multikeyData[power.name]?.key || "";
    keyButton.textContent = power.key.toUpperCase() || '';

    let isBinding = false;

    keyButton.addEventListener('click', () => {
        if (isBinding) {
            if (currentKeyPressHandler) {
                document.removeEventListener('keydown', currentKeyPressHandler);
                currentKeyPressHandler = null;
            }
            isBinding = false;
            keyButton.classList.remove('binding-active');
            keyButton.style.backgroundColor = '#333333';
            keyButton.textContent = power.key.toUpperCase() || '';
            SoundEffects.playSound('remove'); // Added sound
        } else {
            if (currentKeyPressHandler) {
                document.removeEventListener('keydown', currentKeyPressHandler);
                currentKeyPressHandler = null;
            }

            document.querySelectorAll('.binding-active')
                .forEach(btn => {
                    btn.classList.remove('binding-active');
                    btn.style.backgroundColor = '#333333';
                    btn.textContent = multikeyData[btn.dataset.power]?.key?.toUpperCase() || '';
                });

            isBinding = true;
            keyButton.classList.add('binding-active');
            keyButton.style.backgroundColor = '#ff9900';
            keyButton.textContent = '...';

            currentKeyPressHandler = (event) => {
                event.preventDefault();
                const keyInfo = getKeyInfo(event.keyCode);

                if (keyInfo.valid) {
                    const existingMultiKey = findExistingKeybind(event.keyCode, "Multikey", power.name);

                    if (existingMultiKey) {
                        const existingPower = powers.find(p => p.name === existingMultiKey);
                        SoundEffects.playSound('error'); // Added sound
                        curserMsg(`This key is already bound to "${existingPower?.label}" in Multi Controls`, "red");

                        isBinding = false;
                        keyButton.classList.remove('binding-active');
                        keyButton.style.backgroundColor = '#333333';
                        keyButton.textContent = power.key.toUpperCase() || '';

                        document.removeEventListener('keydown', currentKeyPressHandler);
                        currentKeyPressHandler = null;
                        return;
                    }

                    power.key = keyInfo.key;
                    keyButton.textContent = keyInfo.key.toUpperCase();

                    multikeyData[power.name] = {
                        key: keyInfo.key,
                        keyCode: event.keyCode
                    };
                    localStorage.setItem("Multikey", JSON.stringify(multikeyData));

                    SoundEffects.playSound('success'); // Added sound
                    curserMsg(`Hotkey set for ${power.label}`, "green");

                    document.removeEventListener('keydown', currentKeyPressHandler);
                    currentKeyPressHandler = null;
                    isBinding = false;
                    keyButton.classList.remove('binding-active');
                    keyButton.style.backgroundColor = '#333333';
                }
            };

            document.addEventListener('keydown', currentKeyPressHandler);
        }
    });

keyButton.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    if (currentKeyPressHandler) {
        document.removeEventListener('keydown', currentKeyPressHandler);
        currentKeyPressHandler = null;
    }
    power.key = '';
    keyButton.textContent = '';
    delete multikeyData[power.name];
    localStorage.setItem("Multikey", JSON.stringify(multikeyData));
    SoundEffects.playSound('remove');
    curserMsg(`Hotkey removed for ${power.label}`, "red");  // Changed to red
});

    container.appendChild(label);
    container.appendChild(keyButton);
    return container;
};

// Create Chat Phrases content
const createChatContent = () => {
    const container = document.createElement('div');

    // Add clear button at the top
    container.appendChild(createChatClearButton());
    // Toggle button
const toggle = document.createElement('div');
toggle.style.cssText = `
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 10px;
    margin: 8px 0;
    padding: 5px;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
`;

const toggleLabel = document.createElement('span');
toggleLabel.textContent = 'Quick Chat'; // or 'Quick Chat' or 'Skin Changer'
toggleLabel.style.cssText = `
    color: #999999;
    text-align: center;
    font-size: 12px;
`;

    const toggleBtn = document.createElement('div');
    toggleBtn.style.cssText = `
        background-color: ${isQuickChatEnabled ? '#ff9900' : '#333333'};
        color: #ffffff;
        padding: 2px 8px;
        border-radius: 3px;
        font-size: 12px;
        cursor: pointer;
        min-width: 40px;
        text-align: center;
        transition: all 0.2s;
    `;
    toggleBtn.textContent = isQuickChatEnabled ? 'ON' : 'OFF';

toggleBtn.addEventListener('click', () => {
    isQuickChatEnabled = !isQuickChatEnabled;
    toggleBtn.textContent = isQuickChatEnabled ? 'ON' : 'OFF';
    toggleBtn.style.backgroundColor = isQuickChatEnabled ? '#ff9900' : '#333333';
    if (isQuickChatEnabled) {
        SoundEffects.playSound('success');
        curserMsg(`Quick chat turned ON`, 'green');
    } else {
        SoundEffects.playSound('remove');
        curserMsg(`Quick chat turned OFF`, 'red');  // Changed to red for OFF state
    }

    // Update status panel immediately
    const panel = document.getElementById('status-panel');
    if (panel) {
        const chatDot = panel.querySelector('div:nth-child(2) span:first-child');
        const chatText = panel.querySelector('div:nth-child(2) span:last-child');
        if (chatDot && chatText) {
            chatDot.style.color = isQuickChatEnabled ? '#2ecc71' : '#e74c3c';
            chatText.style.color = isQuickChatEnabled ? '#2ecc71' : '#e74c3c';
        }
    }
});

    toggle.appendChild(toggleLabel);
    toggle.appendChild(toggleBtn);
    container.appendChild(toggle);

    // Create phrase bindings
    phrases.forEach(phrase => {
        const binding = createPhraseBinding(phrase);
        container.appendChild(binding);
    });

    return container;
};

// Create phrase binding for Chat Phrases
const createPhraseBinding = (phrase) => {
    const container = document.createElement('div');
    container.style.cssText = `
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: 10px;
        padding: 5px;
        margin: 5px 0;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 3px;
    `;

    const phraseInput = document.createElement('input');
    phraseInput.type = 'text';
    phraseInput.value = phraseKeyData[phrase.name]?.text || phrase.text;
    phraseInput.style.cssText = `
        width: 100%;
        padding: 2px 5px;
        background-color: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 3px;
        color: #ffffff;
        font-size: 12px;
        text-align: center;
    `;

    phraseInput.addEventListener('input', () => {
        if (!phraseKeyData[phrase.name]) {
            phraseKeyData[phrase.name] = {
                text: phraseInput.value
            };
        } else {
            phraseKeyData[phrase.name].text = phraseInput.value;
        }
        localStorage.setItem("PhraseKey", JSON.stringify(phraseKeyData));
        SoundEffects.playSound('success'); // Added sound for text change
    });

    const keyButton = document.createElement('div');
    keyButton.style.cssText = `
        background-color: #333333;
        color: #ffffff;
        padding: 2px 8px;
        border-radius: 3px;
        font-size: 12px;
        cursor: pointer;
        min-width: 20px;
        text-align: center;
        user-select: none;
        transition: all 0.2s;
    `;
    keyButton.dataset.phrase = phrase.name;

    phrase.key = phraseKeyData[phrase.name]?.key || "";
    keyButton.textContent = phrase.key.toUpperCase() || '';

    let isBinding = false;

    keyButton.addEventListener('click', () => {
        if (isBinding) {
            if (currentKeyPressHandler) {
                document.removeEventListener('keydown', currentKeyPressHandler);
                currentKeyPressHandler = null;
            }
            isBinding = false;
            keyButton.classList.remove('binding-active');
            keyButton.style.backgroundColor = '#333333';
            keyButton.textContent = phrase.key.toUpperCase() || '';
            SoundEffects.playSound('remove'); // Added sound
        } else {
            if (currentKeyPressHandler) {
                document.removeEventListener('keydown', currentKeyPressHandler);
                currentKeyPressHandler = null;
            }

            document.querySelectorAll('.binding-active').forEach(btn => {
                btn.classList.remove('binding-active');
                btn.style.backgroundColor = '#333333';
                btn.textContent = phraseKeyData[btn.dataset.phrase]?.key?.toUpperCase() || '';
            });

            isBinding = true;
            keyButton.classList.add('binding-active');
            keyButton.style.backgroundColor = '#ff9900';
            keyButton.textContent = '...';

            currentKeyPressHandler = (event) => {
                event.preventDefault();
                const keyInfo = getKeyInfo(event.keyCode);

                if (keyInfo.valid) {
                    const existingPhraseKey = findExistingKeybind(event.keyCode, "PhraseKey", phrase.name);

                    if (existingPhraseKey) {
                        const existingPhrase = phrases.find(p => p.name === existingPhraseKey);
                        SoundEffects.playSound('error'); // Added sound
                        curserMsg(`This key is already bound to "${existingPhrase?.text}" in Chat Phrases`, "red");

                        isBinding = false;
                        keyButton.classList.remove('binding-active');
                        keyButton.style.backgroundColor = '#333333';
                        keyButton.textContent = phrase.key.toUpperCase() || '';

                        document.removeEventListener('keydown', currentKeyPressHandler);
                        currentKeyPressHandler = null;
                        return;
                    }

                    phrase.key = keyInfo.key;
                    keyButton.textContent = keyInfo.key.toUpperCase();

                    phraseKeyData[phrase.name] = {
                        key: keyInfo.key,
                        keyCode: event.keyCode,
                        text: phraseInput.value
                    };
                    localStorage.setItem("PhraseKey", JSON.stringify(phraseKeyData));

                    SoundEffects.playSound('success'); // Added sound
                    curserMsg(`Hotkey set for phrase`, "green");

                    document.removeEventListener('keydown', currentKeyPressHandler);
                    currentKeyPressHandler = null;
                    isBinding = false;
                    keyButton.classList.remove('binding-active');
                    keyButton.style.backgroundColor = '#333333';
                }
            };

            document.addEventListener('keydown', currentKeyPressHandler);
        }
    });

keyButton.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    if (currentKeyPressHandler) {
        document.removeEventListener('keydown', currentKeyPressHandler);
        currentKeyPressHandler = null;
    }
    phrase.key = '';
    keyButton.textContent = '';

    const savedText = phraseInput.value;
    phraseKeyData[phrase.name] = {
        text: savedText
    };
    localStorage.setItem("PhraseKey", JSON.stringify(phraseKeyData));
    SoundEffects.playSound('remove');
    curserMsg(`Hotkey removed for phrase`, "red");  // Changed to red
});

    container.appendChild(phraseInput);
    container.appendChild(keyButton);
    return container;
};

// Create Skin Changer content
const createSkinChangerContent = () => {
    const container = document.createElement('div');
    // Toggle button
const toggle = document.createElement('div');
toggle.style.cssText = `
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 10px;
    margin: 8px 0;
    padding: 5px;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 3px;
`;

const toggleLabel = document.createElement('span');
toggleLabel.textContent = 'Skin Changer'; // or 'Quick Chat' or 'Skin Changer'
toggleLabel.style.cssText = `
    color: #999999;
    text-align: center;
    font-size: 12px;
`;

    const toggleBtn = document.createElement('div');
    toggleBtn.style.cssText = `
        background-color: ${isSkinChangerEnabled ? '#ff9900' : '#333333'};
        color: #ffffff;
        padding: 2px 8px;
        border-radius: 3px;
        font-size: 12px;
        cursor: pointer;
        min-width: 40px;
        text-align: center;
        transition: all 0.2s;
    `;
    toggleBtn.textContent = isSkinChangerEnabled ? 'ON' : 'OFF';

toggleBtn.addEventListener('click', () => {
    isSkinChangerEnabled = !isSkinChangerEnabled;
    toggleBtn.textContent = isSkinChangerEnabled ? 'ON' : 'OFF';
    toggleBtn.style.backgroundColor = isSkinChangerEnabled ? '#ff9900' : '#333333';
    if (isSkinChangerEnabled) {
        SoundEffects.playSound('success');
        curserMsg(`Skin Changer turned ON`, 'green');
    } else {
        SoundEffects.playSound('remove');
        curserMsg(`Skin Changer turned OFF`, 'red');  // Changed to red for OFF state
    }

    // Update status panel immediately
    const panel = document.getElementById('status-panel');
    if (panel) {
        const skinDot = panel.querySelector('div:nth-child(3) span:first-child');
        const skinText = panel.querySelector('div:nth-child(3) span:last-child');
        if (skinDot && skinText) {
            skinDot.style.color = isSkinChangerEnabled ? '#2ecc71' : '#e74c3c';
            skinText.style.color = isSkinChangerEnabled ? '#2ecc71' : '#e74c3c';
        }
    }
});

    toggle.appendChild(toggleLabel);
    toggle.appendChild(toggleBtn);
    container.appendChild(toggle);

    // Input group
    const inputGroup = document.createElement('div');
    inputGroup.style.cssText = `
            display: flex;
        gap: 5px;
        margin: 10px 0;
        padding: 5px;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 3px;
    `;

    const skinInput = document.createElement('input');
    skinInput.type = 'number';
    skinInput.id = 'skinIdInput';
    skinInput.placeholder = 'Enter Skin ID';
    skinInput.min = '0';
    skinInput.style.cssText = `
        flex: 1;
        padding: 5px;
        background-color: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 3px;
        color: #ffffff;
        font-size: 12px;
    `;

    const applyBtn = document.createElement('button');
    applyBtn.id = 'applySkinBtn';
    applyBtn.textContent = 'Apply';
    applyBtn.style.cssText = `
        padding: 5px 10px;
        background-color: #ff9900;
        border: none;
        border-radius: 3px;
        color: white;
        cursor: pointer;
        font-size: 12px;
        min-width: 60px;
    `;

    inputGroup.appendChild(skinInput);
    inputGroup.appendChild(applyBtn);
    container.appendChild(inputGroup);

    // Preview
    const preview = document.createElement('div');
    preview.id = 'skinPreview';
    preview.style.cssText = `
        width: 100%;
        height: 100px;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        margin: 10px 0;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 3px;
        transition: background-image 0.3s ease;
    `;
    container.appendChild(preview);

    // Slots container
    const slotsContainer = document.createElement('div');
    slotsContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 5px;
        margin: 10px 0;
    `;

    // Create 9 slots
    for (let i = 1; i <= 9; i++) {
        const slot = document.createElement('div');
        slot.setAttribute('data-slot', i);
        slot.className = savedSlots[i] ? 'slot active' : 'slot';
        slot.style.cssText = `
            background-color: rgba(0, 0, 0, 0.3);
            border-radius: 3px;
            padding: 10px;
            text-align: center;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            transition: all 0.2s;
        `;

        if (savedSlots[i]) {
            const preview = document.createElement('div');
            preview.className = 'slot-preview';
            preview.style.cssText = `
                width: 20px;
                height: 20px;
                background-image: url('https://agma.io/skins/${savedSlots[i]}.png');
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                border-radius: 2px;
            `;
            slot.appendChild(preview);
            slot.innerHTML += `<span style="color: #fff; font-size: 12px;">${savedSlots[i]}</span>`;
        } else {
            slot.innerHTML = `<span style="color: #999; font-size: 12px;">${i}</span>`;
        }

        slot.addEventListener('click', async () => {
    if (!isSkinChangerEnabled) {
        updateStatus('Please enable Skin Changer first');
        SoundEffects.playSound('error');
        return;
    }
    const currentSkinId = skinInput.value;
    if (currentSkinId) {
        if (savedSlots[i] === currentSkinId) {
            delete savedSlots[i];
            slot.innerHTML = `<span style="color: #999; font-size: 12px;">${i}</span>`;
            slot.classList.remove('active');
            SoundEffects.playSound('remove'); // Added sound for clearing slot
        } else {
            const exists = await checkSkinExists(currentSkinId);
            if (exists) {
                savedSlots[i] = currentSkinId;
                slot.innerHTML = `
                    <div class="slot-preview" style="width: 20px; height: 20px; background-image: url('https://agma.io/skins/${currentSkinId}.png'); background-size: contain; background-repeat: no-repeat; background-position: center; border-radius: 2px;"></div>
                    <span style="color: #fff; font-size: 12px;">${currentSkinId}</span>
                `;
                slot.classList.add('active');
                SoundEffects.playSound('success'); // Added sound for saving to slot
            } else {
                updateStatus('This skin ID does not exist!');
                SoundEffects.playSound('error'); // Added sound for invalid skin
                return;
            }
        }
        localStorage.setItem('skinChangerSlots', JSON.stringify(savedSlots));
        updateStatus(savedSlots[i] ? 'Skin saved to slot!' : 'Slot cleared!');
    } else if (savedSlots[i]) {
        await useSkin(parseInt(savedSlots[i]));
    }
});

        slotsContainer.appendChild(slot);
    }
    container.appendChild(slotsContainer);

    // Status message
    const status = document.createElement('div');
    status.id = 'statusMessage';
    status.style.cssText = `
        margin-top: 10px;
        text-align: center;
        color: #ff9900;
        min-height: 20px;
        font-size: 12px;
        padding: 5px;
        border-radius: 3px;
        background-color: rgba(0, 0, 0, 0.3);
    `;
    container.appendChild(status);

    // Add event listeners
    skinInput.addEventListener('input', async (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
        const skinId = e.target.value;
        if (skinId) {
            await updateSkinPreview(skinId);
        } else {
            preview.style.backgroundImage = 'none';
        }
    });

    applyBtn.addEventListener('click', async () => {
        if (!isSkinChangerEnabled) {
            updateStatus('Please enable Skin Changer first');
            return;
        }
        const skinId = skinInput.value;
        if (skinId) {
            await useSkin(parseInt(skinId));
        } else {
            updateStatus('Please enter a skin ID');
        }
    });

    return container;
};

const createSettingsContent = () => {
    const container = document.createElement('div');

    // Sound Toggle
    const soundToggle = document.createElement('div');
    soundToggle.style.cssText = `
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        gap: 10px;
        margin: 8px 0;
        padding: 5px;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 3px;
    `;

    const soundLabel = document.createElement('span');
    soundLabel.textContent = 'Sound Effects';
    soundLabel.style.cssText = `
        color: #999999;
        text-align: center;
        font-size: 12px;
    `;

    const soundBtn = document.createElement('div');
    soundBtn.style.cssText = `
        background-color: ${settings.soundEnabled ? '#ff9900' : '#333333'};
        color: #ffffff;
        padding: 2px 8px;
        border-radius: 3px;
        font-size: 12px;
        cursor: pointer;
        min-width: 40px;
        text-align: center;
        transition: all 0.2s;
    `;
    soundBtn.textContent = settings.soundEnabled ? 'ON' : 'OFF';

soundBtn.addEventListener('click', () => {
    settings.soundEnabled = !settings.soundEnabled;
    soundBtn.textContent = settings.soundEnabled ? 'ON' : 'OFF';
    soundBtn.style.backgroundColor = settings.soundEnabled ? '#ff9900' : '#333333';
    localStorage.setItem('scriptSettings', JSON.stringify(settings));

    // Play a sound to demonstrate the change
    if (settings.soundEnabled) {
        SoundEffects.playSound('success');
        curserMsg(`Sound effects enabled`, 'green');
    } else {
        curserMsg(`Sound effects disabled`, 'red');  // Changed to red for OFF state
    }
});
    soundToggle.appendChild(soundLabel);
    soundToggle.appendChild(soundBtn);
    container.appendChild(soundToggle);

    return container;
};

// Update content based on active tab
const updateContent = () => {
    const contentContainer = document.querySelector('.content-container');
    contentContainer.innerHTML = '';

    switch (activeTab) {
        case 'multi':
            contentContainer.appendChild(createMultiContent());
            break;
        case 'chat':
            contentContainer.appendChild(createChatContent());
            break;
        case 'skins':
            contentContainer.appendChild(createSkinChangerContent());
            break;
        case 'settings':
            contentContainer.appendChild(createSettingsContent());
            break;
    }
};

// Main keydown event handler for all hotkeys
document.addEventListener("keydown", async function (e) {
    if (!document.activeElement.matches('input, textarea')) {
        // Multi Controls - always active if enabled
        if (ischecked) {
            const multiControls = JSON.parse(localStorage.getItem('Multikey')) || {};
            for (const [power, data] of Object.entries(multiControls)) {
                if (e.keyCode === data.keyCode) {
                    switch (power) {
                    case 'multiple':
                        await multiple(amountpellet, 3);
                        break;
                    case 'mothercellantirecfreeze':
                        sendPw(12);
                        sendPw(5);
                        break;
                    case 'virusantifreeze':
                        sendPw(12);
                        sendPw(4);
                        break;
                    case 'rec':
                        sendPw(1);
                        break;
                    case 'speed':
                        sendPw(2);
                        break;
                    case 'virus':
                        sendPw(4);
                        break;
                    case 'mothercell':
                        sendPw(5);
                        break;
                    case 'portal':
                        sendPw(6);
                        break;
                    case 'block':
                        sendPw(9);
                        break;
                    case 'freeze':
                        sendPw(12);
                        sendPw(8);
                        break;
                    case 'antiFreeze':
                        sendPw(11);
                        sendPw(14);
                        break;
                    case 'antiRec':
                        sendPw(12);
                        break;
                    case 'shield':
                        sendPw(14);
                        break;
                    }
                    break;
                }
            }
        }

        // Chat Phrases - only active when on chat tab
        if (isQuickChatEnabled && activeTab === 'chat') {
            const phraseControls = JSON.parse(localStorage.getItem('PhraseKey')) || {};
            for (const [_, data] of Object.entries(phraseControls)) {
                if (e.keyCode === data.keyCode) {
                    e.preventDefault();
                    sendChat(data.text);
                    break;
                }
            }
        }

        // Skin Changer - only active when on skins tab
        if (isSkinChangerEnabled && activeTab === 'skins') {
            if (e.key >= '1' && e.key <= '9') {
                const currentTime = Date.now();
                if (currentTime - lastUsedTime < COOLDOWN_TIME) {
                    const remainingTime = Math.ceil((COOLDOWN_TIME - (currentTime - lastUsedTime)) / 1000);
                    updateStatus(`Please wait ${remainingTime}s to change skin`);
                    showWarning();
                    return;
                }

                const slotNum = e.key;
                if (savedSlots[slotNum]) {
                    const exists = await checkSkinExists(savedSlots[slotNum]);
                    if (exists) {
                        useSkin(parseInt(savedSlots[slotNum]));
                        updateSkinPreview(savedSlots[slotNum]);
                    } else {
                        updateStatus('Saved skin no longer exists!');
                        delete savedSlots[slotNum];
                        localStorage.setItem('skinChangerSlots', JSON.stringify(savedSlots));
                        const slotEl = document.querySelector(`.slot[data-slot="${slotNum}"]`);
                        if (slotEl) {
                            slotEl.innerHTML = `<span class="slot-number">${slotNum}</span>`;
                            slotEl.classList.remove('active');
                        }
                    }
                }
            }
        }
    }
});

// Initialize the menu
const initializeMenu = () => {
    // Remove existing elements
    const existingMinBtn = document.querySelector('.multi-minimize-btn');
    const existingSection = document.querySelector('.controls-section');
    const existingPanel = document.getElementById('status-panel');
    if (existingMinBtn) existingMinBtn.remove();
    if (existingSection) existingSection.remove();
    if (existingPanel) existingPanel.remove();

    // Create and add elements
    const minimizeBtn = createMinimizeButton();
    const menuSection = createMenuSection();
    const statusPanel = createStatusPanel();

    document.body.appendChild(minimizeBtn);
    document.body.appendChild(menuSection);
    document.body.appendChild(statusPanel);

    minimizeBtn.style.display = 'none';

    updateContent();

    // Handle minimize/maximize
    const closeBtn = menuSection.querySelector('span:last-child');
    closeBtn.addEventListener('click', () => {
        menuSection.style.left = '-260px';
        minimizeBtn.style.display = 'flex';
    });

    minimizeBtn.addEventListener('click', () => {
        menuSection.style.left = '10px';
        minimizeBtn.style.display = 'none';
    });

    // Initialize saved values
    const savedMultiData = JSON.parse(localStorage.getItem("Multikey")) || {};
    amountpellet = parseInt(savedMultiData.multiple?.amount || "15", 10);

    // Update keycodes periodically
    setInterval(() => {
        const updatedKeyCodes = getKeyCodes();
        Object.assign(keyCodes, updatedKeyCodes);
    }, 2000);
};

// Main entry point - try multiple initialization methods
const initialize = () => {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMenu);
    } else {
        initializeMenu();
    }
};
initialize();

// Backup initialization after a delay
setTimeout(initialize, 1000);

// Additional backup initialization when window loads
window.addEventListener('load', initialize);
