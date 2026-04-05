/**
 * portfolio.js — Vanilla JS interactions for the premium portfolio homepage.
 * Handles: particle background, navbar scroll, mobile menu, active nav,
 * intersection observer reveals, skill bar animations, dynamic API data,
 * contact form, role text rotation, and cursor glow effect.
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

    function createParticle(atBottom = false) {
        return {
            x: Math.random() * W,
            y: atBottom ? H + 5 : Math.random() * H,
            r: 0.5 + Math.random() * 1.5,
            dx: (Math.random() - 0.5) * 0.25,
            dy: -0.15 - Math.random() * 0.35,
            alpha: 0.15 + Math.random() * 0.4,
            hue: 220 + Math.random() * 80,
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
            if (p.y < -5) particles[i] = createParticle(true);
        });
        requestAnimationFrame(drawParticles);
    }
    drawParticles();
})();

// ===================================================
// 2. NAVBAR: scroll effect + mobile hamburger
// ===================================================
(function initNavbar() {
    const navbar   = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger-btn');
    const navLinks  = document.getElementById('nav-links');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 30);
    });

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            const spans  = hamburger.querySelectorAll('span');
            if (isOpen) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity   = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
            }
        });

        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                hamburger.querySelectorAll('span').forEach(s => {
                    s.style.transform = ''; s.style.opacity = '';
                });
            });
        });
    }
})();

// ===================================================
// 3. ACTIVE NAV LINK on scroll
// ===================================================
(function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const links    = document.querySelectorAll('.nav-link');

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const id = e.target.id;
                links.forEach(l =>
                    l.classList.toggle('active', l.getAttribute('href') === `#${id}`)
                );
            }
        });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

    sections.forEach(s => obs.observe(s));
})();

// ===================================================
// 4. SCROLL REVEAL ANIMATIONS
// ===================================================
(function initReveal() {
    const targets = [
        '.section-header',
        '.contact-left',
        '.contact-right',
    ];
    targets.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.classList.add('reveal'));
    });

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

// ===================================================
// 5. SKILL BAR ANIMATION helper (callable after render)
// ===================================================
function attachSkillBarObserver() {
    const bars = document.querySelectorAll('.skill-bar:not(.skill-bar--watched)');
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('animated'); obs.unobserve(e.target); }
        });
    }, { threshold: 0.3 });
    bars.forEach(bar => {
        bar.classList.add('skill-bar--watched');
        obs.observe(bar);
    });
}

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

    function changeRole() {
        el.style.transition = 'none';
        el.style.opacity    = '0';
        el.style.transform  = 'translateY(8px)';
        setTimeout(() => {
            idx = (idx + 1) % roles.length;
            el.textContent = roles[idx];
            el.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
            el.style.opacity    = '1';
            el.style.transform  = 'translateY(0)';
            setTimeout(changeRole, 2800);
        }, 400);
    }
    setTimeout(changeRole, 3200);
})();

// ===================================================
// 7. DYNAMIC SKILL CARDS from API
// ===================================================
(function loadSkills() {
    const grid = document.getElementById('skills-grid');
    if (!grid) return;

    const iconMap = {
        'Spring Boot': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
        'JWT Auth':    `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
        'REST APIs':   `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"/><rect x="8" y="2" width="14" height="14" rx="2" ry="2"/></svg>`,
        'MySQL':       `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
        'HTML / CSS':  `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
        'JavaScript':  `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
    };

    function defaultIcon() {
        return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`;
    }

    fetch('/api/skills')
        .then(r => r.json())
        .then(skills => {
            if (!skills.length) return; // fall back to static HTML
            grid.innerHTML = '';
            skills.forEach((skill, i) => {
                const icon  = iconMap[skill.name] || defaultIcon();
                const delay = `reveal-delay-${(i % 6) + 1}`;
                const card  = document.createElement('div');
                card.className = `skill-card reveal ${delay}`;
                card.id = `skill-card-${skill.id}`;
                card.innerHTML = `
                    <div class="skill-icon-wrap">${icon}</div>
                    <h3>${skill.name}</h3>
                    <p>${skill.description}</p>
                    <div class="skill-level">
                        <div class="skill-bar" style="--w:${skill.level}%"></div>
                    </div>`;
                grid.appendChild(card);
            });
            // Re-attach observers for newly created elements
            document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
                const obs = new IntersectionObserver((entries) => {
                    entries.forEach(e => {
                        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
                    });
                }, { threshold: 0.1 });
                obs.observe(el);
            });
            attachSkillBarObserver();
        })
        .catch(() => {
            // API down — static HTML already in place; just animate bars
            attachSkillBarObserver();
        });
})();

// ===================================================
// 8. DYNAMIC PROJECT CARDS from API
// ===================================================
(function loadProjects() {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    const GH_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`;
    const EXT_ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;

    function buildProjectCard(project, index) {
        const isFeatured = project.featured || index === 0;
        const tags = (project.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
        const card = document.createElement('div');
        card.className = `project-card${isFeatured ? ' featured' : ''} reveal reveal-delay-${(index % 5) + 1}`;
        card.id = `project-${project.id}`;
        card.innerHTML = `
            <div class="project-glow"></div>
            <div class="project-header">
                <div class="project-icon">${project.icon || '🚀'}</div>
                <div class="project-links">
                    <a href="${project.githubUrl || '#'}" class="project-link" target="_blank" rel="noopener" aria-label="GitHub" id="proj${project.id}-gh">${GH_ICON}</a>
                    <a href="${project.liveUrl  || '#'}" class="project-link" target="_blank" rel="noopener" aria-label="Live Demo" id="proj${project.id}-live">${EXT_ICON}</a>
                </div>
            </div>
            <h3 class="project-title">${project.title}</h3>
            <p class="project-desc">${project.description}</p>
            <div class="project-tags">${tags}</div>`;
        return card;
    }

    fetch('/api/projects')
        .then(r => r.json())
        .then(projects => {
            if (!projects.length) return;
            grid.innerHTML = '';
            projects.forEach((p, i) => grid.appendChild(buildProjectCard(p, i)));

            // Re-run reveal observer for new cards
            const obs = new IntersectionObserver((entries) => {
                entries.forEach(e => {
                    if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
                });
            }, { threshold: 0.08 });
            grid.querySelectorAll('.reveal').forEach(el => obs.observe(el));
        })
        .catch(err => console.warn('Projects API unavailable, using static HTML.', err));
})();

// ===================================================
// 9. CONTACT FORM with feedback states
// ===================================================
(function initContactForm() {
    const form      = document.getElementById('contact-form');
    const submitBtn = document.getElementById('contact-submit-btn');
    if (!form || !submitBtn) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name    = form.querySelector('#name').value.trim();
        const email   = form.querySelector('#email').value.trim();
        const message = form.querySelector('#message').value.trim();

        if (!name || !email || !message) { shakeEl(submitBtn); return; }

        setBtnState(submitBtn, 'loading');
        await sleep(1400);
        setBtnState(submitBtn, 'success');
        form.reset();
        setTimeout(() => setBtnState(submitBtn, 'idle'), 4000);
    });

    function setBtnState(btn, state) {
        const span = btn.querySelector('span');
        const svg  = btn.querySelector('svg');
        if (state === 'loading') {
            span.textContent = 'Sending…';
            if (svg) svg.style.display = 'none';
            btn.disabled = true;
            btn.style.opacity = '0.8';
        } else if (state === 'success') {
            span.textContent = 'Message Sent! 🎉';
            if (svg) svg.style.display = 'none';
            btn.disabled = false;
            btn.style.opacity   = '';
            btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
            btn.style.boxShadow  = '0 0 28px rgba(34,197,94,.4)';
        } else {
            span.textContent     = 'Send Message';
            if (svg) svg.style.display = '';
            btn.disabled         = false;
            btn.style.opacity    = '';
            btn.style.background = '';
            btn.style.boxShadow  = '';
        }
    }

    function shakeEl(el) {
        el.style.transition = 'transform .07s ease';
        const dirs = ['-8px','8px','-6px','6px','-4px','4px','0px'];
        dirs.reduce((p, x) => p.then(() => new Promise(r => {
            el.style.transform = `translateX(${x})`;
            setTimeout(r, 65);
        })), Promise.resolve()).then(() => el.style.transition = '');
    }

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
})();

// ===================================================
// 10. SMOOTH SCROLL for all anchor links
// ===================================================
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
        const target = this.getAttribute('href');
        if (target === '#') return;
        const el = document.querySelector(target);
        if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
});

// ===================================================
// 11. CURSOR GLOW (desktop only)
// ===================================================
(function initCursorGlow() {
    if (window.matchMedia('(hover: none)').matches) return;
    const glow = document.createElement('div');
    glow.setAttribute('aria-hidden', 'true');
    Object.assign(glow.style, {
        width: '320px', height: '320px',
        position: 'fixed', top: '0', left: '0',
        pointerEvents: 'none', zIndex: '9999',
        background: 'radial-gradient(circle, rgba(139,92,246,.07) 0%, transparent 70%)',
        transform: 'translate(-50%,-50%)',
        borderRadius: '50%',
        transition: 'left .08s ease, top .08s ease',
    });
    document.body.appendChild(glow);
    document.addEventListener('mousemove', e => {
        glow.style.left = e.clientX + 'px';
        glow.style.top  = e.clientY + 'px';
    });
})();

// ===================================================
// 12. INITIAL skill bar trigger (for static HTML fallback)
// ===================================================
attachSkillBarObserver();
