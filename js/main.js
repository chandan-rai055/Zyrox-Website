/**
 * ZYROX MEDIA - INTERACTIVE ENGINE
 * Frameworks: GSAP, ScrollTrigger, Lenis Smooth Scroll
 * Dark-first luxury agency experience
 */

(function () {
  'use strict';

  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(pointer: coarse)').matches;

  /* ==========================================================================
     01. SMOOTH SCROLL (LENIS INTEGRATION)
     ========================================================================== */
  let lenis = null;

  function initSmoothScroll() {
    if (prefersReducedMotion) return;

    if (typeof Lenis !== 'undefined') {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        infinite: false,
      });

      // Synchronize Lenis with GSAP ScrollTrigger
      if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
          lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
      } else {
        function raf(time) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }
    }
  }

  /* ==========================================================================
     02. CUSTOM CURSOR WITH DYNAMIC VIEW/EXPLORE STATES
     ========================================================================== */
  function initCustomCursor() {
    if (isTouchDevice || prefersReducedMotion) return;

    const cursorDot = document.querySelector('.cursor-dot');
    const cursorFollower = document.querySelector('.cursor-follower');
    const cursorText = document.querySelector('.cursor-text');

    if (!cursorDot || !cursorFollower) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let followerX = mouseX;
    let followerY = mouseY;
    let isHovering = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    // Smooth follower lerp loop
    function updateFollower() {
      followerX += (mouseX - followerX) * 0.18;
      followerY += (mouseY - followerY) * 0.18;

      cursorFollower.style.left = `${followerX}px`;
      cursorFollower.style.top = `${followerY}px`;

      requestAnimationFrame(updateFollower);
    }
    requestAnimationFrame(updateFollower);

    // Interactive Hover Elements
    const hoverTargets = [
      { selector: '.service-card', text: 'Explore' },
      { selector: '.project-card, .fp-row', text: 'View' },
      { selector: '.deliverable-tile, .wd-card, .wc-card, .tm-card, .fd-steps li', text: 'Inspect' },
      { selector: '.btn-accent, .btn-outline, .social-icon-btn', text: '' },
      { selector: 'a, button', text: '' }
    ];

    hoverTargets.forEach((target) => {
      document.querySelectorAll(target.selector).forEach((el) => {
        el.addEventListener('mouseenter', () => {
          document.body.classList.add('cursor-hover');
          if (target.text && cursorText) {
            cursorText.textContent = target.text;
          } else if (cursorText) {
            cursorText.textContent = '';
          }
        });

        el.addEventListener('mouseleave', () => {
          document.body.classList.remove('cursor-hover');
          if (cursorText) cursorText.textContent = '';
        });
      });
    });

    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorFollower.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1';
      cursorFollower.style.opacity = '1';
    });
  }

  /* ==========================================================================
     03. NAVBAR AUTO-HIDE & MOBILE MENU OVERLAY
     ========================================================================== */
  function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileMenu = document.querySelector('.mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    const scrollBar = document.querySelector('.scroll-progress-bar');
    const backToTopBtn = document.querySelector('.back-to-top-btn');
    const progressCircle = document.querySelector('.progress-ring-circle');

    let lastScrollY = window.scrollY;
    const circleRadius = 25;
    const circumference = 2 * Math.PI * circleRadius; // ~157

    if (progressCircle) {
      progressCircle.style.strokeDasharray = `${circumference}`;
      progressCircle.style.strokeDashoffset = `${circumference}`;
    }

    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (currentScrollY / docHeight) : 0;

      // Top scroll progress bar
      if (scrollBar) {
        scrollBar.style.width = `${scrollPercent * 100}%`;
      }

      // Back to top circular progress ring
      if (progressCircle) {
        const offset = circumference - (scrollPercent * circumference);
        progressCircle.style.strokeDashoffset = `${offset}`;
      }

      // Back to top visibility
      if (backToTopBtn) {
        if (currentScrollY > 400) {
          backToTopBtn.classList.add('visible');
        } else {
          backToTopBtn.classList.remove('visible');
        }
      }

      // Navbar hide on scroll down, show on scroll up
      if (currentScrollY > 120) {
        if (currentScrollY > lastScrollY && !mobileMenu?.classList.contains('open')) {
          navbar.classList.add('navbar-hidden');
        } else {
          navbar.classList.remove('navbar-hidden');
        }
      } else {
        navbar.classList.remove('navbar-hidden');
      }

      lastScrollY = currentScrollY;
    }, { passive: true });

    // Mobile Hamburger
    if (mobileToggle && mobileMenu && !mobileToggle._bound) {
      mobileToggle._bound = true;
      function toggleMenu(e) {
        if (e) e.preventDefault();
        const isOpen = mobileMenu.classList.toggle('open');
        mobileToggle.classList.toggle('active', isOpen);
        mobileToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        mobileMenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
        if (navbar) navbar.classList.remove('navbar-hidden');
        document.body.style.overflow = isOpen ? 'hidden' : '';
      }

      function closeMenu() {
        mobileMenu.classList.remove('open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }

      mobileToggle.addEventListener('click', toggleMenu);

      mobileLinks.forEach((link) => {
        link.addEventListener('click', closeMenu);
      });

      const overlayCta = mobileMenu.querySelector('.nav-btn-get-started');
      if (overlayCta) {
        overlayCta.addEventListener('click', closeMenu);
      }

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
          closeMenu();
        }
      });
    }

    // Back to top click
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        if (lenis) {
          lenis.scrollTo(0, { duration: 1.2 });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    }

    // Scrollspy for active nav link highlight
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = [
      { id: 'hero', linkHref: '#hero' },
      { id: 'services', linkHref: '#services' },
      { id: 'why-us', linkHref: '#why-us' },
      { id: 'projects', linkHref: '#projects' }
    ];

    function updateActiveNavLink() {
      const scrollPosition = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const secEl = document.getElementById(sections[i].id);
        if (secEl) {
          const top = secEl.offsetTop;
          if (scrollPosition >= top) {
            navLinks.forEach((l) => l.classList.remove('active'));
            const activeLink = document.querySelector(`.nav-link[href="${sections[i].linkHref}"]`);
            if (activeLink) activeLink.classList.add('active');
            break;
          }
        }
      }
    }

    window.addEventListener('scroll', updateActiveNavLink, { passive: true });

    // Smooth navigation anchor clicks
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();

            // Set active link immediately on click
            if (this.classList.contains('nav-link')) {
              navLinks.forEach((l) => l.classList.remove('active'));
              this.classList.add('active');
            }

            if (lenis) {
              lenis.scrollTo(targetEl, { offset: -60, duration: 1.2 });
            } else {
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        }
      });
    });
  }

  /* ==========================================================================
     04. MAGNETIC BUTTONS
     ========================================================================== */
  function initMagneticButtons() {
    if (isTouchDevice || prefersReducedMotion) return;

    const magneticElements = document.querySelectorAll('.btn-accent, .btn-magnetic');

    magneticElements.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * 0.32;
        const deltaY = (e.clientY - centerY) * 0.32;

        if (typeof gsap !== 'undefined') {
          gsap.to(btn, {
            x: deltaX,
            y: deltaY,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      });

      btn.addEventListener('mouseleave', () => {
        if (typeof gsap !== 'undefined') {
          gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.4)',
          });
        }
      });
    });
  }

  /* ==========================================================================
     05. HERO SECTION ANIMATIONS (ENTRANCE + 3D PARALLAX TILT)
     ========================================================================== */
  function initHeroAnimations() {
    if (prefersReducedMotion) return;

    // 3D Parallax Mouse Tracking for sd-vis
    if (!isTouchDevice) {
      const heroSection = document.querySelector('.sd-hero');
      const visWrapper = document.querySelector('.sd-vis');

      if (heroSection && visWrapper) {
        heroSection.addEventListener('mousemove', (e) => {
          const rect = heroSection.getBoundingClientRect();
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const mouseXRel = (e.clientX - rect.left - centerX) / centerX; // -1 to 1
          const mouseYRel = (e.clientY - rect.top - centerY) / centerY; // -1 to 1

          const tiltX = -mouseYRel * 8;
          const tiltY = mouseXRel * 10;

          visWrapper.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        });

        heroSection.addEventListener('mouseleave', () => {
          visWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
      }
    }
  }

  /* ==========================================================================
     06. INFINITE MARQUEE WITH SCROLL ACCELERATION
     ========================================================================== */
  function initMarquee() {
    if (prefersReducedMotion) return;

    const marqueeTrack = document.querySelector('.marquee-track');
    if (!marqueeTrack || typeof ScrollTrigger === 'undefined') return;

    let currentSpeed = 1;
    let targetSpeed = 1;

    // Listen to scroll velocity
    ScrollTrigger.create({
      onUpdate: (self) => {
        const velocity = Math.abs(self.getVelocity() / 300);
        targetSpeed = Math.min(3.5, 1 + velocity);
      }
    });

    function checkSpeed() {
      currentSpeed += (targetSpeed - currentSpeed) * 0.1;
      targetSpeed += (1 - targetSpeed) * 0.05; // gradually return to normal

      const contents = document.querySelectorAll('.marquee-content');
      contents.forEach((c) => {
        c.style.animationDuration = `${24 / currentSpeed}s`;
      });

      requestAnimationFrame(checkSpeed);
    }
    requestAnimationFrame(checkSpeed);
  }

  /* ==========================================================================
     07. STATS COUNTERS (COUNT UP ON VIEW)
     ========================================================================== */
  function initStatsCounters() {
    const statCards = document.querySelectorAll('.stat-yellow-card, .stat-card');
    if (!statCards.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const card = entry.target;
          card.classList.add('in-view');

          const numberEl = card.querySelector('.stat-yellow-num, .stat-number');
          if (numberEl && !numberEl.dataset.counted) {
            numberEl.dataset.counted = 'true';
            const targetVal = parseFloat(numberEl.dataset.target);
            const isDecimal = targetVal % 1 !== 0;

            if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
              const obj = { val: 0 };
              gsap.to(obj, {
                val: targetVal,
                duration: 2.2,
                ease: 'power2.out',
                onUpdate: () => {
                  numberEl.textContent = isDecimal ? obj.val.toFixed(1) : Math.floor(obj.val).toLocaleString();
                }
              });
            } else {
              numberEl.textContent = targetVal;
            }
          }
          observer.unobserve(card);
        }
      });
    }, { threshold: 0.25 });

    statCards.forEach((card) => observer.observe(card));
  }

  /* ==========================================================================
     08. SERVICES SPOTLIGHT & 3D TILT
     ========================================================================== */
  function initServicesSpotlight() {
    const serviceCards = document.querySelectorAll('.service-card');

    serviceCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Mouse radial spotlight
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        // Subtle 3D Card Tilt
        if (!isTouchDevice && !prefersReducedMotion) {
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const tiltX = -(y - centerY) / 20;
          const tiltY = (x - centerX) / 20;

          card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        if (!isTouchDevice && !prefersReducedMotion) {
          card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
        }
      });
    });

    // Scroll reveal for cards
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
      gsap.from('.service-card', {
        scrollTrigger: {
          trigger: '.services-grid',
          start: 'top 80%',
        },
        opacity: 0,
        y: 45,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
      });
    }
  }

  /* ==========================================================================
     09. DELIVERABLES STACK (COUNT-UP & AUTO ANIMATION)
     ========================================================================== */
  function initDeliverables() {
    const tiles = document.querySelectorAll('.deliv-black-tile, .deliverable-tile');
    if (!tiles.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const tile = entry.target;
          const countEl = tile.querySelector('.deliv-big-number, .deliverable-count');

          if (countEl && !countEl.dataset.counted) {
            countEl.dataset.counted = 'true';
            const targetVal = parseInt(countEl.dataset.target, 10);

            if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
              const counter = { val: 0 };
              gsap.to(counter, {
                val: targetVal,
                duration: 1.8,
                ease: 'power2.out',
                onUpdate: () => {
                  countEl.textContent = Math.floor(counter.val);
                }
              });
            } else {
              countEl.textContent = targetVal;
            }
          }
          observer.unobserve(tile);
        }
      });
    }, { threshold: 0.25 });

    tiles.forEach((t) => observer.observe(t));

    // Staggered entrance
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
      gsap.from('.deliv-black-tile, .deliverable-tile', {
        scrollTrigger: {
          trigger: '.deliverables-yellow-grid, .deliverables-grid',
          start: 'top 80%',
        },
        opacity: 0,
        y: 35,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
      });
    }
  }

  /* ==========================================================================
     10. WHY CHOOSE US (NUMBER FILL SCRUB + DIVIDERS)
     ========================================================================== */
  function initWhyChooseUs() {
    const whyItems = document.querySelectorAll('.why-item');
    if (!whyItems.length) return;

    if (typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
      whyItems.forEach((item) => {
        ScrollTrigger.create({
          trigger: item,
          start: 'top 75%',
          onEnter: () => {
            item.classList.add('active-step', 'in-view');
          },
          onLeaveBack: () => {
            item.classList.remove('active-step');
          }
        });
      });
    } else {
      whyItems.forEach((item) => item.classList.add('active-step', 'in-view'));
    }
  }

  /* ==========================================================================
     11. HOW WE WORK (TIMELINE SCRUB PROGRESS & STEP LIGHTING)
     ========================================================================== */
  function initTimeline() {
    const timelineContainer = document.querySelector('.timeline-container');
    const progressLine = document.querySelector('.timeline-progress-line');
    const steps = document.querySelectorAll('.timeline-step');

    if (!timelineContainer || !steps.length) return;

    if (typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
      // Scrubbed vertical progress line
      if (progressLine) {
        ScrollTrigger.create({
          trigger: timelineContainer,
          start: 'top 70%',
          end: 'bottom 60%',
          scrub: true,
          onUpdate: (self) => {
            progressLine.style.height = `${self.progress * 100}%`;
          }
        });
      }

      // Step nodes lighting up and cards sliding in
      steps.forEach((step, idx) => {
        const card = step.querySelector('.timeline-card');
        const isOdd = idx % 2 === 0;

        // Slide card in
        gsap.from(card, {
          scrollTrigger: {
            trigger: step,
            start: 'top 75%',
          },
          opacity: 0,
          x: isOdd ? -50 : 50,
          duration: 0.8,
          ease: 'power3.out'
        });

        // Activate node when reached
        ScrollTrigger.create({
          trigger: step,
          start: 'top 65%',
          onEnter: () => step.classList.add('active'),
          onLeaveBack: () => step.classList.remove('active')
        });
      });
    } else {
      if (progressLine) progressLine.style.height = '100%';
      steps.forEach((step) => step.classList.add('active'));
    }
  }

  /* ==========================================================================
     12. FEATURED PROJECTS (FILTERING PILLS & SMOOTH TRANSITION)
     ========================================================================== */
  function initProjectsFilter() {
    const filterPills = document.querySelectorAll('.filter-pill');
    const projectCards = document.querySelectorAll('.project-card');

    if (!filterPills.length || !projectCards.length) return;

    filterPills.forEach((pill) => {
      pill.addEventListener('click', function () {
        filterPills.forEach((p) => p.classList.remove('active'));
        this.classList.add('active');

        const filterCategory = this.dataset.filter;

        projectCards.forEach((card) => {
          const cardCategory = card.dataset.category;
          const shouldShow = filterCategory === 'all' || cardCategory === filterCategory;

          if (shouldShow) {
            card.style.display = 'flex';
            if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
              gsap.fromTo(card, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' });
            } else {
              card.style.opacity = '1';
            }
          } else {
            card.style.display = 'none';
          }
        });

        // Refresh ScrollTrigger calculations after DOM change
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      });
    });

    // Metric counters in projects
    const metricObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const metricVal = entry.target;
          const target = parseFloat(metricVal.dataset.target);
          const isDecimal = target % 1 !== 0;

          if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
            const num = { val: 0 };
            gsap.to(num, {
              val: target,
              duration: 2,
              ease: 'power2.out',
              onUpdate: () => {
                metricVal.textContent = isDecimal ? num.val.toFixed(1) : Math.floor(num.val).toLocaleString();
              }
            });
          }
          metricObserver.unobserve(metricVal);
        }
      });
    }, { threshold: 0.3 });

    document.querySelectorAll('.project-metric-val').forEach((el) => metricObserver.observe(el));
  }

  /* ==========================================================================
     13. INTERACTIVE MODALS (SHOWREEL & CONTACT DISCOVERY)
     ========================================================================== */
  function initModals() {
    const introModal = document.getElementById('introModal');
    const contactModal = document.getElementById('contactModal');

    // Trigger buttons
    const watchIntroBtns = document.querySelectorAll('[data-open-modal="intro"]');
    const contactBtns = document.querySelectorAll('[data-open-modal="contact"]');
    const closeBtns = document.querySelectorAll('.modal-close-btn');

    function openModal(modal) {
      if (!modal) return;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
      if (!modal) return;
      modal.classList.remove('active');
      document.body.style.overflow = '';
      // Pause any video if present
      const iframe = modal.querySelector('iframe');
      if (iframe) {
        const src = iframe.src;
        iframe.src = src; // reset to stop playback
      }
    }

    watchIntroBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(introModal);
      });
    });

    contactBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const ctSection = document.getElementById('contact') || document.getElementById('ct-card');
        if (ctSection) {
          ctSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.href = '/contact';
        }
      });
    });

    closeBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (introModal) closeModal(introModal);
        if (contactModal) closeModal(contactModal);
      });
    });

    // Close on backdrop click
    [introModal, contactModal].forEach((modal) => {
      if (!modal) return;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    });

    // Close on Esc key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (introModal) closeModal(introModal);
        if (contactModal) closeModal(contactModal);
      }
    });

    // Form Submission Interactivity
    const contactForm = document.getElementById('discoveryForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending Request...';
        submitBtn.disabled = true;

        setTimeout(() => {
          contactForm.innerHTML = `
            <div style="text-align: center; padding: 30px 10px;">
              <div style="width: 56px; height: 56px; border-radius: 50%; background: #FFD400; color: #0A0A0B; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 24px;">✓</div>
              <h3 style="font-size: 1.6rem; color: #F5F3EE; margin-bottom: 12px; font-family: var(--font-display);">Discovery Call Requested!</h3>
              <p style="color: #A1A1AA; font-size: 0.95rem; line-height: 1.6;">Our strategy team will review your brand details and reach out within 2 hours with audit insights.</p>
            </div>
          `;
        }, 1000);
      });
    }
  }

  /* ==========================================================================
     14. INITIALIZE ALL MODULES DEFENSIVELY
     ========================================================================== */
  function initAll() {
    try { initNavbar(); } catch (e) { console.error('initNavbar error:', e); }
    try { initSmoothScroll(); } catch (e) { console.error('initSmoothScroll error:', e); }
    try { initCustomCursor(); } catch (e) { console.error('initCustomCursor error:', e); }
    try { initMagneticButtons(); } catch (e) { console.error('initMagneticButtons error:', e); }
    try { initHeroAnimations(); } catch (e) { console.error('initHeroAnimations error:', e); }
    try { initMarquee(); } catch (e) { console.error('initMarquee error:', e); }
    try { initStatsCounters(); } catch (e) { console.error('initStatsCounters error:', e); }
    try { initServicesSpotlight(); } catch (e) { console.error('initServicesSpotlight error:', e); }
    try { initDeliverables(); } catch (e) { console.error('initDeliverables error:', e); }
    try { initWhyChooseUs(); } catch (e) { console.error('initWhyChooseUs error:', e); }
    try { initTimeline(); } catch (e) { console.error('initTimeline error:', e); }
    try { initProjectsFilter(); } catch (e) { console.error('initProjectsFilter error:', e); }
    try { initModals(); } catch (e) { console.error('initModals error:', e); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

})();
