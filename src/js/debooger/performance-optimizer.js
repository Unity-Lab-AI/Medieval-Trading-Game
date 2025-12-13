// ═══════════════════════════════════════════════════════════════
// PERFORMANCE OPTIMIZER - making darkness run buttery smooth
// ═══════════════════════════════════════════════════════════════
// Version: 0.91.00 | Unity AI Lab
// Creators: Hackall360, Sponge, GFourteen
// www.unityailab.com | github.com/Unity-Lab-AI/Medieval-Trading-Game
// unityailabcontact@gmail.com
// ═══════════════════════════════════════════════════════════════

const PerformanceOptimizer = {
    // Performance settings
    settings: {
        adaptiveQuality: true,
        targetFPS: 60,
        minFPS: 30,
        particleLimit: 100,
        animationQuality: 'medium',
        effectsEnabled: true
    },
    
    // Performance monitoring
    metrics: {
        currentFPS: 60,
        frameTime: 0,
        memoryUsage: 0,
        particleCount: 0,
        animationCount: 0,
        lastOptimization: 0
    },
    
    // Performance thresholds
    thresholds: {
        lowFPS: 30,
        highMemory: 100, // MB
        highParticleCount: 150,
        highAnimationCount: 50
    },
    
    // 🖤 Optimization history - using circular buffer for efficiency 💀
    optimizationHistory: [],
    _historyMaxSize: 50,
    _historyIndex: 0,
    
    // Object pools for frequently created objects
    objectPools: {
        particles: [],
        animations: [],
        domElements: [],
        events: [],
        timers: []
    },

    // 🖤 Track timer/interval references for cleanup 💀
    _monitoringFrameId: null,
    _panelUpdateIntervalId: null,
    
    // Pool configuration
    poolConfig: {
        maxPoolSize: 100,
        preAllocateCount: 20
    },
    
    // Initialize performance optimizer
    init() {
        this.loadSettings();
        this.setupPerformanceMonitoring();
        this.setupOptimizationTriggers();
        this.initializeObjectPools();
        console.log('Performance optimizer initialized');
    },
    
    // Load settings from localStorage
    loadSettings() {
        const savedSettings = localStorage.getItem('tradingGamePerformanceSettings');
        if (savedSettings) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            } catch (error) {
                // 🖤 Silent fallback - corrupt data just means we use defaults
                localStorage.removeItem('tradingGamePerformanceSettings');
            }
        }
    },
    
    // Save settings to localStorage
    saveSettings() {
        localStorage.setItem('tradingGamePerformanceSettings', JSON.stringify(this.settings));
    },
    
    // Setup performance monitoring
    setupPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        let fps = 60;
        let frameTime = 0;
        
        const measurePerformance = () => {
            frameCount++;
            const currentTime = performance.now();
            const deltaTime = currentTime - lastTime;

            if (deltaTime >= 1000) {
                fps = Math.round((frameCount * 1000) / deltaTime);
                frameTime = deltaTime / frameCount;

                this.metrics.currentFPS = fps;
                this.metrics.frameTime = frameTime;

                // Reset counters
                frameCount = 0;
                lastTime = currentTime;

                // Check if optimization is needed
                this.checkOptimizationNeeds();

                // Update performance display
                this.updatePerformanceDisplay();
            }

            // 🖤 Store frame ID for cleanup 💀
            this._monitoringFrameId = requestAnimationFrame(measurePerformance);
        };

        // 🖤 Store initial frame ID 💀
        this._monitoringFrameId = requestAnimationFrame(measurePerformance);
        
        // Monitor memory usage if available
        this.monitorMemoryUsage();
    },
    
    // Monitor memory usage
    monitorMemoryUsage() {
        if (performance.memory) {
            const memoryInfo = performance.memory;
            const usedMemory = memoryInfo.usedJSHeapSize / (1024 * 1024); // Convert to MB
            
            this.metrics.memoryUsage = usedMemory;
            
            // Trigger optimization if memory is too high
            if (usedMemory > this.thresholds.highMemory) {
                this.optimizeForMemory();
            }
        }
    },
    
    // Setup optimization triggers
    setupOptimizationTriggers() {
        // Optimize on visibility change (tab switching)
        EventManager.addEventListener(document, 'visibilitychange', () => {
            if (document.hidden) {
                this.pauseOptimizations();
            } else {
                this.resumeOptimizations();
            }
        });
        
        // Optimize on window resize
        EventManager.addEventListener(window, 'resize', () => {
            this.optimizeForViewport();
        });
        
        // Optimize based on battery level if available
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                if (battery.level < 0.2) {
                    this.optimizeForBattery();
                }
            });
        }
        
        // Optimize on low-end device detection
        this.detectLowEndDevice();
    },
    
    // Check if optimization is needed
    checkOptimizationNeeds() {
        const now = Date.now();
        
        // Don't optimize too frequently (minimum 5 seconds between optimizations)
        if (now - this.metrics.lastOptimization < 5000) {
            return;
        }
        
        let needsOptimization = false;
        let reason = '';
        
        // Check FPS
        if (this.metrics.currentFPS < this.thresholds.lowFPS) {
            needsOptimization = true;
            reason = 'Low FPS';
        }
        
        // Check memory usage
        if (this.metrics.memoryUsage > this.thresholds.highMemory) {
            needsOptimization = true;
            reason = 'High memory usage';
        }
        
        // Check particle count
        if (this.metrics.particleCount > this.thresholds.highParticleCount) {
            needsOptimization = true;
            reason = 'Too many particles';
        }
        
        // Check animation count
        if (this.metrics.animationCount > this.thresholds.highAnimationCount) {
            needsOptimization = true;
            reason = 'Too many animations';
        }
        
        if (needsOptimization) {
            this.optimizePerformance(reason);
        }
    },
    
    // Optimize performance based on detected issues
    optimizePerformance(reason) {
        const now = Date.now();
        this.metrics.lastOptimization = now;
        
        // 🖤 Record optimization using circular buffer - no array resizing! 💀
        const entry = {
            timestamp: now,
            reason: reason,
            fps: this.metrics.currentFPS,
            memory: this.metrics.memoryUsage,
            particles: this.metrics.particleCount,
            animations: this.metrics.animationCount
        };

        // Circular buffer: overwrite oldest entry when full
        if (this.optimizationHistory.length < this._historyMaxSize) {
            this.optimizationHistory.push(entry);
        } else {
            this.optimizationHistory[this._historyIndex] = entry;
        }
        this._historyIndex = (this._historyIndex + 1) % this._historyMaxSize;
        
        console.log(`Performance optimization triggered: ${reason}`);
        
        // Apply optimizations based on reason
        switch (reason) {
            case 'Low FPS':
                this.optimizeForFPS();
                break;
            case 'High memory usage':
                this.optimizeForMemory();
                break;
            case 'Too many particles':
                this.optimizeParticles();
                break;
            case 'Too many animations':
                this.optimizeAnimations();
                break;
            default:
                this.optimizeGeneral();
        }
        
        // Trigger optimization event
        document.dispatchEvent(new CustomEvent('performanceOptimized', {
            detail: { reason, metrics: this.metrics }
        }));
    },
    
    // Optimize for low FPS
    optimizeForFPS() {
        // Reduce particle limit
        const newParticleLimit = Math.max(20, this.settings.particleLimit * 0.7);
        this.settings.particleLimit = Math.floor(newParticleLimit);
        
        // Reduce animation quality
        if (this.settings.animationQuality === 'high') {
            this.settings.animationQuality = 'medium';
        } else if (this.settings.animationQuality === 'medium') {
            this.settings.animationQuality = 'low';
        }
        
        // Apply settings
        this.applyOptimizationSettings();
        
        // Notify systems
        if (typeof VisualEffectsSystem !== 'undefined') {
            VisualEffectsSystem.setQuality(this.settings.animationQuality);
        }
        
        if (typeof AnimationSystem !== 'undefined') {
            AnimationSystem.setQuality(this.settings.animationQuality);
        }
        
        if (typeof EnvironmentalEffectsSystem !== 'undefined') {
            EnvironmentalEffectsSystem.setQuality(this.settings.animationQuality);
        }
    },
    
    // Optimize for memory usage
    optimizeForMemory() {
        // Force garbage collection
        if (window.gc) {
            window.gc();
        }
        
        // Reduce particle limit significantly
        this.settings.particleLimit = Math.max(10, this.settings.particleLimit * 0.5);
        
        // Set to low quality
        this.settings.animationQuality = 'low';
        
        // Disable non-essential effects
        this.settings.effectsEnabled = false;
        
        // Apply settings
        this.applyOptimizationSettings();
        
        // Notify systems
        if (typeof VisualEffectsSystem !== 'undefined') {
            VisualEffectsSystem.setQuality('low');
            VisualEffectsSystem.toggleParticles();
        }
        
        if (typeof AnimationSystem !== 'undefined') {
            AnimationSystem.setQuality('low');
        }
    },
    
    // Optimize particle system
    optimizeParticles() {
        // Reduce particle limit
        this.settings.particleLimit = Math.max(30, this.settings.particleLimit * 0.8);
        
        // Apply settings
        this.applyOptimizationSettings();
        
        // Notify systems
        if (typeof VisualEffectsSystem !== 'undefined') {
            VisualEffectsSystem.setQuality(this.settings.animationQuality);
        }
    },
    
    // Optimize animations
    optimizeAnimations() {
        // Reduce animation quality
        if (this.settings.animationQuality === 'high') {
            this.settings.animationQuality = 'medium';
        } else if (this.settings.animationQuality === 'medium') {
            this.settings.animationQuality = 'low';
        }
        
        // Apply settings
        this.applyOptimizationSettings();
        
        // Notify systems
        if (typeof AnimationSystem !== 'undefined') {
            AnimationSystem.setQuality(this.settings.animationQuality);
        }
        
        if (typeof UIPolishSystem !== 'undefined') {
            UIPolishSystem.toggleReducedMotion();
        }
    },
    
    // Optimize for battery
    optimizeForBattery() {
        // Set to low power mode
        this.settings.animationQuality = 'low';
        this.settings.particleLimit = 20;
        this.settings.effectsEnabled = false;
        
        // Apply settings
        this.applyOptimizationSettings();
        
        // Notify all systems to reduce quality
        if (typeof VisualEffectsSystem !== 'undefined') {
            VisualEffectsSystem.setQuality('low');
        }
        
        if (typeof AnimationSystem !== 'undefined') {
            AnimationSystem.setQuality('low');
        }
        
        if (typeof EnvironmentalEffectsSystem !== 'undefined') {
            EnvironmentalEffectsSystem.setQuality('low');
        }
        
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.setMasterVolume(0.5);
        }
    },
    
    // Optimize for viewport size
    optimizeForViewport() {
        const viewportArea = window.innerWidth * window.innerHeight;
        
        // Reduce quality for small viewports
        if (viewportArea < 400000) { // Less than 800x500
            this.settings.animationQuality = 'low';
            this.settings.particleLimit = 30;
        } else if (viewportArea < 800000) { // Less than 1200x667
            this.settings.animationQuality = 'medium';
            this.settings.particleLimit = 60;
        }
        
        // Apply settings
        this.applyOptimizationSettings();
        
        // Notify systems
        if (typeof VisualEffectsSystem !== 'undefined') {
            VisualEffectsSystem.setQuality(this.settings.animationQuality);
        }
    },
    
    // Detect low-end devices
    detectLowEndDevice() {
        // Check for low-end device indicators
        const isLowEnd = 
            navigator.hardwareConcurrency <= 2 || // Few CPU cores
            navigator.deviceMemory <= 2 || // Less than 2GB RAM
            /Android|iPhone|iPad/.test(navigator.userAgent); // Mobile devices
        
        if (isLowEnd) {
            this.settings.animationQuality = 'low';
            this.settings.particleLimit = 30;
            this.settings.targetFPS = 30;
            
            // Apply settings
            this.applyOptimizationSettings();
            
            console.log('Low-end device detected, applying performance optimizations');
        }
    },
    
    // General optimization
    optimizeGeneral() {
        // Reduce quality by one level
        if (this.settings.animationQuality === 'high') {
            this.settings.animationQuality = 'medium';
        } else if (this.settings.animationQuality === 'medium') {
            this.settings.animationQuality = 'low';
        }
        
        // Reduce particle limit
        this.settings.particleLimit = Math.max(20, this.settings.particleLimit * 0.8);
        
        // Apply settings
        this.applyOptimizationSettings();
    },
    
    // Apply optimization settings
    applyOptimizationSettings() {
        this.saveSettings();
        
        // Apply to CSS
        document.documentElement.style.setProperty('--particle-limit', this.settings.particleLimit);
        document.documentElement.style.setProperty('--animation-quality', this.settings.animationQuality);
        
        // Update performance metrics
        this.metrics.particleCount = this.settings.particleLimit;
    },
    
    // Pause optimizations when tab is hidden
    pauseOptimizations() {
        // Pause animations
        if (typeof AnimationSystem !== 'undefined') {
            AnimationSystem.stopAllAnimations();
        }
        
        // Pause particle system
        if (typeof VisualEffectsSystem !== 'undefined') {
            VisualEffectsSystem.stopAllAnimations();
        }
        
        // Pause audio
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.pauseAll();
        }
        
        console.log('Performance optimizations paused');
    },
    
    // Resume optimizations when tab becomes visible
    resumeOptimizations() {
        // Resume animations
        if (typeof AnimationSystem !== 'undefined') {
            AnimationSystem.resumeAllAnimations();
        }
        
        // Resume particle system
        if (typeof VisualEffectsSystem !== 'undefined') {
            VisualEffectsSystem.resumeAllAnimations();
        }
        
        // Resume audio
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.resumeAll();
        }
        
        console.log('Performance optimizations resumed');
    },
    
    // Update performance display
    updatePerformanceDisplay() {
        let performanceDisplay = document.getElementById('performance-display');
        
        if (!performanceDisplay) {
            performanceDisplay = document.createElement('div');
            performanceDisplay.id = 'performance-display';
            performanceDisplay.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: #00ff00;
                padding: 5px 10px;
                border-radius: 5px;
                font-family: monospace;
                font-size: 12px;
                z-index: 950; /* Z-INDEX STANDARD: Debooger UI 🦇 */
                pointer-events: none;
                transition: all 0.3s ease-in-out;
            `;
            document.body.appendChild(performanceDisplay);
        }
        
        // Update display content
        const fps = this.metrics.currentFPS;
        const memory = this.metrics.memoryUsage.toFixed(1);
        const particles = this.metrics.particleCount;
        const quality = this.settings.animationQuality;
        
        // Color code based on performance
        let color = '#00ff00'; // Green
        if (fps < this.thresholds.lowFPS) {
            color = '#ff0000'; // Red
        } else if (fps < 45) {
            color = '#ffff00'; // Yellow
        }
        
        performanceDisplay.style.color = color;
        performanceDisplay.innerHTML = `
            FPS: ${fps}<br>
            Memory: ${memory}MB<br>
            Particles: ${particles}<br>
            Quality: ${quality}
        `;
        
        // Hide after 3 seconds if performance is good
        if (fps >= 50) {
            TimerManager.setTimeout(() => {
                performanceDisplay.style.opacity = '0';
                TimerManager.setTimeout(() => {
                    performanceDisplay.style.opacity = '1';
                }, 2000);
            }, 3000);
        }
    },
    
    // Get performance metrics
    getMetrics() {
        return { ...this.metrics };
    },
    
    // Get optimization history
    getOptimizationHistory() {
        return [...this.optimizationHistory];
    },
    
    // Manual optimization trigger
    triggerOptimization(reason = 'Manual') {
        this.optimizePerformance(reason);
    },
    
    // Set quality manually
    setQuality(quality) {
        this.settings.animationQuality = quality;
        
        // Adjust other settings based on quality
        switch (quality) {
            case 'low':
                this.settings.particleLimit = 30;
                this.settings.targetFPS = 30;
                break;
            case 'medium':
                this.settings.particleLimit = 60;
                this.settings.targetFPS = 45;
                break;
            case 'high':
                this.settings.particleLimit = 100;
                this.settings.targetFPS = 60;
                break;
        }
        
        this.applyOptimizationSettings();
        
        // Notify systems
        if (typeof VisualEffectsSystem !== 'undefined') {
            VisualEffectsSystem.setQuality(quality);
        }
        
        if (typeof AnimationSystem !== 'undefined') {
            AnimationSystem.setQuality(quality);
        }
        
        if (typeof EnvironmentalEffectsSystem !== 'undefined') {
            EnvironmentalEffectsSystem.setQuality(quality);
        }
    },
    
    // Toggle adaptive quality
    toggleAdaptiveQuality() {
        this.settings.adaptiveQuality = !this.settings.adaptiveQuality;
        this.saveSettings();
        
        if (!this.settings.adaptiveQuality) {
            console.log('Adaptive quality disabled');
        } else {
            console.log('Adaptive quality enabled');
            this.checkOptimizationNeeds();
        }
    },
    
    // Get current settings
    getSettings() {
        return { ...this.settings };
    },
    
    // Reset to defaults
    resetToDefaults() {
        this.settings = {
            adaptiveQuality: true,
            targetFPS: 60,
            minFPS: 30,
            particleLimit: 100,
            animationQuality: 'medium',
            effectsEnabled: true
        };
        
        this.applyOptimizationSettings();
        
        // Notify systems
        if (typeof VisualEffectsSystem !== 'undefined') {
            VisualEffectsSystem.setQuality('medium');
        }
        
        if (typeof AnimationSystem !== 'undefined') {
            AnimationSystem.setQuality('medium');
        }
        
        if (typeof EnvironmentalEffectsSystem !== 'undefined') {
            EnvironmentalEffectsSystem.setQuality('medium');
        }
        
        console.log('Performance settings reset to defaults');
    },
    
    // Create performance control panel
    createPerformancePanel() {
        let panel = document.getElementById('performance-panel');
        
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'performance-panel';
            panel.innerHTML = `
                <div class="performance-panel-content">
                    <h3>Performance Settings</h3>
                    <div class="performance-setting">
                        <label>Animation Quality:</label>
                        <select id="perf-quality-select">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div class="performance-setting">
                        <label>Particle Limit:</label>
                        <input type="range" id="perf-particle-limit" min="10" max="200" value="100">
                        <span id="perf-particle-value">100</span>
                    </div>
                    <div class="performance-setting">
                        <label>Target FPS:</label>
                        <input type="range" id="perf-target-fps" min="15" max="60" value="60">
                        <span id="perf-fps-value">60</span>
                    </div>
                    <div class="performance-setting">
                        <label>
                            <input type="checkbox" id="perf-adaptive-quality" checked>
                            Adaptive Quality
                        </label>
                    </div>
                    <div class="performance-setting">
                        <label>
                            <input type="checkbox" id="perf-effects-enabled" checked>
                            Enable Effects
                        </label>
                    </div>
                    <div class="performance-actions">
                        <button id="perf-optimize-btn">Optimize Now</button>
                        <button id="perf-reset-btn">Reset to Defaults</button>
                        <button id="perf-close-btn">Close</button>
                    </div>
                    <div class="performance-info">
                        <div>Current FPS: <span id="perf-current-fps">60</span></div>
                        <div>Memory Usage: <span id="perf-memory-usage">0</span> MB</div>
                        <div>Active Particles: <span id="perf-active-particles">0</span></div>
                        <div>Active Animations: <span id="perf-active-animations">0</span></div>
                    </div>
                </div>
            `;
            
            panel.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                z-index: 951; /* Z-INDEX STANDARD: Debooger panel 💀 */
                min-width: 300px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            `;
            
            document.body.appendChild(panel);
            
            // Setup event listeners
            this.setupPerformancePanelListeners(panel);
        }
        
        return panel;
    },
    
    // Setup performance panel event listeners
    setupPerformancePanelListeners(panel) {
        // Quality select
        const qualitySelect = panel.querySelector('#perf-quality-select');
        qualitySelect.value = this.settings.animationQuality;
        EventManager.addEventListener(qualitySelect, 'change', (e) => {
            this.setQuality(e.target.value);
        });
        
        // Particle limit
        const particleLimit = panel.querySelector('#perf-particle-limit');
        const particleValue = panel.querySelector('#perf-particle-value');
        particleLimit.value = this.settings.particleLimit;
        particleValue.textContent = this.settings.particleLimit;
        
        EventManager.addEventListener(particleLimit, 'input', (e) => {
            const value = parseInt(e.target.value);
            this.settings.particleLimit = value;
            particleValue.textContent = value;
            this.applyOptimizationSettings();
        });
        
        // Target FPS
        const targetFPS = panel.querySelector('#perf-target-fps');
        const fpsValue = panel.querySelector('#perf-fps-value');
        targetFPS.value = this.settings.targetFPS;
        fpsValue.textContent = this.settings.targetFPS;
        
        EventManager.addEventListener(targetFPS, 'input', (e) => {
            const value = parseInt(e.target.value);
            this.settings.targetFPS = value;
            fpsValue.textContent = value;
            this.saveSettings();
        });
        
        // Adaptive quality
        const adaptiveQuality = panel.querySelector('#perf-adaptive-quality');
        adaptiveQuality.checked = this.settings.adaptiveQuality;
        EventManager.addEventListener(adaptiveQuality, 'change', (e) => {
            this.toggleAdaptiveQuality();
        });
        
        // Effects enabled
        const effectsEnabled = panel.querySelector('#perf-effects-enabled');
        effectsEnabled.checked = this.settings.effectsEnabled;
        EventManager.addEventListener(effectsEnabled, 'change', (e) => {
            this.settings.effectsEnabled = e.target.checked;
            this.saveSettings();
            
            // Notify systems
            if (typeof VisualEffectsSystem !== 'undefined') {
                VisualEffectsSystem.toggleParticles();
            }
        });
        
        // Optimize button
        EventManager.addEventListener(panel.querySelector('#perf-optimize-btn'), 'click', () => {
            this.triggerOptimization('Manual');
        });
        
        // Reset button
        EventManager.addEventListener(panel.querySelector('#perf-reset-btn'), 'click', () => {
            this.resetToDefaults();
            
            // Update panel controls
            qualitySelect.value = 'medium';
            particleLimit.value = 100;
            particleValue.textContent = 100;
            targetFPS.value = 60;
            fpsValue.textContent = 60;
            adaptiveQuality.checked = true;
            effectsEnabled.checked = true;
        });
        
        // Close button
        EventManager.addEventListener(panel.querySelector('#perf-close-btn'), 'click', () => {
            panel.remove();
        });
        
        // Update info display
        // 🖤 Store interval ID for cleanup 💀
        if (this._panelUpdateIntervalId) {
            TimerManager.clearInterval(this._panelUpdateIntervalId);
        }
        this._panelUpdateIntervalId = TimerManager.setInterval(() => {
            // 🖤 Guard against panel being removed 💀
            const fpsEl = panel.querySelector('#perf-current-fps');
            if (!fpsEl) {
                TimerManager.clearInterval(this._panelUpdateIntervalId);
                this._panelUpdateIntervalId = null;
                return;
            }
            fpsEl.textContent = this.metrics.currentFPS;
            panel.querySelector('#perf-memory-usage').textContent = this.metrics.memoryUsage.toFixed(1);
            panel.querySelector('#perf-active-particles').textContent = this.metrics.particleCount;
            panel.querySelector('#perf-active-animations').textContent = this.metrics.animationCount;
        }, 1000);
    },
    
    // Initialize object pools
    initializeObjectPools() {
        // Pre-allocate common objects
        for (let i = 0; i < this.poolConfig.preAllocateCount; i++) {
            this.objectPools.particles.push(this.createParticle());
            this.objectPools.animations.push(this.createAnimation());
            this.objectPools.domElements.push(this.createDOMElement());
            this.objectPools.events.push(this.createEvent());
            this.objectPools.timers.push(this.createTimer());
        }
        
        console.log(`Pre-allocated ${this.poolConfig.preAllocateCount} objects for each pool`);
    },
    
    // Create particle object
    createParticle() {
        return {
            id: Math.random().toString(36).slice(2, 11),
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            life: 100,
            maxLife: 100,
            size: 1,
            color: '#ffffff',
            active: false,
            element: null
        };
    },
    
    // Create animation object
    createAnimation() {
        return {
            id: Math.random().toString(36).slice(2, 11),
            element: null,
            property: '',
            startValue: 0,
            endValue: 0,
            duration: 0,
            startTime: 0,
            easing: 'linear',
            active: false,
            onComplete: null
        };
    },
    
    // Create DOM element object
    createDOMElement() {
        const element = document.createElement('div');
        element.style.display = 'none';
        element.className = 'pooled-element';
        return {
            element: element,
            inUse: false,
            type: 'div'
        };
    },
    
    // Create event object
    createEvent() {
        return {
            type: '',
            target: null,
            data: null,
            timestamp: 0,
            handled: false
        };
    },
    
    // Create timer object
    createTimer() {
        return {
            id: Math.random().toString(36).slice(2, 11),
            callback: null,
            delay: 0,
            startTime: 0,
            active: false,
            repeat: false
        };
    },
    
    // Get object from pool
    getFromPool(poolName) {
        const pool = this.objectPools[poolName];
        if (!pool) {
            console.warn(`Pool ${poolName} not found`);
            return this.createObjectForPool(poolName);
        }
        
        let object = pool.find(obj => !obj.active || !obj.inUse);
        
        if (!object) {
            // Pool is empty, create new object
            if (pool.length < this.poolConfig.maxPoolSize) {
                object = this.createObjectForPool(poolName);
                pool.push(object);
            } else {
                // Pool is full, reuse oldest object
                object = pool.shift();
                this.resetObject(object, poolName);
                pool.push(object);
            }
        }
        
        // Mark as in use
        if (object.active !== undefined) {
            object.active = true;
        } else if (object.inUse !== undefined) {
            object.inUse = true;
        }
        
        return object;
    },
    
    // Return object to pool
    returnToPool(poolName, object) {
        const pool = this.objectPools[poolName];
        if (!pool || !object) return;
        
        // Reset object
        this.resetObject(object, poolName);
        
        // Mark as not in use
        if (object.active !== undefined) {
            object.active = false;
        } else if (object.inUse !== undefined) {
            object.inUse = false;
        }
    },
    
    // Create object for specific pool
    createObjectForPool(poolName) {
        switch (poolName) {
            case 'particles':
                return this.createParticle();
            case 'animations':
                return this.createAnimation();
            case 'domElements':
                return this.createDOMElement();
            case 'events':
                return this.createEvent();
            case 'timers':
                return this.createTimer();
            default:
                return null;
        }
    },
    
    // Reset object to default state
    resetObject(object, poolName) {
        switch (poolName) {
            case 'particles':
                object.x = 0;
                object.y = 0;
                object.vx = 0;
                object.vy = 0;
                object.life = 100;
                object.maxLife = 100;
                object.size = 1;
                object.color = '#ffffff';
                // 🖤 Check parentNode exists before removeChild 💀
                if (object.element?.parentNode) {
                    object.element.parentNode.removeChild(object.element);
                }
                object.element = null;
                break;

            case 'animations':
                object.element = null;
                object.property = '';
                object.startValue = 0;
                object.endValue = 0;
                object.duration = 0;
                object.startTime = 0;
                object.easing = 'linear';
                object.onComplete = null;
                break;

            case 'domElements':
                // 🖤 Check parentNode exists before removeChild 💀
                if (object.element?.parentNode) {
                    object.element.parentNode.removeChild(object.element);
                }
                // 🖤 Guard against null element 💀
                if (object.element) {
                    object.element.style.display = 'none';
                    object.element.innerHTML = '';
                    object.element.className = 'pooled-element';
                }
                break;
                
            case 'events':
                object.type = '';
                object.target = null;
                object.data = null;
                object.timestamp = 0;
                object.handled = false;
                break;
                
            case 'timers':
                object.callback = null;
                object.delay = 0;
                object.startTime = 0;
                object.active = false;
                object.repeat = false;
                break;
        }
    },
    
    // Clean up pools
    cleanupPools() {
        for (const [poolName, pool] of Object.entries(this.objectPools)) {
            // Remove unused objects beyond max pool size
            while (pool.length > this.poolConfig.maxPoolSize) {
                const object = pool.pop();
                // 🖤 Check parentNode exists before removeChild 💀
                if (object.element?.parentNode) {
                    object.element.parentNode.removeChild(object.element);
                }
            }
            
            // Clean up DOM elements
            if (poolName === 'domElements') {
                pool.forEach(obj => {
                    if (obj.element && !obj.element.parentNode) {
                        document.body.appendChild(obj.element);
                    }
                });
            }
        }
        
        console.log('Object pools cleaned up');
    },
    
    // Get pool statistics
    getPoolStats() {
        const stats = {};
        for (const [poolName, pool] of Object.entries(this.objectPools)) {
            const activeCount = pool.filter(obj =>
                (obj.active && obj.active !== false) ||
                (obj.inUse && obj.inUse !== false)
            ).length;
            
            stats[poolName] = {
                total: pool.length,
                active: activeCount,
                available: pool.length - activeCount
            };
        }
        return stats;
    },
    
    // Optimize DOM operations in loops
    optimizeDOMLoop(operations) {
        // Batch DOM operations
        const fragment = document.createDocumentFragment();
        const elementsToAppend = [];
        const elementsToRemove = [];
        const elementsToUpdate = [];
        
        operations.forEach(operation => {
            switch (operation.type) {
                case 'create':
                    const element = this.getFromPool('domElements');
                    element.element.innerHTML = operation.content || '';
                    element.element.className = operation.className || '';
                    element.element.style.cssText = operation.style || '';
                    elementsToAppend.push(element);
                    break;
                    
                case 'remove':
                    if (operation.element && operation.element.parentNode) {
                        elementsToRemove.push(operation.element);
                    }
                    break;
                    
                case 'update':
                    if (operation.element) {
                        elementsToUpdate.push(operation);
                    }
                    break;
            }
        });
        
        // Batch append operations
        elementsToAppend.forEach(obj => {
            fragment.appendChild(obj.element);
            if (operation.parent) {
                operation.parent.appendChild(fragment);
            }
        });
        
        // Batch remove operations
        elementsToRemove.forEach(element => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
                // Return to pool if it's a pooled element
                const pooledObj = this.objectPools.domElements.find(obj => obj.element === element);
                if (pooledObj) {
                    this.returnToPool('domElements', pooledObj);
                }
            }
        });
        
        // Batch update operations
        elementsToUpdate.forEach(operation => {
            if (operation.content !== undefined) {
                operation.element.innerHTML = operation.content;
            }
            if (operation.className !== undefined) {
                operation.element.className = operation.className;
            }
            if (operation.style !== undefined) {
                operation.element.style.cssText = operation.style;
            }
        });
    },
    
    // Cleanup
    // 🖤 Get optimization history in chronological order 💀
    // Since we use a circular buffer, we need to reorder the entries
    getOptimizationHistory() {
        if (this.optimizationHistory.length < this._historyMaxSize) {
            // Buffer not full yet - return as-is
            return [...this.optimizationHistory];
        }
        // Buffer is full - reorder from oldest to newest
        const firstPart = this.optimizationHistory.slice(this._historyIndex);
        const secondPart = this.optimizationHistory.slice(0, this._historyIndex);
        return [...firstPart, ...secondPart];
    },

    // 🖤 Clear optimization history 💀
    clearOptimizationHistory() {
        this.optimizationHistory = [];
        this._historyIndex = 0;
    },

    cleanup() {
        // 🖤 Cancel animation frame monitoring 💀
        if (this._monitoringFrameId) {
            cancelAnimationFrame(this._monitoringFrameId);
            this._monitoringFrameId = null;
        }

        // 🖤 Clear panel update interval 💀
        if (this._panelUpdateIntervalId) {
            TimerManager.clearInterval(this._panelUpdateIntervalId);
            this._panelUpdateIntervalId = null;
        }

        // Remove performance display
        const performanceDisplay = document.getElementById('performance-display');
        if (performanceDisplay) {
            performanceDisplay.remove();
        }

        // Remove performance panel
        const performancePanel = document.getElementById('performance-panel');
        if (performancePanel) {
            performancePanel.remove();
        }

        // Clean up object pools
        this.cleanupPools();
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}