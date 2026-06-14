document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // DOM ELEMENTS
    // ==========================================================================
    const envelope = document.getElementById('envelope');
    const waxSeal = document.getElementById('waxSeal');
    const scrollCta = document.getElementById('scrollCta');
    const envelopeInstruction = document.getElementById('envelopeInstruction');
    


    // State Variables
    let envelopeOpened = false;

    // ==========================================================================
    // 3D ENVELOPE CONTROLLER
    // ==========================================================================
    function openEnvelope() {
        if (envelopeOpened) return;
        envelopeOpened = true;
        
        // Add open class to trigger CSS 3D animations (flap opens)
        envelope.classList.add('open');
        
        // Add 'opened' to the wrapper so margin-bottom grows and pushes content down
        const wrapper = document.querySelector('.envelope-wrapper');
        if (wrapper) wrapper.classList.add('opened');
        
        // Expand the hero section to accommodate the card sliding down
        const heroSection = document.getElementById('hero');
        if (heroSection) heroSection.classList.add('envelope-opened');

        // Hide instruction text
        if (envelopeInstruction) {
            envelopeInstruction.classList.add('hidden');
        }
    }

    // Bind click handlers to seal and envelope surface
    if (waxSeal) waxSeal.addEventListener('click', (e) => {
        e.stopPropagation();
        openEnvelope();
    });
    
    if (envelope) envelope.addEventListener('click', () => {
        openEnvelope();
    });



    // ==========================================================================
    // FLOATING PETALS & GOLD DUST PARTICLES (Canvas)
    // ==========================================================================
    const petalsCanvas = document.getElementById('petalsCanvas');
    const pCtx = petalsCanvas.getContext('2d');
    let petals = [];
    const maxPetals = 25;

    function resizePetalsCanvas() {
        petalsCanvas.width = window.innerWidth;
        petalsCanvas.height = window.innerHeight;
    }

    class Petal {
        constructor() {
            this.reset();
            // Start at random y positions initially
            this.y = Math.random() * petalsCanvas.height;
        }

        reset() {
            this.x = Math.random() * petalsCanvas.width;
            this.y = -20;
            this.r = Math.random() * 6 + 8; // heart size
            this.d = Math.random() * 1.5 + 1.0; // falling speed
            this.sway = Math.random() * Math.PI * 2; 
            this.swaySpeed = Math.random() * 0.02 + 0.01;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = Math.random() * 0.02 - 0.01;
            this.type = Math.random() > 0.3 ? 'heart' : 'gold'; // More hearts
        }

        update() {
            this.y += this.d;
            this.x += Math.sin(this.sway) * 1.2;
            this.sway += this.swaySpeed;
            this.rotation += this.rotationSpeed;

            // Reset when falling off canvas limits
            if (this.y > petalsCanvas.height + 20 || this.x < -20 || this.x > petalsCanvas.width + 20) {
                this.reset();
            }
        }

        draw() {
            pCtx.save();
            pCtx.translate(this.x, this.y);
            pCtx.rotate(this.rotation);

            if (this.type === 'heart') {
                // Draw heart shape
                pCtx.beginPath();
                const size = this.r;
                pCtx.moveTo(0, size * 0.3);
                pCtx.bezierCurveTo(0, -size * 0.5, -size * 1.2, -size * 0.5, -size * 1.2, size * 0.3);
                pCtx.bezierCurveTo(-size * 1.2, size * 0.8, 0, size * 1.4, 0, size * 1.8);
                pCtx.bezierCurveTo(0, size * 1.4, size * 1.2, size * 0.8, size * 1.2, size * 0.3);
                pCtx.bezierCurveTo(size * 1.2, -size * 0.5, 0, -size * 0.5, 0, size * 0.3);
                
                // Red/Pink fill
                pCtx.fillStyle = 'rgba(235, 95, 105, 0.7)';
                pCtx.fill();
                
                // Soft border
                pCtx.strokeStyle = 'rgba(215, 75, 85, 0.4)';
                pCtx.lineWidth = 0.5;
                pCtx.stroke();
            } else {
                // Draw shimmering gold dust particle
                pCtx.beginPath();
                pCtx.arc(0, 0, this.r * 0.25, 0, Math.PI * 2);
                pCtx.fillStyle = `rgba(212, 175, 55, ${Math.random() * 0.3 + 0.5})`;
                pCtx.fill();
            }
            pCtx.restore();
        }
    }

    function initPetals() {
        resizePetalsCanvas();
        petals = [];
        for (let i = 0; i < maxPetals; i++) {
            petals.push(new Petal());
        }
    }

    function animatePetals() {
        pCtx.clearRect(0, 0, petalsCanvas.width, petalsCanvas.height);
        
        petals.forEach(petal => {
            petal.update();
            petal.draw();
        });
        
        requestAnimationFrame(animatePetals);
    }

    window.addEventListener('resize', () => {
        if (petalsCanvas) resizePetalsCanvas();
    });

    if (petalsCanvas) {
        initPetals();
        animatePetals();
    }

    // ==========================================================================
    // CANVAS SCRATCH CARD SYSTEM
    // ==========================================================================
    class ScratchCard {
        constructor(canvasId, parentId) {
            this.canvas = document.getElementById(canvasId);
            this.ctx = this.canvas.getContext('2d');
            this.parent = document.getElementById(parentId);
            
            this.isDrawing = false;
            this.lastPoint = null;
            this.isRevealed = false;
            this.brushRadius = 26;

            this.init();
        }

        init() {
            // Set rendering dimensions based on offset size
            this.canvas.width = this.parent.offsetWidth;
            this.canvas.height = this.parent.offsetHeight;

            // Fill with gold foil texture/gradient
            this.paintScratchLayer();

            // Setup listeners
            this.setupEvents();
        }

        paintScratchLayer() {
            const width = this.canvas.width;
            const height = this.canvas.height;

            // Create luxurious gold linear gradient
            const grad = this.ctx.createLinearGradient(0, 0, width, height);
            grad.addColorStop(0, '#aa771c'); // gold dark
            grad.addColorStop(0.25, '#fcf6ba'); // gold light
            grad.addColorStop(0.5, '#b38728'); // gold mid
            grad.addColorStop(0.75, '#fbf5b7'); // gold light
            grad.addColorStop(1, '#aa771c'); // gold dark

            this.ctx.fillStyle = grad;
            this.ctx.fillRect(0, 0, width, height);

            // Double fine brown/gold ornamental borders
            this.ctx.strokeStyle = 'rgba(46, 26, 22, 0.25)';
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeRect(12, 12, width - 24, height - 24);
            
            this.ctx.strokeStyle = 'rgba(46, 26, 22, 0.15)';
            this.ctx.lineWidth = 0.75;
            this.ctx.strokeRect(16, 16, width - 32, height - 32);

            // Traditional Corner Accent markings in CSS/Canvas
            this.drawCornerAccents(width, height);

            // Invitation Text
            this.ctx.fillStyle = '#2e1a16'; // espresso
            this.ctx.font = '500 1.3rem "Cormorant Garamond", serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('SCRATCH TO REVEAL', width / 2, height / 2 - 10);

            // Cursive / Subtext hints
            this.ctx.fillStyle = '#6e544f';
            this.ctx.font = 'italic 1rem "EB Garamond", serif';
            this.ctx.fillText('Reveal Details', width / 2, height / 2 + 18);
        }

        drawCornerAccents(w, h) {
            const ctx = this.ctx;
            const size = 10;
            const offset = 22;

            ctx.strokeStyle = 'rgba(46, 26, 22, 0.3)';
            ctx.lineWidth = 1;

            // Top Left
            ctx.beginPath();
            ctx.moveTo(offset, offset + size); ctx.lineTo(offset, offset); ctx.lineTo(offset + size, offset);
            ctx.stroke();

            // Top Right
            ctx.beginPath();
            ctx.moveTo(w - offset, offset + size); ctx.lineTo(w - offset, offset); ctx.lineTo(w - offset - size, offset);
            ctx.stroke();

            // Bottom Left
            ctx.beginPath();
            ctx.moveTo(offset, h - offset - size); ctx.lineTo(offset, h - offset); ctx.lineTo(offset + size, h - offset);
            ctx.stroke();

            // Bottom Right
            ctx.beginPath();
            ctx.moveTo(w - offset, h - offset - size); ctx.lineTo(w - offset, h - offset); ctx.lineTo(w - offset - size, h - offset);
            ctx.stroke();
        }

        setupEvents() {
            // Touch events mapping (prevent scrolling via touchAction CSS)
            this.canvas.addEventListener('touchstart', (e) => this.handleStart(e), { passive: false });
            this.canvas.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
            this.canvas.addEventListener('touchend', () => this.handleEnd());

            // Mouse events
            this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
            this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
            this.canvas.addEventListener('mouseup', () => this.handleEnd());
            this.canvas.addEventListener('mouseleave', () => this.handleEnd());
        }

        getCoordinates(e) {
            const rect = this.canvas.getBoundingClientRect();
            // Check if touch event vs mouse
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        handleStart(e) {
            if (this.isRevealed) return;
            e.preventDefault();
            this.isDrawing = true;
            this.lastPoint = this.getCoordinates(e);
            this.scratch(this.lastPoint.x, this.lastPoint.y);
        }

        handleMove(e) {
            if (!this.isDrawing || this.isRevealed) return;
            e.preventDefault();
            const currentPoint = this.getCoordinates(e);
            this.scratch(currentPoint.x, currentPoint.y, this.lastPoint);
            this.lastPoint = currentPoint;
        }

        handleEnd() {
            if (!this.isDrawing) return;
            this.isDrawing = false;
            this.lastPoint = null;
            
            // Check coverage on mouse release
            this.checkProgress();
        }

        scratch(x, y, lastPoint = null) {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'destination-out';
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            if (lastPoint) {
                // Scratch line between frames to ensure continuous scratching
                this.ctx.beginPath();
                this.ctx.moveTo(lastPoint.x, lastPoint.y);
                this.ctx.lineTo(x, y);
                this.ctx.lineWidth = this.brushRadius * 2;
                this.ctx.stroke();
            } else {
                // Scratch single point circle
                this.ctx.beginPath();
                this.ctx.arc(x, y, this.brushRadius, 0, Math.PI * 2);
                this.ctx.fill();
            }
            this.ctx.restore();
        }

        checkProgress() {
            if (this.isRevealed) return;

            const width = this.canvas.width;
            const height = this.canvas.height;
            const imgData = this.ctx.getImageData(0, 0, width, height);
            const data = imgData.data;
            
            let clearedPixels = 0;
            // Sampling grid steps of 40 bytes (10 pixels) for performance speed
            const step = 40;
            let totalPixels = 0;

            for (let i = 3; i < data.length; i += step) {
                totalPixels++;
                if (data[i] === 0) {
                    clearedPixels++;
                }
            }

            const percentage = (clearedPixels / totalPixels) * 100;

            // Auto-clear threshold (60%)
            if (percentage >= 60) {
                this.revealCard();
            }
        }

        revealCard() {
            this.isRevealed = true;
            this.canvas.classList.add('fade-out');
            
            // Trigger customized metallic confetti
            this.triggerConfetti();
        }

        triggerConfetti() {
            // Create temporary canvas inside card wrapper
            const confCanvas = document.createElement('canvas');
            confCanvas.style.position = 'absolute';
            confCanvas.style.top = '0';
            confCanvas.style.left = '0';
            confCanvas.style.width = '100%';
            confCanvas.style.height = '100%';
            confCanvas.style.pointerEvents = 'none';
            confCanvas.style.zIndex = '4';
            
            this.parent.appendChild(confCanvas);
            
            const cCtx = confCanvas.getContext('2d');
            confCanvas.width = this.parent.offsetWidth;
            confCanvas.height = this.parent.offsetHeight;

            let particles = [];
            const colors = ['#aa771c', '#fcf6ba', '#b38728', '#f5d8d3', '#ffffff'];

            // Spawn particles radiating from center
            for (let i = 0; i < 45; i++) {
                particles.push({
                    x: confCanvas.width / 2,
                    y: confCanvas.height / 2,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8 - 4,
                    r: Math.random() * 4 + 3,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    opacity: 1,
                    rotation: Math.random() * 360,
                    rotationSpeed: Math.random() * 10 - 5,
                    gravity: 0.15,
                    decay: Math.random() * 0.015 + 0.01
                });
            }

            function drawBurst() {
                cCtx.clearRect(0, 0, confCanvas.width, confCanvas.height);
                let alive = false;

                particles.forEach(p => {
                    if (p.opacity > 0) {
                        alive = true;
                        p.x += p.vx;
                        p.y += p.vy;
                        p.vy += p.gravity;
                        p.vx *= 0.98; // air resistance
                        p.rotation += p.rotationSpeed;
                        p.opacity -= p.decay;

                        cCtx.save();
                        cCtx.translate(p.x, p.y);
                        cCtx.rotate(p.rotation * Math.PI / 180);
                        cCtx.fillStyle = p.color;
                        cCtx.globalAlpha = p.opacity;

                        // Draw square confetti bits
                        cCtx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
                        cCtx.restore();
                    }
                });

                if (alive) {
                    requestAnimationFrame(drawBurst);
                } else {
                    // Remove canvas when done
                    confCanvas.remove();
                }
            }

            drawBurst();
        }
    }

    // Initialize scratch cards on DOM load
    let cardWedding, cardReception;
    if (document.getElementById('canvasWedding')) {
        cardWedding = new ScratchCard('canvasWedding', 'cardWedding');
    }
    if (document.getElementById('canvasReception')) {
        cardReception = new ScratchCard('canvasReception', 'cardReception');
    }

    // Handle screen layout scaling updates
    window.addEventListener('resize', () => {
        // Recalculate dimensions without overriding values if already scratched
        if (cardWedding && !cardWedding.isRevealed) cardWedding.init();
        if (cardReception && !cardReception.isRevealed) cardReception.init();
    });

    // ==========================================================================
    // SCROLL REVEAL TRIGGERS
    // ==========================================================================
    const revealElements = document.querySelectorAll('.scroll-reveal');

    function checkReveal() {
        const triggerBottom = window.innerHeight * 0.85;

        revealElements.forEach(el => {
            const elTop = el.getBoundingClientRect().top;
            if (elTop < triggerBottom) {
                el.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', checkReveal);
    checkReveal(); // Trigger once initially


});
