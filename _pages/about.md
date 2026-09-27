---
permalink: /
layout: home
title: ""
excerpt: "Computer vision researcher at Jilin University working on object detection, multimodal RGB-T vision, and adverse-weather perception."
homepage: true
author_profile: false
redirect_from:
  - /about/
  - /about.html
---

<section id="home" class="profile-hero section-anchor" aria-labelledby="profile-name">
  <div class="profile-hero__portrait-wrap">
    <div class="profile-hero__portrait-frame">
      <img class="profile-hero__portrait"
           src="{{ site.author.avatar | relative_url }}"
           alt="Portrait of Tianle Fang"
           width="310"
           height="310"
           fetchpriority="high">
    </div>
    <span class="profile-hero__status"><span aria-hidden="true"></span> Computer Vision</span>
  </div>

  <div class="profile-hero__content">
    <p class="profile-hero__eyebrow">Academic Homepage</p>
    <h1 id="profile-name" itemprop="name">Tianle Fang</h1>
    <p class="profile-hero__affiliation" itemprop="affiliation">Jilin University</p>
    <p class="profile-hero__label">Research interests</p>
    <ul class="research-interests" aria-label="Research interests">
      <li>Object Detection</li>
      <li>Multimodal RGB-T Vision</li>
      <li>Object Detection in Adverse Weather</li>
      <li>Deep Learning</li>
    </ul>

    <div class="profile-links" aria-label="Academic profiles and contact">
      {% if site.author.googlescholar %}
        <a href="{{ site.author.googlescholar }}" target="_blank" rel="noopener noreferrer">
          <i class="fas fa-graduation-cap" aria-hidden="true"></i> Google Scholar
        </a>
      {% endif %}
      {% if site.author.github %}
        <a href="https://github.com/{{ site.author.github }}" target="_blank" rel="noopener noreferrer">
          <i class="fab fa-github" aria-hidden="true"></i> GitHub
        </a>
      {% endif %}
      {% if site.author.email %}
        <a href="mailto:{{ site.author.email }}">
          <i class="fas fa-envelope" aria-hidden="true"></i> Email
        </a>
      {% endif %}
    </div>
  </div>
</section>

<section id="about" class="academic-section section-anchor" aria-labelledby="about-heading">
  <header class="section-heading">
    <span class="section-heading__index" aria-hidden="true">01</span>
    <h2 id="about-heading">About Me</h2>
  </header>
  <p class="section-lead">I am currently pursuing a Ph.D. at Jilin University. My research focus has evolved from remote sensing object detection during my undergraduate studies to object detection in adverse weather conditions during my master's program, and now to multimodal object detection for my doctoral research. My hobbies include cycling🏍️, photography📷, reading📖, and playing badminton🏸.</p>
</section>

<section id="news" class="academic-section section-anchor" aria-labelledby="news-heading">
  <header class="section-heading">
    <span class="section-heading__index" aria-hidden="true">02</span>
    <h2 id="news-heading">News</h2>
  </header>
  <ol class="news-list">
    <li><time datetime="2026-06">2026.06</time><span><span class="news-list__celebration" aria-hidden="true">✦</span> One ACM MM paper accepted.</span></li>
    <li><time datetime="2025-07">2025.07</time><span><span class="news-list__celebration" aria-hidden="true">✦</span> One KBS paper accepted.</span></li>
    <li><time datetime="2025-05">2025.05</time><span><span class="news-list__celebration" aria-hidden="true">✦</span> One ICME paper accepted.</span></li>
    <li><time datetime="2025-04">2025.04</time><span><span class="news-list__celebration" aria-hidden="true">✦</span> One TGRS paper accepted.</span></li>
  </ol>
</section>

<section id="experience" class="academic-section section-anchor" aria-labelledby="experience-heading">
  <header class="section-heading">
    <span class="section-heading__index" aria-hidden="true">03</span>
    <h2 id="experience-heading">Experience &amp; Education</h2>
  </header>
  <ol class="timeline">
    <li>
      <div class="timeline__period">2026.09 – Present</div>
      <div class="timeline__content">
        <h3>Jilin University</h3>
        <p>College of Computer Science and Technology</p>
      </div>
    </li>
    <li>
      <div class="timeline__period">2019.09 – 2023.06</div>
      <div class="timeline__content">
        <h3>Luoyang Normal University</h3>
        <p>Bachelor of Engineering in Software Engineering</p>
        <p>Bachelor of Science in Applied Psychology <span class="degree-note">Second Bachelor's Degree</span></p>
      </div>
    </li>
  </ol>
</section>

<section id="publications" class="academic-section publications-section section-anchor" aria-labelledby="publications-heading">
  <header class="section-heading">
    <span class="section-heading__index" aria-hidden="true">04</span>
    <div>
      <h2 id="publications-heading">Selected Publications</h2>
      <p>Research in robust object detection and image enhancement.</p>
    </div>
  </header>

  <div class="publication-list">
    <article class="publication-row">
      <div class="publication-row__media">
        <span class="venue-badge">MM 2026</span>
        <img src="{{ '/images/C2FXNet.png' | relative_url }}" alt="C2FXNet method overview" loading="lazy" decoding="async">
      </div>
      <div class="publication-row__body">
        <h3>C2FXNet: Coarse-to-Fine Scene Expert for Unified Object Detection across Adverse Weather</h3>
        <p class="publication-row__authors"><strong class="current-author">Tianle Fang</strong>, Zhenbing Liu, Chong Yin, Bolun Li, Haoxiang Lu</p>
        <p class="publication-row__venue">ACM International Conference on Multimedia (MM), 2026.</p>
        <div class="publication-links" aria-label="C2FXNet resources">
          <a href="https://arxiv.org/abs/2609.25693" target="_blank" rel="noopener noreferrer">PDF <span aria-hidden="true">↗</span></a>
          <a href="https://github.com/PolarisFTL/C2FXNet" target="_blank" rel="noopener noreferrer">Code <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </article>

    <article class="publication-row">
      <div class="publication-row__media">
        <span class="venue-badge">TGRS 2025</span>
        <img src="{{ '/images/MASFNet.png' | relative_url }}" alt="MASFNet method overview" loading="lazy" decoding="async">
      </div>
      <div class="publication-row__body">
        <h3>MASFNet: Multiscale Adaptive Sampling Fusion Network for Object Detection in Adverse Weather</h3>
        <p class="publication-row__authors">Zhenbing Liu, <strong class="current-author">Tianle Fang</strong>, Haoxiang Lu, Weidong Zhang, Rushi Lan</p>
        <p class="publication-row__venue">IEEE Transactions on Geoscience and Remote Sensing (TGRS), 2025.</p>
        <div class="publication-links" aria-label="MASFNet resources">
          <a href="https://ieeexplore.ieee.org/document/10955257" target="_blank" rel="noopener noreferrer">PDF <span aria-hidden="true">↗</span></a>
          <a href="https://github.com/PolarisFTL/MASFNet" target="_blank" rel="noopener noreferrer">Code <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </article>

    <article class="publication-row">
      <div class="publication-row__media">
        <span class="venue-badge">ICME 2025 · Oral</span>
        <img src="{{ '/images/RDFNet.png' | relative_url }}" alt="RDFNet method overview" loading="lazy" decoding="async">
      </div>
      <div class="publication-row__body">
        <h3>RDFNet: Real-time Object Detection Framework for Foggy Scenes (Oral)</h3>
        <p class="publication-row__authors"><strong class="current-author">Tianle Fang</strong>, Zhenbing Liu, Yutao Tang, Yingxin Huang, Haoxiang Lu, Chuangtao Zheng</p>
        <p class="publication-row__venue">IEEE International Conference on Multimedia &amp; Expo 2025 (ICME), 2025.</p>
        <div class="publication-links" aria-label="RDFNet resources">
          <a href="https://ieeexplore.ieee.org/document/11209981" target="_blank" rel="noopener noreferrer">PDF <span aria-hidden="true">↗</span></a>
          <a href="https://github.com/PolarisFTL/RDFNet" target="_blank" rel="noopener noreferrer">Code <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </article>

    <article class="publication-row">
      <div class="publication-row__media">
        <span class="venue-badge">KBS 2025</span>
        <img src="{{ '/images/PSFM.png' | relative_url }}" alt="PSFM method overview" loading="lazy" decoding="async">
      </div>
      <div class="publication-row__body">
        <h3>Perceptual stretch and multi-feature fusion for enhancing nighttime images</h3>
        <p class="publication-row__authors">Haoxiang Lu, <strong class="current-author">Tianle Fang</strong>, Zhenbing Liu, Weidong Zhang, Rushi Lan</p>
        <p class="publication-row__venue">Knowledge-Based Systems (KBS), 2025.</p>
        <div class="publication-links" aria-label="PSFM resources">
          <a href="https://www.sciencedirect.com/science/article/pii/S0950705125011189" target="_blank" rel="noopener noreferrer">PDF <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </article>
  </div>
</section>

<section id="awards" class="academic-section section-anchor" aria-labelledby="awards-heading">
  <header class="section-heading">
    <span class="section-heading__index" aria-hidden="true">05</span>
    <h2 id="awards-heading">Honors &amp; Awards</h2>
  </header>
  <ul class="award-list">
    <li>
      <time datetime="2025-05">2025.05</time>
      <span><strong>Student Travel Award</strong><small>ICME 2025</small></span>
    </li>
  </ul>
</section>

<section id="services" class="academic-section section-anchor" aria-labelledby="services-heading">
  <header class="section-heading">
    <span class="section-heading__index" aria-hidden="true">06</span>
    <h2 id="services-heading">Academic Services</h2>
  </header>
  <div class="service-grid">
    <div class="service-group">
      <h3>Conference Reviewer</h3>
      <ul>
        <li><strong>CVPR</strong> <span>2026</span></li>
        <li><strong>AAAI</strong> <span>2026, 2027</span></li>
        <li><strong>ACM MM</strong> <span>2026</span></li>
        <li><strong>ICME</strong> <span>2025, 2026</span></li>
        <li><strong>ICIC</strong> <span>2025</span></li>
      </ul>
    </div>
    <div class="service-group">
      <h3>Journal Reviewer</h3>
      <ul>
        <li><strong>IEEE TCSVT</strong></li>
        <li><strong>IEEE TCE</strong></li>
        <li><strong>KBS</strong></li>
      </ul>
    </div>
  </div>
</section>
