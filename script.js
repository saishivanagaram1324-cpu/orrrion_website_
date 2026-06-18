/* ======================================================
   ORRION — Modern Interactive Features
   ====================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // Initialize Lenis for Smooth Scrolling
  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  // 1. Scroll indicator fade-out
  const scrollIndicator = document.getElementById('scrollIndicator');
  if (scrollIndicator) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.pointerEvents = 'none';
      } else {
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.pointerEvents = 'auto';
      }
    }, { passive: true });
  }

  // 2. Intersection Observer for fade-up animation (.reveal)
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    reveals.forEach(el => observer.observe(el));
  }

  // 3. Stats Count-Up Animation
  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length) {
    const countUp = (el) => {
      const target = parseInt(el.getAttribute('data-target'), 10);
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 3000; // 3 seconds
      const startTime = performance.now();

      const updateNumber = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out quad formula
        const easeProgress = progress * (2 - progress);
        
        const currentValue = Math.floor(easeProgress * target);
        
        // Format numbers (e.g. 165000 -> 165,000)
        if (target >= 1000) {
          el.textContent = prefix + currentValue.toLocaleString() + suffix;
        } else {
          el.textContent = prefix + currentValue + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          el.textContent = prefix + target.toLocaleString() + suffix;
          // Add class to parent highlight-circle container if present
          const parentHighlight = el.closest('.highlight-circle');
          if (parentHighlight) {
            parentHighlight.classList.add('show-circle');
          }
        }
      };

      requestAnimationFrame(updateNumber);
    };

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          countUp(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(num => statsObserver.observe(num));
  }


  // 5. Section-Relative Parallax Scrolling
  const parallaxElements = document.querySelectorAll('.parallax-element');
  if (parallaxElements.length) {
    const updateParallax = () => {
      const vh = window.innerHeight;
      parallaxElements.forEach(el => {
        const parent = el.closest('section') || el.parentElement;
        const rect = parent.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) {
          const speed = parseFloat(el.getAttribute('data-speed')) || 0;
          const sectionCenter = rect.top + rect.height / 2;
          const viewportCenter = vh / 2;
          const offset = (sectionCenter - viewportCenter) * (speed - 1);
          
          if (el.classList.contains('hero-circles-fg')) {
            el.style.transform = `translateY(${offset}px) rotate(8deg)`;
          } else {
            el.style.transform = `translateY(${offset}px)`;
          }
        }
      });
    };

    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', updateParallax);
    updateParallax();
  }

  // 6. Pain Section Search Animation
  const painSection = document.getElementById('pain');
  const searchAnimContainer = document.getElementById('painSearchAnim');
  const searchBar = document.getElementById('searchBar');
  const searchText = document.getElementById('searchText');
  const searchCursor = document.getElementById('searchCursor');

  if (painSection && searchAnimContainer && searchBar && searchText && searchCursor) {
    let hasAnimated = false;
    const wait = (ms) => new Promise(r => setTimeout(r, ms));

    const typeText = async (text, speed = 65, reverse = false) => {
      if (reverse) {
        for (let i = text.length; i >= 0; i--) {
          searchText.textContent = text.substring(0, i);
          await wait(speed);
        }
      } else {
        for (let i = 0; i <= text.length; i++) {
          searchText.textContent = text.substring(0, i);
          await wait(speed);
        }
      }
    };

    const runSearchAnimation = async () => {
      // 1. Fade in circle
      searchBar.classList.add('is-visible');
      await wait(300);

      // 2. Expand horizontally
      searchBar.classList.add('is-expanded');
      await wait(500);

      // 3. Show cursor, type text
      searchCursor.classList.add('is-blinking');
      const text1 = 'best chiropractor near me';
      await typeText(text1, 65);

      // 4. Cursor blinks twice (0.5s each blink = 1s total approx)
      await wait(1000);

      // 5. Text clears
      await typeText(text1, 30, true);

      // 6. Retypes
      const text2 = 'chiropractor near me';
      await typeText(text2, 65);

      // 7. Cursor blinks once then stops — final state holds
      await wait(500);
      searchCursor.classList.remove('is-blinking');
      searchCursor.classList.add('is-solid');
    };

    const searchObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          runSearchAnimation();
          searchObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    searchObserver.observe(painSection);
  }

  // 7. Cinematic Section 7 Text Animation Setup
  const setupCinematicText = () => {
    const wrapper = document.querySelector('.cinematic-wrapper');
    const phrase = document.querySelector('.cinematic-phrase');
    const section = document.getElementById('re-agitate');
    if (!wrapper || !phrase || !section) return;

    const sectionRect = section.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();

    // Center of the section on horizontal axis:
    const sectionCenterX = sectionRect.width / 2;

    // Center of the wrapper relative to the section:
    const wrapperCenterX = wrapperRect.left - sectionRect.left + wrapperRect.width / 2;

    const translateX = sectionCenterX - wrapperCenterX;

    phrase.style.setProperty('--start-x', `${translateX}px`);
  };

  // Run setup
  window.addEventListener('load', setupCinematicText);
  window.addEventListener('resize', setupCinematicText);
  setupCinematicText();

});

if (window.innerWidth <= 768) {
  document.querySelectorAll('.proof-card-new').forEach(card => {
    card.addEventListener('touchstart', function() {
      this.classList.add('touch-active');
      setTimeout(() => this.classList.remove('touch-active'), 600);
    }, { passive: true });
  });
}

