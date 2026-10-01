/* Application entry point. Site content and business details live in config.js. */
const { company, slides = [], fieldSpecialists = [] } = window.SITE_CONFIG;

class SiteBrand {
  constructor(config) { this.config = config; }

  init() {
    const { name, descriptor, logoMark, shortDescription, metaDescription, pageTitleTemplate, copyrightName, hoursDisplay, hours } = this.config;
    document.title = pageTitleTemplate
      ? pageTitleTemplate.replaceAll('{name}', name)
      : `${name} | ${descriptor}`;

    const description = document.querySelector('[data-site-description]');
    if (description) description.content = metaDescription || shortDescription || '';

    document.querySelectorAll('.brand-copy').forEach(element => {
      const descriptorElement = element.querySelector('small') || document.createElement('small');
      element.replaceChildren(document.createTextNode(name), descriptorElement);
      descriptorElement.textContent = descriptor;
    });

    const mark = logoMark || name.charAt(0);
    document.querySelectorAll('.brand-mark, .visual-label>span').forEach(element => {
      const textNode = [...element.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
      if (textNode) textNode.nodeValue = mark;
    });
    document.querySelectorAll('a.brand').forEach(element => element.setAttribute('aria-label', `${name}, inicio`));

    this.setText('.visual-label strong', this.config.visualLabelTitle || name);
    this.setText('.visual-label small', this.config.visualLabelText || descriptor);
    this.setText('[data-company-description]', shortDescription || descriptor);
    this.setText('[data-phone-text]', this.config.phoneDisplay);
    this.setText('[data-email-text]', this.config.email);
    this.setText('[data-address]', this.config.address);
    this.setText('[data-hours]', hoursDisplay || hours);

    document.querySelectorAll('[data-phone]').forEach(element => { element.href = `tel:${this.config.phoneE164}`; });
    document.querySelectorAll('[data-email]').forEach(element => { element.href = `mailto:${this.config.email}`; });
    document.querySelectorAll('[data-whatsapp]').forEach(element => {
      element.href = `https://wa.me/${this.config.whatsapp}`;
      element.target = '_blank';
      element.rel = 'noopener noreferrer';
    });

    const copyright = document.querySelector('[data-copyright]');
    if (copyright) copyright.textContent = `© ${new Date().getFullYear()} ${copyrightName || name}. Todos los derechos reservados.`;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) themeColor.content = '#092a32';
  }

  setText(selector, value) {
    if (!value) return;
    document.querySelectorAll(selector).forEach(element => { element.textContent = value; });
  }
}

class FieldTeam {
  constructor(people) { this.people = people; }

  init() {
    const grid = document.querySelector('#field-specialists');
    if (!grid) return;

    this.people.forEach(person => {
      const card = document.createElement('article');
      card.className = 'field-specialist';

      const photo = document.createElement('img');
      photo.src = person.image;
      photo.alt = person.alt || person.name;
      photo.loading = 'lazy';

      const details = document.createElement('div');
      details.className = 'field-specialist-info';
      details.append(
        this.createTextElement('h3', person.name),
        this.createTextElement('p', person.role, 'field-specialist-role'),
        this.createTextElement('p', person.specialty, 'field-specialist-specialty')
      );
      card.append(photo, details);
      grid.append(card);
    });
  }

  createTextElement(tag, text, className = '') {
    const element = document.createElement(tag);
    element.textContent = text || '';
    if (className) element.className = className;
    return element;
  }
}

class MobileNavigation {
  init() {
    const button = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    if (!button || !nav) return;

    button.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', String(isOpen));
      button.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Abrir menú');
    }));
  }
}

class HeroCarousel {
  constructor(slides) {
    this.slides = slides;
    this.root = document.querySelector('.hero');
    this.image = document.querySelector('.hero-image');
    this.dots = document.querySelector('.slide-dots');
    this.counter = document.querySelector('.slide-count');
    this.pauseButton = document.querySelector('.slide-pause');
    this.activeIndex = 0;
    this.timer = null;
    this.isPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  init() {
    if (!this.root || !this.image || !this.slides.length || !this.dots) return;
    this.createDots();
    document.querySelector('.slide-prev')?.addEventListener('click', () => this.goTo(this.activeIndex - 1));
    document.querySelector('.slide-next')?.addEventListener('click', () => this.goTo(this.activeIndex + 1));
    this.pauseButton?.addEventListener('click', () => this.togglePause());
    this.root.addEventListener('mouseenter', () => this.stopTimer());
    this.root.addEventListener('mouseleave', () => this.startTimer());
    this.root.addEventListener('focusin', () => this.stopTimer());
    this.root.addEventListener('focusout', () => this.startTimer());
    this.show(0);
    this.startTimer();
  }

  createDots() {
    this.slides.forEach((slide, index) => {
      const dot = document.createElement('button');
      dot.className = 'slide-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Mostrar diapositiva ${index + 1}`);
      dot.addEventListener('click', () => this.goTo(index));
      this.dots.append(dot);
    });
  }

  goTo(index) {
    this.show(index);
    this.startTimer();
  }

  show(index) {
    this.activeIndex = (index + this.slides.length) % this.slides.length;
    const slide = this.slides[this.activeIndex];
    this.image.style.backgroundImage = `url("${slide.image}")`;
    this.image.setAttribute('aria-label', slide.alt || slide.kicker);
    this.setText('.slide-kicker', slide.kicker);
    const title = document.querySelector('.slide-title');
    if (title) title.innerHTML = slide.title;
    this.setText('.slide-description', slide.description);

    if (this.counter) {
      this.counter.innerHTML = `${String(this.activeIndex + 1).padStart(2, '0')} <i></i> ${String(this.slides.length).padStart(2, '0')}`;
    }
    [...this.dots.children].forEach((dot, index) => {
      const isActive = index === this.activeIndex;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-current', String(isActive));
    });

    this.root.classList.remove('slide-enter');
    void this.root.offsetWidth;
    this.root.classList.add('slide-enter');
  }

  setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.textContent = value || '';
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    this.pauseButton.setAttribute('aria-label', this.isPaused ? 'Reanudar presentación' : 'Pausar presentación');
    this.pauseButton.setAttribute('aria-pressed', String(this.isPaused));
    this.startTimer();
  }

  startTimer() {
    this.stopTimer();
    if (!this.isPaused) this.timer = window.setInterval(() => this.show(this.activeIndex + 1), 5000);
  }

  stopTimer() {
    window.clearInterval(this.timer);
    this.timer = null;
  }
}

class ProjectGallery {
  init() {
    const lightbox = document.querySelector('.lightbox');
    if (!lightbox) return;

    document.querySelectorAll('.project[data-image]').forEach(project => project.addEventListener('click', () => {
      const image = lightbox.querySelector('img');
      image.src = project.dataset.image;
      image.alt = project.dataset.title || '';
      lightbox.querySelector('p').textContent = project.dataset.title || '';
      lightbox.showModal();
    }));
    lightbox.querySelector('.lightbox-close')?.addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  }
}

class QuoteForm {
  constructor(whatsapp) { this.whatsapp = whatsapp; }

  init() {
    const form = document.querySelector('#quote-form');
    if (!form) return;

    form.addEventListener('submit', event => {
      event.preventDefault();
      const fields = new FormData(form);
      const message = [
        `Hola, quiero solicitar una cotización para ${fields.get('service')}.`,
        `Nombre: ${fields.get('name')}`,
        `Teléfono: ${fields.get('phone')}`,
        `Correo: ${fields.get('email')}`,
        `Proyecto: ${fields.get('message')}`
      ].join('\n');

      const status = form.querySelector('.form-status');
      if (status) status.textContent = 'Abriendo WhatsApp con tu solicitud preparada.';
      window.open(`https://wa.me/${this.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    });
  }
}

class ScrollEffects {
  init() {
    this.initHeader();
    this.initActiveNavigation();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.initRevealAnimations();
  }

  initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  initRevealAnimations() {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }), { threshold: 0.12 });

    document.querySelectorAll('.section-heading,.service-card,.why-visual,.why-copy,.project,.step,.business-copy,.business-side,.testimonial,.contact-form,.client-list>div,.field-specialist')
      .forEach(element => { element.classList.add('reveal'); observer.observe(element); });
  }

  initActiveNavigation() {
    if (!('IntersectionObserver' in window)) return;
    const links = [...document.querySelectorAll('.nav a[href^="#"]')]
      .map(link => ({ link, section: document.querySelector(link.getAttribute('href')) }))
      .filter(item => item.section && item.section.id !== 'inicio');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(({ link, section }) => {
        const isActive = section === entry.target;
        link.classList.toggle('is-active', isActive);
        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }), { rootMargin: '-24% 0px -65% 0px' });
    links.forEach(({ section }) => observer.observe(section));
  }
}

class LandingPage {
  init() {
    new SiteBrand(company).init();
    new FieldTeam(fieldSpecialists).init();
    new MobileNavigation().init();
    new HeroCarousel(slides).init();
    new ProjectGallery().init();
    new QuoteForm(company.whatsapp).init();
    new ScrollEffects().init();
  }
}

new LandingPage().init();
