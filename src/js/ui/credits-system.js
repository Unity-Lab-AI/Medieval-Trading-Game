// ═══════════════════════════════════════════════════════════════
// CREDITS SYSTEM - rolling credits for the main menu about button
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.10 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

console.log('Credits System loading... preparing to roll the credits...');

const CreditsSystem = {
    // Credits timeout reference
    creditsTimeout: null,

    // Callback for when credits finish
    onCreditsFinish: null,

    // Show rolling credits - can be called from main menu About button
    showCredits(options = {}) {
        const {
            endingMessage = null,  // Custom message at top (null = show game tagline)
            returnToMenu = true,   // Go to main menu after credits
            onFinish = null        // Custom callback when done
        } = options;

        this.onCreditsFinish = onFinish;

        // Create credits overlay
        const creditsOverlay = document.createElement('div');
        creditsOverlay.id = 'credits-overlay';
        creditsOverlay.className = 'credits-sequence-overlay';

        // Get config data
        const config = typeof GameConfig !== 'undefined' ? GameConfig : null;
        const gameName = config?.game?.name || 'Medieval Trading Game';
        const tagline = config?.game?.tagline || 'where capitalism meets the dark ages';
        const studio = config?.credits?.studio || 'Unity AI Lab';
        const developers = config?.credits?.developers || [
            { name: 'Hackall360', role: 'Lead Code Necromancer' },
            { name: 'Sponge', role: 'Chaos Engineer' },
            { name: 'GFourteen', role: 'Digital Alchemist' }
        ];
        const playtesters = config?.credits?.playtesters || [];
        const copyright = config?.credits?.copyright || '© 2025 Unity AI Lab. All rights reserved.';
        const version = config?.version?.game || '0.91.10';

        // Get social links
        const links = config?.links || {};

        // Build social links HTML - same style as main menu
        let socialLinksHTML = '';
        if (links.website || links.github || links.discord || links.support) {
            socialLinksHTML = `
                <div class="credits-social-links">
                    ${links.website ? `<a href="${links.website}" target="_blank" class="about-link-btn" title="Website">🌐 Website</a>` : ''}
                    ${links.github ? `<a href="${links.github}" target="_blank" class="about-link-btn" title="GitHub">💻 GitHub</a>` : ''}
                    ${links.discord ? `<a href="${links.discord}" target="_blank" class="about-link-btn" title="Discord">💬 Discord</a>` : ''}
                    ${links.support ? `<a href="mailto:${links.support}" class="about-link-btn" title="Contact Us">✉️ Contact Us</a>` : ''}
                </div>
            `;
        }

        // Build developers HTML
        const devsHTML = developers.map(dev => `
            <div class="credits-dev">
                <span class="dev-name">${dev.name}</span>
                <span class="dev-role">${dev.role}</span>
            </div>
        `).join('');

        // Build playtesters HTML
        const testersHTML = playtesters.length > 0 ? playtesters.map(tester => `
            <div class="credits-dev">
                <span class="dev-name">${tester.name}</span>
                <span class="dev-role">${tester.role}</span>
            </div>
        `).join('') : '';

        // Determine the opening message
        const openingText = endingMessage || tagline;

        creditsOverlay.innerHTML = `
            <div class="credits-content">
                <div class="credits-scroll">
                    <div class="credits-ending-message">${openingText}</div>

                    <div class="credits-spacer"></div>

                    <div class="credits-title">${gameName}</div>
                    <div class="credits-version">Version ${version}</div>

                    <div class="credits-spacer"></div>

                    <div class="credits-section">
                        <div class="credits-section-title">Conjured By</div>
                        <div class="credits-studio">${studio}</div>
                    </div>

                    <div class="credits-spacer"></div>

                    <div class="credits-section">
                        <div class="credits-section-title">The Fucking Legends</div>
                        <div class="credits-developers">
                            ${devsHTML}
                        </div>
                    </div>

                    ${testersHTML ? `
                    <div class="credits-spacer"></div>

                    <div class="credits-section">
                        <div class="credits-section-title">Bug Slayers</div>
                        <div class="credits-developers">
                            ${testersHTML}
                        </div>
                    </div>
                    ` : ''}

                    <div class="credits-spacer"></div>

                    ${socialLinksHTML}

                    <div class="credits-spacer"></div>

                    <div class="credits-section">
                        <div class="credits-thanks">Thank you for playing</div>
                        <div class="credits-copyright">${copyright}</div>
                    </div>

                    <div class="credits-spacer-large"></div>
                </div>
            </div>
            <div class="credits-skip">
                <button class="skip-credits-btn" onclick="CreditsSystem.skipCredits()">Skip ▶</button>
            </div>
        `;

        document.body.appendChild(creditsOverlay);

        // Start the credits scroll animation
        requestAnimationFrame(() => {
            creditsOverlay.classList.add('active');
            const scrollContent = creditsOverlay.querySelector('.credits-scroll');
            if (scrollContent) {
                scrollContent.classList.add('scrolling');
            }
        });

        // Auto-finish after credits roll (about 20 seconds)
        this.creditsTimeout = setTimeout(() => {
            this.finishCredits(returnToMenu);
        }, 22000);

        console.log('Credits rolling...');
    },

    // Skip credits
    skipCredits() {
        if (this.creditsTimeout) {
            clearTimeout(this.creditsTimeout);
            this.creditsTimeout = null;
        }
        this.finishCredits(true);
    },

    // Finish credits
    finishCredits(returnToMenu = true) {
        const creditsOverlay = document.getElementById('credits-overlay');
        if (creditsOverlay) {
            creditsOverlay.classList.add('fading');

            setTimeout(() => {
                creditsOverlay.remove();

                // Call custom callback if provided
                if (this.onCreditsFinish) {
                    this.onCreditsFinish();
                    this.onCreditsFinish = null;
                } else if (returnToMenu) {
                    // Return to main menu (default behavior for About button)
                    if (typeof changeState === 'function' && typeof GameState !== 'undefined') {
                        changeState(GameState.MENU);
                    }
                }
            }, 1000);
        } else {
            // Fallback if no credits overlay
            if (this.onCreditsFinish) {
                this.onCreditsFinish();
                this.onCreditsFinish = null;
            } else if (returnToMenu && typeof changeState === 'function' && typeof GameState !== 'undefined') {
                changeState(GameState.MENU);
            }
        }
    }
};

// Expose globally
window.CreditsSystem = CreditsSystem;

console.log('Credits System loaded!');
