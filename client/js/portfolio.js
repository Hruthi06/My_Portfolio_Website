/**
 * portfolio.js — Vanilla JS interactions for the premium portfolio homepage.
 * Handles: particle background, navbar scroll, mobile menu, active nav,
 * intersection observer reveals, skill bar animations, form, and role text rotation.
 */

'use strict';

// ===================================================
// 1. BACKGROUND PARTICLE CANVAS
// ===================================================
(function initParticles() {
    const canvas = document.getElementById('bg-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W, H, particles = [];

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function createParticle() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            r: 0.5 + Math.random() * 1.5,
            dx: (Math.random() - 0.5) * 0.3,
            dy: -0.2 - Math.random() * 0.4,
            alpha: 0.2 + Math.random() * 0.5,
            hue: 220 + Math.random() * 80, // blue→purple range
        };
    }

    for (let i = 0; i < 120; i++) particles.push(createParticle());

    function drawParticles() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach((p, i) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.alpha})`;
            ctx.fill();

            p.x += p.dx;
            p.y += p.dy;

            if (p.y < -5) {
                particles[i] = createParticle();
                particles[i].y = H + 5;
            }
        });
        requestAnimationFrame(drawParticles);
    }
    drawParticles();
})();

// ===================================================
// 2. NAVBAR: scroll effect + mobile hamburger
// ===================================================
(function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            const spans = hamburger.querySelectorAll('span');
            const isOpen = navLinks.classList.contains('open');
            if (isOpen) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
            }
        });

        // Close on nav link click
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                hamburger.querySelectorAll('span').forEach(s => {
                    s.style.transform = '';
                    s.style.opacity = '';
                });
            });
        });
    }
})();

// ===================================================
// 3. ACTIVE NAV LINK based on scroll position
// ===================================================
(function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

    sections.forEach(s => observer.observe(s));
})();

// ===================================================
// 4. SCROLL REVEAL ANIMATIONS
// ===================================================
(function initReveal() {
    // Add reveal class to elements
    const revealTargets = [
        { sel: '.skill-card', delays: true },
        { sel: '.project-card', delays: true },
        { sel: '.section-header', delays: false },
        { sel: '.contact-left', delays: false },
        { sel: '.contact-right', delays: false },
    ];

    revealTargets.forEach(({ sel, delays }) => {
        document.querySelectorAll(sel).forEach((el, i) => {
            el.classList.add('reveal');
            if (delays) el.classList.add(`reveal-delay-${(i % 6) + 1}`);
        });
    });

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

// ===================================================
// 5. SKILL BAR ANIMATIONS
// ===================================================
(function initSkillBars() {
    const bars = document.querySelectorAll('.skill-bar');
    if (!bars.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    bars.forEach(bar => obs.observe(bar));
})();

// ===================================================
// 6. ROLE TEXT ROTATION
// ===================================================
(function initRoleRotation() {
    const el = document.getElementById('role-rotating');
    if (!el) return;

    const roles = [
        'Full Stack Developer',
        'Spring Boot Engineer',
        'REST API Architect',
        'Backend Developer',
        'UI/UX Enthusiast',
    ];
    let idx = 0;

    function typeRole(text, cb) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(8px)';
        setTimeout(() => {
            el.textContent = text;
            el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            if (cb) setTimeout(cb, 2800);
        }, 400);
    }

    function cycle() {
        idx = (idx + 1) % roles.length;
        typeRole(roles[idx], cycle);
    }

    setTimeout(cycle, 3000);
})();

// ===================================================
// 7. CONTACT FORM
// ===================================================
(function initContactForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('contact-submit-btn');
    if (!form || !submitBtn) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const message = form.querySelector('#message').value.trim();

        if (!name || !email || !message) {
            shakeForm(form);
            return;
        }

        // Simulate sending
        setBtnLoading(submitBtn, true);
        await sleep(1500);
        setBtnLoading(submitBtn, false);

        // Success state
        submitBtn.querySelector('span').textContent = 'Message Sent! 🎉';
        submitBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        submitBtn.style.boxShadow = '0 0 25px rgba(34,197,94,0.35)';
        form.reset();

        setTimeout(() => {
            submitBtn.querySelector('span').textContent = 'Send Message';
            submitBtn.style.background = '';
            submitBtn.style.boxShadow = '';
        }, 3500);
    });

    function setBtnLoading(btn, loading) {
        const span = btn.querySelector('span');
        const svg = btn.querySelector('svg');
        if (loading) {
            span.textContent = 'Sending...';
            if (svg) svg.style.display = 'none';
            btn.disabled = true;
            btn.style.opacity = '0.8';
        } else {
            span.textContent = 'Send Message';
            if (svg) svg.style.display = '';
            btn.disabled = false;
            btn.style.opacity = '';
        }
    }

    function shakeForm(el) {
        el.style.animation = 'none';
        el.style.transform = 'translateX(-6px)';
        setTimeout(() => {
            let count = 0;
            const shakeInterval = setInterval(() => {
                el.style.transform = count % 2 === 0 ? 'translateX(6px)' : 'translateX(-6px)';
                count++;
                if (count === 6) {
                    clearInterval(shakeInterval);
                    el.style.transform = '';
                }
            }, 60);
        }, 10);
    }

    function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
})();

// ===================================================
// 8. SMOOTH SCROLL for CTA buttons
// ===================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = this.getAttribute('href');
        if (target === '#') return;
        const el = document.querySelector(target);
        if (el) {
            e.preventDefault();
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ===================================================
// 9. ADD CURSOR GLOW EFFECT (desktop only)
// ===================================================
(function initCursorGlow() {
    if (window.matchMedia('(hover: none)').matches) return;

    const glow = document.createElement('div');
    glow.id = 'cursor-glow';
    Object.assign(glow.style, {
        width: '300px',
        height: '300px',
        position: 'fixed',
        top: '0',
        left: '0',
        pointerEvents: 'none',
        zIndex: '9999',
        background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
        transform: 'translate(-50%, -50%)',
        transition: 'top 0.1s ease, left 0.1s ease',
        borderRadius: '50%',
    });
    document.body.appendChild(glow);

    document.addEventListener('mousemove', (e) => {
        glow.style.left = e.clientX + 'px';
        glow.style.top = e.clientY + 'px';
    });
})();
