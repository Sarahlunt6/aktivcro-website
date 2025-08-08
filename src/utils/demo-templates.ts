import type { BusinessInfo, GeneratedContent } from './ai-content-generator';

export interface DemoTemplate {
  html: string;
  css: string;
}

export function generateAuthorityFrameworkDemo(
  businessInfo: BusinessInfo,
  content: GeneratedContent,
  primaryColor = '#20466f',
  secondaryColor = '#ffd147'
): DemoTemplate {
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.heroHeadline} - ${businessInfo.businessName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    ${generateAuthorityCSS(primaryColor, secondaryColor)}
  </style>
</head>
<body>
  <!-- Header -->
  <header class="header">
    <div class="container">
      <div class="nav-brand">
        <h1 class="logo">${businessInfo.businessName}</h1>
      </div>
      <nav class="nav-menu">
        <a href="#services">Services</a>
        <a href="#tools">Tools</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
        <button class="cta-button">${content.ctaText}</button>
      </nav>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="hero">
    <div class="container">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-headline">${content.heroHeadline}</h1>
          <p class="hero-subheadline">${content.heroSubheadline}</p>
          <p class="value-proposition">${content.valueProposition}</p>
          
          <div class="hero-actions">
            <button class="cta-primary">${content.ctaText}</button>
            <button class="cta-secondary">Learn More</button>
          </div>

          <!-- Trust Elements -->
          <div class="trust-elements">
            ${content.trustElements.map(element => `<span class="trust-item">✓ ${element}</span>`).join('')}
          </div>
        </div>
        
        <div class="hero-image">
          <div class="placeholder-image">
            <div class="image-placeholder">
              <span>Professional ${businessInfo.industryName} Services</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Services Section -->
  <section id="services" class="services">
    <div class="container">
      <h2 class="section-title">Our Expert Services</h2>
      <p class="section-subtitle">Delivering excellence in ${businessInfo.industryName.toLowerCase()}</p>
      
      <div class="services-grid">
        ${content.servicesContent.map((service, index) => `
        <div class="service-card">
          <div class="service-icon">
            <div class="icon-placeholder">${index + 1}</div>
          </div>
          <h3 class="service-title">${service.title}</h3>
          <p class="service-description">${service.description}</p>
          <a href="#contact" class="service-link">Learn More →</a>
        </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- Micro-Experiences Section -->
  <section id="tools" class="micro-experiences">
    <div class="container">
      <h2 class="section-title">Interactive Tools</h2>
      <p class="section-subtitle">Try our conversion-optimized micro-experiences</p>
      
      <div class="micro-grid">
        ${businessInfo.microExperiences.map((experience, index) => {
          const experienceData = getMicroExperienceData(experience);
          return `
        <div class="micro-card">
          <div class="micro-icon">
            <div class="icon-placeholder">${experienceData.icon}</div>
          </div>
          <h3 class="micro-title">${experienceData.title}</h3>
          <p class="micro-description">${experienceData.description}</p>
          <div class="micro-widget">
            ${experienceData.widget}
          </div>
        </div>
          `;
        }).join('')}
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section id="about" class="about">
    <div class="container">
      <div class="about-content">
        <div class="about-text">
          <h2 class="section-title">Why Choose ${businessInfo.businessName}?</h2>
          <p class="about-description">${content.aboutText}</p>
          
          <div class="credentials">
            <div class="credential-item">
              <div class="credential-number">15+</div>
              <div class="credential-label">Years Experience</div>
            </div>
            <div class="credential-item">
              <div class="credential-number">500+</div>
              <div class="credential-label">Satisfied Clients</div>
            </div>
            <div class="credential-item">
              <div class="credential-number">98%</div>
              <div class="credential-label">Success Rate</div>
            </div>
          </div>
        </div>
        
        <div class="about-image">
          <div class="placeholder-image">
            <div class="image-placeholder">
              <span>About ${businessInfo.businessName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Contact Section -->
  <section id="contact" class="contact">
    <div class="container">
      <div class="contact-content">
        <div class="contact-info">
          <h2 class="section-title">Ready to Get Started?</h2>
          <p class="contact-description">Contact us today to discuss your ${businessInfo.industryName.toLowerCase()} needs.</p>
          
          <div class="contact-methods">
            <div class="contact-method">
              <div class="contact-icon">📞</div>
              <div class="contact-details">
                <div class="contact-label">Phone</div>
                <div class="contact-value">(555) 123-BUSINESS</div>
              </div>
            </div>
            <div class="contact-method">
              <div class="contact-icon">📧</div>
              <div class="contact-details">
                <div class="contact-label">Email</div>
                <div class="contact-value">hello@${businessInfo.businessName.toLowerCase().replace(/\s+/g, '')}.com</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="contact-form">
          <form class="form">
            <div class="form-group">
              <input type="text" placeholder="Your Name" class="form-input" required>
            </div>
            <div class="form-group">
              <input type="email" placeholder="Your Email" class="form-input" required>
            </div>
            <div class="form-group">
              <input type="tel" placeholder="Your Phone" class="form-input">
            </div>
            <div class="form-group">
              <textarea placeholder="How can we help you?" class="form-textarea" rows="4"></textarea>
            </div>
            <button type="submit" class="cta-primary full-width">${content.ctaText}</button>
          </form>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-brand">
          <h3 class="logo">${businessInfo.businessName}</h3>
          <p>Professional ${businessInfo.industryName.toLowerCase()} services you can trust.</p>
        </div>
        <div class="footer-links">
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="#">Privacy Policy</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${businessInfo.businessName}. All rights reserved.</p>
        <p class="demo-watermark">Demo created by AktivCRO</p>
      </div>
    </div>
  </footer>

  <script>
    // Simple smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Form submission
    document.querySelector('.form').addEventListener('submit', function(e) {
      e.preventDefault();
      alert('This is a demo - form submission is not active. Contact ' + '${businessInfo.businessName}' + ' directly to get started!');
    });

    // CTA button clicks
    document.querySelectorAll('.cta-primary, .cta-button').forEach(button => {
      button.addEventListener('click', function(e) {
        if (!this.closest('form')) {
          e.preventDefault();
          alert('This is a demo - contact ${businessInfo.businessName} directly to get started!');
        }
      });
    });

    // Micro-experience widget functions
    let selectedOption = null;

    function selectOption(element, value) {
      // Remove selected class from siblings
      element.parentNode.querySelectorAll('.widget-option').forEach(option => {
        option.classList.remove('selected');
      });
      
      // Add selected class to clicked element
      element.classList.add('selected');
      selectedOption = value;
      
      // Force the element to maintain selected state
      setTimeout(() => {
        element.classList.add('selected');
      }, 10);
    }

    function evaluateCase() {
      const input = document.getElementById('case-input');
      const result = document.getElementById('case-result');
      if (input && input.value.trim()) {
        result.style.display = 'block';
        result.textContent = 'Based on your case details, this shows strong potential. We recommend scheduling a consultation to discuss strategy.';
      } else {
        alert('Please provide some case details first.');
      }
    }

    function scheduleConsult() {
      const email = document.getElementById('consult-email');
      const result = document.getElementById('consult-result');
      if (email && email.value.includes('@')) {
        result.style.display = 'block';
        result.textContent = \`Consultation scheduled! We'll contact you at \${email.value} within 24 hours to confirm details.\`;
      } else {
        alert('Please provide a valid email address.');
      }
    }

    function takeQuiz() {
      const result = document.getElementById('quiz-result');
      if (selectedOption) {
        result.style.display = 'block';
        const recommendations = {
          'startup': 'business formation and corporate law services',
          'dispute': 'litigation and dispute resolution services', 
          'planning': 'estate planning and asset protection services'
        };
        result.textContent = \`Based on your selection, we recommend our \${recommendations[selectedOption] || 'legal consultation services'}.\`;
      } else {
        alert('Please select an option first.');
      }
    }

    function getQuote() {
      const input = document.getElementById('quote-input');
      const result = document.getElementById('quote-result');
      if (input && input.value.trim()) {
        result.style.display = 'block';
        const estimates = {
          'small': '$300-$600',
          'medium': '$800-$1,500',
          'large': '$2,000-$5,000'
        };
        result.textContent = \`Estimated cost: \${estimates[selectedOption] || '$500-$1,200'}. Contact us for detailed pricing.\`;
      } else {
        alert('Please describe your project first.');
      }
    }

    function scheduleService() {
      const phone = document.getElementById('service-phone');
      const result = document.getElementById('service-result');
      if (phone && phone.value.trim()) {
        result.style.display = 'block';
        const timing = selectedOption === 'emergency' ? '30 minutes' : '2 hours';
        result.textContent = \`Service booked! We'll call you at \${phone.value} within \${timing} to confirm.\`;
      } else {
        alert('Please provide your phone number.');
      }
    }

    function checkArea() {
      const zip = document.getElementById('zip-input');
      const result = document.getElementById('area-result');
      if (zip && zip.value.length >= 5) {
        result.style.display = 'block';
        result.textContent = \`Great news! We service the \${zip.value} area and offer same-day appointments.\`;
      } else {
        alert('Please enter a valid ZIP code.');
      }
    }

    function calculateROI() {
      const revenue = document.getElementById('revenue-input');
      const result = document.getElementById('roi-result');
      if (revenue && revenue.value && selectedOption) {
        result.style.display = 'block';
        const monthly = parseInt(revenue.value);
        const growth = parseInt(selectedOption);
        const increase = Math.round(monthly * (growth / 100));
        const annual = increase * 12;
        result.textContent = \`Potential monthly increase: $\${increase.toLocaleString()}. Annual additional revenue: $\${annual.toLocaleString()}\`;
      } else {
        alert('Please enter your revenue and select a growth target.');
      }
    }

    function compareFeatures() {
      const result = document.getElementById('compare-result');
      if (selectedOption) {
        result.style.display = 'block';
        const recommendations = {
          'basic': 'Basic Plan: Perfect for getting started with essential features.',
          'pro': 'Pro Plan recommended: Best value with advanced features and priority support.',
          'enterprise': 'Enterprise Plan: Full feature access with dedicated account management.'
        };
        result.textContent = recommendations[selectedOption];
      } else {
        alert('Please select a plan to compare.');
      }
    }

    function requestDemo() {
      const company = document.getElementById('company-input');
      const result = document.getElementById('demo-result');
      if (company && company.value.trim()) {
        result.style.display = 'block';
        const demoTypes = {
          'live': 'Live demo scheduled for next week!',
          'recorded': 'Recorded demo link sent to your email!',
          'trial': 'Free trial account created - check your email!'
        };
        result.textContent = demoTypes[selectedOption] || 'Demo scheduled! Check your email for details.';
      } else {
        alert('Please enter your company name.');
      }
    }
  </script>
</body>
</html>
  `;

  return {
    html: html.trim(),
    css: generateAuthorityCSS(primaryColor, secondaryColor)
  };
}

function generateAuthorityCSS(primaryColor: string, secondaryColor: string): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Poppins', sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    /* Header */
    .header {
      background: #fff;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }

    .header .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 20px;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: ${primaryColor};
    }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .nav-menu a {
      text-decoration: none;
      color: #333;
      font-weight: 500;
      transition: color 0.3s;
    }

    .nav-menu a:hover {
      color: ${primaryColor};
    }

    .cta-button {
      background: ${primaryColor};
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 5px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .cta-button:hover {
      background: ${primaryColor}dd;
    }

    /* Hero Section */
    .hero {
      padding: 8rem 0 4rem;
      background: linear-gradient(135deg, ${primaryColor}08 0%, ${secondaryColor}15 100%);
    }

    .hero-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .hero-headline {
      font-size: 3rem;
      font-weight: 800;
      color: ${primaryColor};
      margin-bottom: 1rem;
      line-height: 1.2;
    }

    .hero-subheadline {
      font-size: 1.25rem;
      color: #666;
      margin-bottom: 1.5rem;
    }

    .value-proposition {
      font-size: 1.1rem;
      color: #555;
      margin-bottom: 2rem;
      font-weight: 500;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .cta-primary {
      background: ${primaryColor};
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .cta-primary:hover {
      background: ${primaryColor}dd;
      transform: translateY(-2px);
    }

    .cta-secondary {
      background: transparent;
      color: ${primaryColor};
      border: 2px solid ${primaryColor};
      padding: 1rem 2rem;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .cta-secondary:hover {
      background: ${primaryColor};
      color: white;
    }

    .trust-elements {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .trust-item {
      font-size: 0.9rem;
      color: #555;
      font-weight: 500;
    }

    .placeholder-image {
      width: 100%;
      height: 300px;
      background: linear-gradient(135deg, ${primaryColor}20 0%, ${secondaryColor}30 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${primaryColor};
      font-weight: 600;
      text-align: center;
    }

    .image-placeholder {
      padding: 2rem;
      border: 2px dashed ${primaryColor}50;
      border-radius: 8px;
      background: white;
    }

    /* Services Section */
    .services {
      padding: 5rem 0;
      background: #f8fafc;
    }

    /* Micro-Experiences Section */
    .micro-experiences {
      padding: 5rem 0;
      background: #fff;
    }

    .micro-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
    }

    .micro-card {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      padding: 2rem;
      border-radius: 12px;
      text-align: center;
      transition: all 0.3s;
    }

    .micro-card:hover {
      border-color: ${primaryColor};
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .micro-icon {
      margin-bottom: 1.5rem;
    }

    .micro-icon .icon-placeholder {
      width: 50px;
      height: 50px;
      background: ${primaryColor};
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin: 0 auto;
    }

    .micro-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: ${primaryColor};
      margin-bottom: 0.5rem;
    }

    .micro-description {
      color: #666;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }

    .micro-widget {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      border: 1px solid #e2e8f0;
    }

    .widget-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      background: #fafafa;
    }

    .widget-input:hover {
      border-color: ${primaryColor}80;
      background: white;
    }

    .widget-input:focus {
      outline: none;
      border-color: ${primaryColor};
      background: white;
      box-shadow: 0 0 0 3px ${primaryColor}20;
    }

    .widget-button {
      background: ${primaryColor};
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      width: 100%;
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .widget-button:hover {
      background: ${primaryColor}dd;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .widget-button:active {
      background: ${primaryColor}cc;
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .widget-result {
      margin-top: 1rem;
      padding: 1rem;
      background: #f0f9ff;
      border-radius: 6px;
      font-weight: 600;
      color: ${primaryColor};
      display: none;
    }

    .widget-options {
      display: grid;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .widget-option {
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      font-weight: 500;
      text-align: center;
      transform: translateY(0);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .widget-option:hover {
      border-color: ${primaryColor};
      background: ${primaryColor}15;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .widget-option.selected {
      border-color: ${primaryColor} !important;
      background: ${primaryColor} !important;
      color: white !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 3px 12px ${primaryColor}40 !important;
    }

    .widget-option.selected:hover {
      border-color: ${primaryColor} !important;
      background: ${primaryColor} !important;
      color: white !important;
      transform: translateY(-1px) !important;
      box-shadow: 0 4px 16px ${primaryColor}60 !important;
    }

    .widget-option:active {
      transform: translateY(0);
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .section-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: ${primaryColor};
      text-align: center;
      margin-bottom: 1rem;
    }

    .section-subtitle {
      font-size: 1.2rem;
      color: #666;
      text-align: center;
      margin-bottom: 3rem;
    }

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .service-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.3s;
    }

    .service-card:hover {
      transform: translateY(-5px);
    }

    .service-icon {
      margin-bottom: 1.5rem;
    }

    .icon-placeholder {
      width: 60px;
      height: 60px;
      background: ${primaryColor};
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 auto;
    }

    .service-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: ${primaryColor};
      margin-bottom: 1rem;
    }

    .service-description {
      color: #666;
      margin-bottom: 1.5rem;
    }

    .service-link {
      color: ${primaryColor};
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s;
    }

    .service-link:hover {
      color: ${primaryColor}dd;
    }

    /* About Section */
    .about {
      padding: 5rem 0;
    }

    .about-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    .about-description {
      font-size: 1.1rem;
      color: #666;
      margin-bottom: 2rem;
    }

    .credentials {
      display: flex;
      gap: 2rem;
    }

    .credential-item {
      text-align: center;
    }

    .credential-number {
      font-size: 2rem;
      font-weight: 800;
      color: ${primaryColor};
    }

    .credential-label {
      font-size: 0.9rem;
      color: #666;
      font-weight: 500;
    }

    /* Contact Section */
    .contact {
      padding: 5rem 0;
      background: linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}ee 100%);
      color: white;
    }

    .contact .section-title,
    .contact-description {
      color: white;
    }

    .contact-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: start;
    }

    .contact-methods {
      margin-top: 2rem;
    }

    .contact-method {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .contact-icon {
      font-size: 1.5rem;
    }

    .contact-label {
      font-size: 0.9rem;
      opacity: 0.8;
    }

    .contact-value {
      font-weight: 600;
    }

    .form {
      background: white;
      padding: 2rem;
      border-radius: 12px;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-input,
    .form-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .form-input:focus,
    .form-textarea:focus {
      outline: none;
      border-color: ${primaryColor};
    }

    .full-width {
      width: 100%;
    }

    /* Footer */
    .footer {
      background: #1f2937;
      color: white;
      padding: 3rem 0 1rem;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 2rem;
    }

    .footer-brand h3 {
      color: ${secondaryColor};
      margin-bottom: 0.5rem;
    }

    .footer-links {
      display: flex;
      gap: 2rem;
    }

    .footer-links a {
      color: #d1d5db;
      text-decoration: none;
      transition: color 0.3s;
    }

    .footer-links a:hover {
      color: ${secondaryColor};
    }

    .footer-bottom {
      border-top: 1px solid #374151;
      padding-top: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
      color: #9ca3af;
    }

    .demo-watermark {
      font-style: italic;
      opacity: 0.7;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .nav-menu {
        gap: 1rem;
      }

      .nav-menu a {
        display: none;
      }

      .hero-content,
      .about-content,
      .contact-content {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .hero-headline {
        font-size: 2rem;
      }

      .credentials {
        justify-content: space-around;
      }

      .footer-content {
        flex-direction: column;
        gap: 2rem;
      }

      .footer-bottom {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
    }
  `;
}

// Micro-experience data and widgets
function getMicroExperienceData(experience: string) {
  const experiences: Record<string, any> = {
    'case-evaluator': {
      title: 'Free Case Evaluation',
      description: 'Get an instant assessment of your legal case potential',
      icon: '⚖️',
      widget: `
        <div class="widget-options">
          <div class="widget-option" onclick="selectOption(this, 'personal-injury')">Personal Injury</div>
          <div class="widget-option" onclick="selectOption(this, 'business-law')">Business Law</div>
          <div class="widget-option" onclick="selectOption(this, 'family-law')">Family Law</div>
        </div>
        <input type="text" placeholder="Brief case description..." class="widget-input" id="case-input">
        <button class="widget-button" onclick="evaluateCase()">Evaluate Case</button>
        <div class="widget-result" id="case-result">Based on your input, this case shows strong potential. Contact us for a detailed consultation.</div>
      `
    },
    'consultation-scheduler': {
      title: 'Schedule Consultation',
      description: 'Book your free consultation in just a few clicks',
      icon: '📅',
      widget: `
        <div class="widget-options">
          <div class="widget-option" onclick="selectOption(this, 'phone')">Phone Call</div>
          <div class="widget-option" onclick="selectOption(this, 'video')">Video Meeting</div>
          <div class="widget-option" onclick="selectOption(this, 'office')">In-Person</div>
        </div>
        <input type="email" placeholder="Your email..." class="widget-input" id="consult-email">
        <button class="widget-button" onclick="scheduleConsult()">Schedule Now</button>
        <div class="widget-result" id="consult-result">Great! We'll contact you within 24 hours to confirm your consultation.</div>
      `
    },
    'expertise-quiz': {
      title: 'Legal Expertise Quiz',
      description: 'Discover which legal services you might need',
      icon: '🧠',
      widget: `
        <div class="widget-options">
          <div class="widget-option" onclick="selectOption(this, 'startup')">Starting a Business</div>
          <div class="widget-option" onclick="selectOption(this, 'dispute')">Legal Dispute</div>
          <div class="widget-option" onclick="selectOption(this, 'planning')">Estate Planning</div>
        </div>
        <button class="widget-button" onclick="takeQuiz()">Get Recommendations</button>
        <div class="widget-result" id="quiz-result">Based on your selection, we recommend our business formation services.</div>
      `
    },
    'instant-quote': {
      title: 'Instant Service Quote',
      description: 'Get pricing for your project in seconds',
      icon: '💰',
      widget: `
        <div class="widget-options">
          <div class="widget-option" onclick="selectOption(this, 'small')">Small Project</div>
          <div class="widget-option" onclick="selectOption(this, 'medium')">Medium Project</div>
          <div class="widget-option" onclick="selectOption(this, 'large')">Large Project</div>
        </div>
        <input type="text" placeholder="Project details..." class="widget-input" id="quote-input">
        <button class="widget-button" onclick="getQuote()">Get Quote</button>
        <div class="widget-result" id="quote-result">Estimated cost: $500-$800. Contact us for detailed pricing.</div>
      `
    },
    'service-scheduler': {
      title: 'Schedule Service',
      description: 'Book your service appointment online',
      icon: '📋',
      widget: `
        <div class="widget-options">
          <div class="widget-option" onclick="selectOption(this, 'emergency')">Emergency Service</div>
          <div class="widget-option" onclick="selectOption(this, 'routine')">Routine Service</div>
          <div class="widget-option" onclick="selectOption(this, 'consultation')">Consultation</div>
        </div>
        <input type="tel" placeholder="Your phone number..." class="widget-input" id="service-phone">
        <button class="widget-button" onclick="scheduleService()">Schedule Service</button>
        <div class="widget-result" id="service-result">Service booked! We'll call you within 2 hours to confirm.</div>
      `
    },
    'area-checker': {
      title: 'Service Area Check',
      description: 'See if we service your location',
      icon: '📍',
      widget: `
        <input type="text" placeholder="Enter your ZIP code..." class="widget-input" id="zip-input">
        <button class="widget-button" onclick="checkArea()">Check Coverage</button>
        <div class="widget-result" id="area-result">Great news! We service your area and offer same-day appointments.</div>
      `
    },
    'roi-calculator': {
      title: 'ROI Calculator',
      description: 'Calculate your potential return on investment',
      icon: '📊',
      widget: `
        <input type="number" placeholder="Current monthly revenue..." class="widget-input" id="revenue-input">
        <div class="widget-options">
          <div class="widget-option" onclick="selectOption(this, '10')">10% Growth Target</div>
          <div class="widget-option" onclick="selectOption(this, '25')">25% Growth Target</div>
          <div class="widget-option" onclick="selectOption(this, '50')">50% Growth Target</div>
        </div>
        <button class="widget-button" onclick="calculateROI()">Calculate ROI</button>
        <div class="widget-result" id="roi-result">Potential monthly increase: $2,500. Annual ROI: 300%</div>
      `
    },
    'feature-comparison': {
      title: 'Feature Comparison',
      description: 'Compare our plans and find what fits you',
      icon: '⚡',
      widget: `
        <div class="widget-options">
          <div class="widget-option" onclick="selectOption(this, 'basic')">Basic Plan</div>
          <div class="widget-option" onclick="selectOption(this, 'pro')">Pro Plan</div>
          <div class="widget-option" onclick="selectOption(this, 'enterprise')">Enterprise</div>
        </div>
        <button class="widget-button" onclick="compareFeatures()">Compare Plans</button>
        <div class="widget-result" id="compare-result">Pro Plan recommended: Best value with advanced features included.</div>
      `
    },
    'demo-request': {
      title: 'Request Demo',
      description: 'Get a personalized product demonstration',
      icon: '🎬',
      widget: `
        <input type="text" placeholder="Your company name..." class="widget-input" id="company-input">
        <div class="widget-options">
          <div class="widget-option" onclick="selectOption(this, 'live')">Live Demo</div>
          <div class="widget-option" onclick="selectOption(this, 'recorded')">Recorded Demo</div>
          <div class="widget-option" onclick="selectOption(this, 'trial')">Free Trial</div>
        </div>
        <button class="widget-button" onclick="requestDemo()">Request Demo</button>
        <div class="widget-result" id="demo-result">Demo scheduled! Check your email for meeting details.</div>
      `
    }
  };

  return experiences[experience] || {
    title: 'Interactive Tool',
    description: 'Engage with our conversion-optimized experience',
    icon: '🔧',
    widget: `
      <input type="text" placeholder="Enter your details..." class="widget-input">
      <button class="widget-button" onclick="alert('This is a demo widget!')">Try Now</button>
    `
  };
}

export function generateDemoTemplate(
  businessInfo: BusinessInfo,
  content: GeneratedContent,
  primaryColor?: string,
  secondaryColor?: string
): DemoTemplate {
  // For now, we only have Authority Framework
  // Will add other frameworks later
  switch (businessInfo.framework) {
    case 'authority':
    default:
      return generateAuthorityFrameworkDemo(businessInfo, content, primaryColor, secondaryColor);
  }
}