/**
 * A LITTLE SOMETHING FOR YOU - CINEMATIC APOLOGY EXPERIENCE
 * Interactive Engine: Audio, Canvas Particles, Ken Burns Zoom, Typewriter & Interactive Particle Heart
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     1. AUDIO SYSTEM - OFFICIAL YOUTUBE PLAYER & FLOATING MUSIC DOCK
     Song: "Ishq De Fanniyar (Female Version)" by Jyotica Tangri (Fukrey Returns)
     ========================================================================== */
  const YT_VIDEO_ID = '7OGSeZP0sc8'; // Official Fukrey Returns track
  const SONG_START_SECONDS = 4.8;     // Skips intro dialogue / kissing sound effect
  let ytPlayer = null;
  let isYtReady = false;
  let isMusicPlaying = false;
  let hasSkippedIntro = false;
  let userWantsMusic = false;
  let audioContext = null;

  const audioToggleBtn = document.getElementById('audio-toggle');
  const audioStatusText = document.getElementById('audioStatusText');
  const floatingMusicDock = document.getElementById('floatingMusicDock');
  const floatingPlayBtn = document.getElementById('floatingPlayBtn');
  const dockBadgeText = document.getElementById('dockBadgeText');
  const dockCollapseBtn = document.getElementById('dockCollapseBtn');
  const vinylDiscWrap = document.getElementById('vinylDiscWrap');
  const volumeSlider = document.getElementById('volume-slider');

  // Initialize Web Audio Context for organic sound effects
  function initAudioContext() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioContext = new AudioCtx();
      }
    }
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  // Play gentle organic chime on button clicks
  function playChime(freq = 523.25, type = 'sine', duration = 0.8) {
    if (!audioContext) return;
    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);
      gain.gain.setValueAtTime(0.08, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + duration);
    } catch (e) {}
  }

  // Soft mechanical typing tick
  function playTypingTick() {
    if (!audioContext || !isMusicPlaying) return;
    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400 + Math.random() * 200, audioContext.currentTime);
      gain.gain.setValueAtTime(0.015, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start();
      osc.stop(audioContext.currentTime + 0.04);
    } catch (e) {}
  }

  // Synchronize All Visual Music Indicators
  function setMusicPlayingState(playing) {
    isMusicPlaying = playing;
    const heroAudioHintText = document.getElementById('heroAudioHintText');
    const heroAudioHint = document.getElementById('heroAudioHint');

    if (playing) {
      if (typeof window._cleanupAudioGestures === 'function') {
        window._cleanupAudioGestures();
      }
      if (floatingMusicDock) floatingMusicDock.classList.add('playing');
      if (audioToggleBtn) audioToggleBtn.classList.add('playing');
      if (audioStatusText) audioStatusText.textContent = 'Ishq De Fanniyar ♫';
      if (dockBadgeText) dockBadgeText.textContent = 'PLAYING';
      if (heroAudioHintText) heroAudioHintText.textContent = 'Playing: Ishq De Fanniyar ♫';
      if (heroAudioHint) heroAudioHint.classList.add('playing');
    } else {
      if (floatingMusicDock) floatingMusicDock.classList.remove('playing');
      if (audioToggleBtn) audioToggleBtn.classList.remove('playing');
      if (audioStatusText) audioStatusText.textContent = 'Music: Paused';
      if (dockBadgeText) dockBadgeText.textContent = 'PAUSED';
      if (heroAudioHintText) heroAudioHintText.textContent = 'Tap button or screen to begin with music ♫';
      if (heroAudioHint) heroAudioHint.classList.remove('playing');
    }
  }

  // Initialize YouTube IFrame Player with Instant Autoplay (Skipping Intro)
  window.onYouTubeIframeAPIReady = function() {
    try {
      ytPlayer = new YT.Player('youtube-player', {
        height: '200',
        width: '200',
        videoId: YT_VIDEO_ID,
        playerVars: {
          autoplay: 1,
          start: 5,
          controls: 0,
          disablekb: 1,
          fs: 0,
          loop: 1,
          playlist: YT_VIDEO_ID,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            isYtReady = true;
            const initialVol = volumeSlider ? Math.round(parseFloat(volumeSlider.value) * 100) : 80;
            try {
              event.target.setVolume(initialVol);
            } catch (e) {}
            console.log('✨ Official YouTube Embed ready: Ishq De Fanniyar');

            // Trigger autoplay immediately (if browser policy allows) or on pending user tap
            try {
              event.target.playVideo();
            } catch (err) {
              console.log('Direct autoplay waiting for first gesture:', err);
            }
          },
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.PLAYING) {
              setMusicPlayingState(true);
              // Cleanly skip intro dialogue / kissing sound effect on initial play
              if (!hasSkippedIntro) {
                hasSkippedIntro = true;
                try {
                  const curTime = (typeof event.target.getCurrentTime === 'function') ? event.target.getCurrentTime() : 0;
                  if (curTime < SONG_START_SECONDS) {
                    event.target.seekTo(SONG_START_SECONDS, true);
                  }
                } catch (e) {}
              }
            } else if (event.data === YT.PlayerState.PAUSED) {
              setMusicPlayingState(false);
            } else if (event.data === YT.PlayerState.ENDED) {
              // Seamless loop back to clean music start
              try {
                event.target.seekTo(SONG_START_SECONDS, true);
                event.target.playVideo();
              } catch (e) {}
            }
          },
          onError: (e) => {
            console.log('YouTube notice:', e);
          }
        }
      });
    } catch (err) {
      console.log('YouTube iframe init exception, fallback ready:', err);
    }
  };

  // If YouTube API script was already cached/loaded
  if (window.YT && window.YT.Player) {
    window.onYouTubeIframeAPIReady();
  }

  // Universal First Gesture Autoplay Trigger
  // Modern mobile browsers (iOS Safari & Chrome Android) require at least 1 user gesture before unmuted sound plays.
  // This triggers playback seamlessly on the very first touch, click, or tap anywhere on the screen!
  function setupUniversalAutoplay() {
    const triggerPlay = () => {
      userWantsMusic = true;
      initAudioContext();
      if (!isMusicPlaying) {
        playMusic();
      }
    };

    const gestureEvents = ['touchstart', 'touchend', 'pointerdown', 'click'];
    function cleanup() {
      gestureEvents.forEach(evt => {
        window.removeEventListener(evt, triggerPlay, { capture: true });
        window.removeEventListener(evt, triggerPlay, false);
      });
    }

    gestureEvents.forEach(evt => {
      window.addEventListener(evt, triggerPlay, { capture: true });
    });

    window._cleanupAudioGestures = cleanup;
  }

  setupUniversalAutoplay();

  // Play / Pause Master Controls - ONLY "Ishq De Fanniyar" (YouTube)
  function playMusic() {
    userWantsMusic = true;
    initAudioContext();
    if (isYtReady && ytPlayer && typeof ytPlayer.playVideo === 'function') {
      try {
        ytPlayer.playVideo();
        setMusicPlayingState(true);
      } catch (err) {
        console.log('YT playVideo notice:', err);
      }
    }
  }

  function pauseMusic() {
    if (isYtReady && ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
      try {
        ytPlayer.pauseVideo();
      } catch (e) {}
    }
    setMusicPlayingState(false);
  }

  function toggleMusic() {
    initAudioContext();
    if (isMusicPlaying) {
      pauseMusic();
      playChime(440, 'triangle', 0.2);
    } else {
      playMusic();
      playChime(659.25, 'sine', 0.4);
    }
  }

  // Bind Top-Bar Audio Button
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', toggleMusic);
  }

  // Bind Floating Dock Play Button
  if (floatingPlayBtn) {
    floatingPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMusic();
    });
  }

  // Bind Vinyl Disc Click
  if (vinylDiscWrap) {
    vinylDiscWrap.addEventListener('click', () => {
      toggleMusic();
    });
  }

  // Bind Dock Minimize / Expand
  if (dockCollapseBtn && floatingMusicDock) {
    dockCollapseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      floatingMusicDock.classList.toggle('collapsed');
      playChime(523.25, 'sine', 0.2);
    });
  }

  // Volume Slider Listener
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      if (isYtReady && ytPlayer && typeof ytPlayer.setVolume === 'function') {
        ytPlayer.setVolume(Math.round(vol * 100));
      }
    });
  }


  /* ==========================================================================
     2. NAVIGATION & SMOOTH SCROLLING
     ========================================================================== */
  const topNav = document.getElementById('topNav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      topNav.classList.add('scrolled');
    } else {
      topNav.classList.remove('scrolled');
    }

    // Active Section Tracking
    let currentSection = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSection = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-target') === currentSection) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetId = link.getAttribute('data-target');
      const targetSec = document.getElementById(targetId);
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });


  /* ==========================================================================
     3. OPENING SCREEN (BUTTON TRIGGER)
     ========================================================================== */
  const openSurpriseBtn = document.getElementById('open-surprise-btn');
  const eyesSection = document.getElementById('eyes-section');

  if (openSurpriseBtn) {
    const handleOpenSurprise = (e) => {
      userWantsMusic = true;
      initAudioContext();
      playChime(659.25, 'sine', 1.2); // E5 chord note
      if (!isMusicPlaying) {
        playMusic();
      }

      // Smooth scroll to Chapter 1
      if (eyesSection) {
        eyesSection.scrollIntoView({ behavior: 'smooth' });
      }
    };

    openSurpriseBtn.addEventListener('click', handleOpenSurprise);
    openSurpriseBtn.addEventListener('touchend', handleOpenSurprise);
  }


  /* ==========================================================================
     4. AMBIENT PARTICLES CANVAS (Floating Starlight & Glowing Embers)
     ========================================================================== */
  const ambientCanvas = document.getElementById('ambient-canvas');
  if (ambientCanvas) {
    const ctx = ambientCanvas.getContext('2d');
    let width = (ambientCanvas.width = window.innerWidth);
    let height = (ambientCanvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = ambientCanvas.width = window.innerWidth;
      height = ambientCanvas.height = window.innerHeight;
    }, { passive: true });

    class AmbientParticle {
      constructor() {
        this.reset(true);
      }
      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 20;
        this.size = Math.random() * 2.2 + 0.6;
        this.speedY = Math.random() * 0.45 + 0.15;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.alpha = Math.random() * 0.6 + 0.2;
        this.alphaChange = (Math.random() * 0.01 + 0.003) * (Math.random() > 0.5 ? 1 : -1);
        
        // Colors: Warm Gold, Soft Rose, Radiant Crimson
        const palette = [
          '251, 113, 133', // rose
          '225, 29, 72',   // crimson
          '251, 191, 36',  // gold
          '254, 205, 211'  // petal white-rose
        ];
        this.color = palette[Math.floor(Math.random() * palette.length)];
      }
      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.alpha += this.alphaChange;
        if (this.alpha <= 0.1 || this.alpha >= 0.8) {
          this.alphaChange *= -1;
        }
        if (this.y < -30 || this.x < -30 || this.x > width + 30) {
          this.reset(false);
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.shadowBlur = this.size * 5;
        ctx.shadowColor = `rgba(${this.color}, 0.7)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const particleCount = window.innerWidth < 768 ? 40 : 85;
    const ambientParticles = [];
    for (let i = 0; i < particleCount; i++) {
      ambientParticles.push(new AmbientParticle());
    }

    function animateAmbient() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < ambientParticles.length; i++) {
        ambientParticles[i].update();
        ambientParticles[i].draw();
      }
      requestAnimationFrame(animateAmbient);
    }
    animateAmbient();
  }


  /* ==========================================================================
     5. HER EYES SECTION (OLED Display Controls)
     ========================================================================== */
  const eyesImage = document.getElementById('eyesImage');
  const eyesBacklight = document.getElementById('eyesBacklight');
  const zoomToggleBtn = document.getElementById('zoomToggleBtn');
  const glowToggleBtn = document.getElementById('glowToggleBtn');
  const viewFullEyesBtn = document.getElementById('viewFullEyesBtn');
  const screenSpotlight = document.getElementById('screenSpotlight');
  const screenViewport = document.querySelector('.screen-viewport');

  // Start with Ken Burns zoom active
  if (eyesImage) {
    eyesImage.classList.add('cinematic-zoom-active');
  }

  // Toggle Zoom
  if (zoomToggleBtn && eyesImage) {
    zoomToggleBtn.classList.add('active');
    zoomToggleBtn.addEventListener('click', () => {
      eyesImage.classList.toggle('cinematic-zoom-active');
      zoomToggleBtn.classList.toggle('active');
      playChime(523.25, 'sine', 0.3);
    });
  }

  // Toggle Intense Glow
  if (glowToggleBtn && eyesBacklight) {
    glowToggleBtn.addEventListener('click', () => {
      eyesBacklight.classList.toggle('intense-glow');
      glowToggleBtn.classList.toggle('active');
      playChime(587.33, 'sine', 0.4);
    });
  }

  // Spotlight Follow on Mouse Move
  if (screenViewport && screenSpotlight) {
    screenViewport.addEventListener('mousemove', (e) => {
      const rect = screenViewport.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      screenSpotlight.style.left = `${x}px`;
      screenSpotlight.style.top = `${y}px`;
      screenSpotlight.style.opacity = '1';
    });
    screenViewport.addEventListener('mouseleave', () => {
      screenSpotlight.style.opacity = '0';
    });
  }


  /* ==========================================================================
     6. CINEMATIC SCENE SECTION (The Room, TV & Subtitles)
     ========================================================================== */
  const cinemaModeBtn = document.getElementById('cinemaModeBtn');
  const cinemaBtnText = document.getElementById('cinemaBtnText');
  const cinemaFrame = document.getElementById('cinemaFrame');
  const openSceneModalBtn = document.getElementById('openSceneModalBtn');
  const filmTimecode = document.getElementById('filmTimecode');
  let isCinemaDimmed = false;

  // Real-time ticking film timecode
  let tcFrames = 18;
  let tcSeconds = 42;
  let tcMinutes = 3;
  setInterval(() => {
    tcFrames++;
    if (tcFrames >= 24) {
      tcFrames = 0;
      tcSeconds++;
      if (tcSeconds >= 60) {
        tcSeconds = 0;
        tcMinutes++;
      }
    }
    if (filmTimecode) {
      const f = tcFrames < 10 ? '0' + tcFrames : tcFrames;
      const s = tcSeconds < 10 ? '0' + tcSeconds : tcSeconds;
      const m = tcMinutes < 10 ? '0' + tcMinutes : tcMinutes;
      filmTimecode.textContent = `00:${m}:${s}:${f}`;
    }
  }, 1000 / 24);

  // Cinema Dim Mode Toggle
  if (cinemaModeBtn) {
    cinemaModeBtn.addEventListener('click', () => {
      isCinemaDimmed = !isCinemaDimmed;
      playChime(440, 'triangle', 0.3);
      if (isCinemaDimmed) {
        document.body.classList.add('cinema-mode-active');
        cinemaBtnText.textContent = 'Restore Lights';
        if (cinemaFrame) {
          cinemaFrame.style.boxShadow = '0 0 100px rgba(225, 29, 72, 0.7), 0 0 40px rgba(251, 191, 36, 0.3)';
        }
      } else {
        document.body.classList.remove('cinema-mode-active');
        cinemaBtnText.textContent = 'Dim Room Lights';
        if (cinemaFrame) {
          cinemaFrame.style.boxShadow = '';
        }
      }
    });
  }


  /* ==========================================================================
     7. HEARTFELT MESSAGE SECTION (Sequential Typewriter Engine)
     ========================================================================== */
  const lineWraps = [
    document.getElementById('lineWrap1'),
    document.getElementById('lineWrap2'),
    document.getElementById('lineWrap3'),
    document.getElementById('lineWrap4')
  ];
  const typeLines = [
    document.getElementById('typeLine1'),
    document.getElementById('typeLine2'),
    document.getElementById('typeLine3'),
    document.getElementById('typeLine4')
  ];
  const replayTypingBtn = document.getElementById('replayTypingBtn');
  let isTypingRunning = false;
  let typingTriggered = false;

  async function typeWriterSequential() {
    if (isTypingRunning) return;
    isTypingRunning = true;

    // Reset lines
    for (let i = 0; i < typeLines.length; i++) {
      if (typeLines[i]) typeLines[i].innerHTML = '';
      if (lineWraps[i]) {
        lineWraps[i].classList.remove('active-typing', 'typed-done');
      }
    }

    // Type each line sequentially
    for (let i = 0; i < typeLines.length; i++) {
      const lineEl = typeLines[i];
      const wrapEl = lineWraps[i];
      if (!lineEl || !wrapEl) continue;

      wrapEl.classList.add('active-typing');
      const text = lineEl.getAttribute('data-text') || '';
      lineEl.innerHTML = '<span class="typing-cursor"></span>';

      for (let charIdx = 0; charIdx < text.length; charIdx++) {
        const currentChar = text[charIdx];
        const textSoFar = text.substring(0, charIdx + 1);
        lineEl.innerHTML = `${textSoFar}<span class="typing-cursor"></span>`;
        if (charIdx % 3 === 0) playTypingTick();
        
        // Pacing: slight pause on punctuation
        let delay = 36;
        if (currentChar === '.' || currentChar === '?' || currentChar === '!') delay = 320;
        else if (currentChar === ',') delay = 180;
        await new Promise(r => setTimeout(r, delay));
      }

      // Remove cursor from finished line
      lineEl.innerHTML = text;
      wrapEl.classList.remove('active-typing');
      wrapEl.classList.add('typed-done');

      // Inter-line pause
      await new Promise(r => setTimeout(r, 450));
    }

    isTypingRunning = false;
  }

  // Trigger typewriter on scroll into view
  const messageSection = document.getElementById('message-section');
  if (messageSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !typingTriggered) {
          typingTriggered = true;
          typeWriterSequential();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(messageSection);
  }

  if (replayTypingBtn) {
    replayTypingBtn.addEventListener('click', () => {
      playChime(659.25, 'sine', 0.4);
      typeWriterSequential();
    });
  }


  /* ==========================================================================
     8. INTERACTIVE PARTICLE HEART SURPRISE (Canvas Math & Fluid Physics)
     ========================================================================== */
  const surpriseBtn = document.getElementById('surprise-btn');
  const heartModal = document.getElementById('heartModal');
  const closeHeartModalBtn = document.getElementById('closeHeartModalBtn');
  const heartCanvas = document.getElementById('heart-canvas');
  const sendSmileBtn = document.getElementById('sendSmileBtn');
  const replayHeartBtn = document.getElementById('replayHeartBtn');
  const toastNotification = document.getElementById('toastNotification');
  const toastMsg = document.getElementById('toastMsg');

  let heartAnimId = null;
  let heartParticles = [];
  let heartCtx = null;
  let mouse = { x: -1000, y: -1000, radius: 90 };

  function showToast(msg = 'Your smile reached the stars. Thank you! ❤️') {
    if (!toastNotification) return;
    if (toastMsg) toastMsg.textContent = msg;
    toastNotification.classList.add('active');
    setTimeout(() => {
      toastNotification.classList.remove('active');
    }, 4000);
  }

  class HeartParticle {
    constructor(targetX, targetY, centerX, centerY) {
      this.targetX = targetX;
      this.targetY = targetY;
      this.x = centerX + (Math.random() - 0.5) * 80;
      this.y = centerY + (Math.random() - 0.5) * 80;
      this.vx = (Math.random() - 0.5) * 8;
      this.vy = (Math.random() - 0.5) * 8;
      this.size = Math.random() * 2.2 + 1.2;
      this.baseAlpha = Math.random() * 0.7 + 0.3;
      this.alpha = this.baseAlpha;
      
      const colors = [
        '255, 31, 90',   // vivid rose
        '225, 29, 72',   // carmine
        '251, 191, 36',  // starlight gold
        '254, 205, 211'  // petal white
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update(beatScale = 1.0) {
      // Calculate scaled target based on heartbeat pulse
      const tx = this.targetX * beatScale;
      const ty = this.targetY * beatScale;

      // Spring physics towards target
      const dx = tx - this.x;
      const dy = ty - this.y;
      this.vx += dx * 0.045;
      this.vy += dy * 0.045;
      this.vx *= 0.88;
      this.vy *= 0.88;

      // Mouse interactive repelling force
      const mx = this.x - mouse.x;
      const my = this.y - mouse.y;
      const dist = Math.sqrt(mx * mx + my * my);
      if (dist < mouse.radius && dist > 0) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.vx += (mx / dist) * force * 12;
        this.vy += (my / dist) * force * 12;
      }

      this.x += this.vx;
      this.y += this.vy;
    }

    draw() {
      heartCtx.beginPath();
      heartCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      heartCtx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
      heartCtx.shadowBlur = this.size * 4;
      heartCtx.shadowColor = `rgba(${this.color}, 0.8)`;
      heartCtx.fill();
      heartCtx.shadowBlur = 0;
    }
  }

  function initHeartParticles() {
    if (!heartCanvas) return;
    heartCtx = heartCanvas.getContext('2d');
    const w = (heartCanvas.width = window.innerWidth);
    const h = (heartCanvas.height = window.innerHeight);
    const centerX = w / 2;
    // Position heart centered behind the text
    const centerY = h / 2 - (w < 640 ? 40 : 20);

    heartParticles = [];
    // Number of particles: 1400 on desktop, 700 on mobile
    const total = w < 640 ? 700 : 1300;
    const scale = w < 640 ? 12 : (w < 1024 ? 17 : 21);

    for (let i = 0; i < total; i++) {
      // Parametric Heart Equation
      // t in [0, 2*PI]
      const t = Math.PI * 2 * (i / total) + (Math.random() - 0.5) * 0.08;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

      // Slight thickness/volume spread
      const spread = (Math.random() - 0.5) * (w < 640 ? 12 : 22);
      const targetX = centerX + x * scale + spread;
      const targetY = centerY + y * scale + spread;

      heartParticles.push(new HeartParticle(targetX, targetY, centerX, centerY));
    }
  }

  let beatTime = 0;
  function animateHeart() {
    heartCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
    beatTime += 0.045;

    // Heartbeat lub-dub calculation
    // Double pulse pattern
    const phase = beatTime % (Math.PI * 2);
    let scalePulse = 1.0;
    if (phase < 0.6) {
      scalePulse = 1.0 + Math.sin(phase * (Math.PI / 0.6)) * 0.08; // first beat
    } else if (phase >= 0.8 && phase < 1.3) {
      scalePulse = 1.0 + Math.sin((phase - 0.8) * (Math.PI / 0.5)) * 0.05; // second softer beat
    }

    for (let i = 0; i < heartParticles.length; i++) {
      heartParticles[i].update(scalePulse);
      heartParticles[i].draw();
    }

    heartAnimId = requestAnimationFrame(animateHeart);
  }

  // Mouse / Touch interaction on Heart Canvas
  if (heartCanvas) {
    heartCanvas.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    heartCanvas.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });
    heartCanvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    }, { passive: true });
    heartCanvas.addEventListener('touchend', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });
  }

  // Open Heart Modal
  if (surpriseBtn && heartModal) {
    surpriseBtn.addEventListener('click', () => {
      initAudioContext();
      playChime(783.99, 'sine', 1.5); // G5 starlight chord
      if (!isMusicPlaying) playMusic();

      heartModal.classList.add('active');
      heartModal.setAttribute('aria-hidden', 'false');
      initHeartParticles();
      animateHeart();
    });
  }

  // Close Heart Modal
  if (closeHeartModalBtn && heartModal) {
    closeHeartModalBtn.addEventListener('click', () => {
      heartModal.classList.remove('active');
      heartModal.setAttribute('aria-hidden', 'true');
      if (heartAnimId) cancelAnimationFrame(heartAnimId);
    });
  }

  // Send A Smile Back Button
  if (sendSmileBtn) {
    sendSmileBtn.addEventListener('click', () => {
      playChime(880, 'sine', 1.8);
      // Scatter particles like confetti starburst
      for (let p of heartParticles) {
        p.vx = (Math.random() - 0.5) * 35;
        p.vy = (Math.random() - 0.5) * 35;
      }
      showToast('Your smile reached the stars. Thank you for forgiving. ❤️');
    });
  }

  // Pulse Particle Heart Button
  if (replayHeartBtn) {
    replayHeartBtn.addEventListener('click', () => {
      playChime(523.25, 'triangle', 0.8);
      for (let p of heartParticles) {
        p.vx = (Math.random() - 0.5) * 20;
        p.vy = (Math.random() - 0.5) * 20;
      }
    });
  }


  /* ==========================================================================
     9. LIGHTBOX MODAL & INTERACTIVE GALLERY CAROUSEL
     ========================================================================== */
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeLightboxBtn = document.getElementById('closeLightboxBtn');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');

  const galleryItems = [
    { src: 'dh3.jpeg', caption: 'Her Eyes – The Main Attraction (Original photograph close-up)' },
    { src: 'dh1.jpeg', caption: 'Her Eyes – Close-Up Portrait Focus' },
    { src: 'dh2.jpeg', caption: 'A Moment of Reflection: Boy in dark room viewing her eyes on television with glowing "Sorry..."' },
    { src: 'dh4.jpeg', caption: '“A smile that lights up the world effortlessly.”' },
    { src: 'dh5.jpeg', caption: '“Graceful, gentle, and utterly unforgettable.”' },
    { src: 'dh7.jpeg', caption: '“Traditional beauty radiating calm peace.”' },
    { src: 'dh8.jpeg', caption: '“A smile that carries natural warmth and grace.”' },
    { src: 'dh6.jpeg', caption: '“Cheerful innocence that spreads pure joy.”' },
    { src: 'dh9.jpeg', caption: '“Poised, confident and full of quiet happiness.”' }
  ];
  let currentGalleryIndex = 0;

  function showGalleryItem(index) {
    if (index < 0) index = galleryItems.length - 1;
    if (index >= galleryItems.length) index = 0;
    currentGalleryIndex = index;
    const item = galleryItems[index];

    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
      lightboxImg.src = item.src;
      lightboxCaption.textContent = item.caption;
      lightboxImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'scale(1)';
    }, 150);
  }

  function openLightboxBySrc(src, fallbackCaption = '') {
    const idx = galleryItems.findIndex(item => item.src === src);
    if (idx !== -1) {
      currentGalleryIndex = idx;
    } else {
      currentGalleryIndex = 0;
    }

    if (!lightboxModal || !lightboxImg) return;
    showGalleryItem(currentGalleryIndex);
    lightboxModal.classList.add('active');
    lightboxModal.setAttribute('aria-hidden', 'false');
    playChime(493.88, 'sine', 0.3);
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    if (lightboxImg) lightboxImg.src = '';
  }

  if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
  
  if (lightboxPrevBtn) {
    lightboxPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showGalleryItem(currentGalleryIndex - 1);
      playChime(440, 'sine', 0.2);
    });
  }

  if (lightboxNextBtn) {
    lightboxNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showGalleryItem(currentGalleryIndex + 1);
      playChime(523.25, 'sine', 0.2);
    });
  }

  // Bind Smile Cards to Lightbox
  const smileCards = document.querySelectorAll('.smile-card');
  smileCards.forEach(card => {
    card.addEventListener('click', () => {
      const src = card.getAttribute('data-img');
      const caption = card.getAttribute('data-caption');
      openLightboxBySrc(src, caption);
    });
  });

  // Bind "Full View" in Eyes section
  if (viewFullEyesBtn) {
    viewFullEyesBtn.addEventListener('click', () => {
      openLightboxBySrc('dh3.jpeg', 'Her Eyes – The Main Attraction (Original photograph close-up)');
    });
  }

  // Bind "Portrait View" in Eyes section (dh1.jpeg)
  const viewPortraitEyesBtn = document.getElementById('viewPortraitEyesBtn');
  if (viewPortraitEyesBtn) {
    viewPortraitEyesBtn.addEventListener('click', () => {
      openLightboxBySrc('dh1.jpeg', 'Her Eyes – Close-Up Portrait Focus');
    });
  }

  // Bind "Enlarge Still" in Scene section
  if (openSceneModalBtn) {
    openSceneModalBtn.addEventListener('click', () => {
      openLightboxBySrc('dh2.jpeg', 'A Moment of Reflection: Boy in dark room viewing her eyes on television with glowing "Sorry..."');
    });
  }


  /* ==========================================================================
     10. EXTRA MAGICAL INTERACTIONS (Wax Seal, Petals & Tap Hearts)
     ========================================================================== */
  // Personal Wax-Sealed Letter Toggle
  const waxSealBtn = document.getElementById('waxSealBtn');
  const waxLetterCard = document.getElementById('waxLetterCard');
  if (waxSealBtn && waxLetterCard) {
    waxSealBtn.addEventListener('click', () => {
      const isOpen = waxLetterCard.classList.toggle('open');
      if (isOpen) {
        playChime(659.25, 'sine', 0.8);
        showToast('Opened a quiet personal note 💌');
      } else {
        playChime(440, 'triangle', 0.4);
      }
    });
  }

  // Rain Rose Petals Shower
  const rainPetalsBtn = document.getElementById('rainPetalsBtn');
  function spawnPetalShower(count = 35) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const petal = document.createElement('div');
        petal.className = 'falling-petal';
        petal.style.left = Math.random() * 95 + 'vw';
        const duration = Math.random() * 3 + 4.5;
        petal.style.animationDuration = duration + 's';
        const scale = Math.random() * 0.5 + 0.7;
        petal.style.transform = `scale(${scale})`;
        document.body.appendChild(petal);
        setTimeout(() => petal.remove(), duration * 1000);
      }, i * 110);
    }
  }

  if (rainPetalsBtn) {
    rainPetalsBtn.addEventListener('click', () => {
      playChime(783.99, 'sine', 1.2);
      spawnPetalShower(40);
      showToast('A gentle shower of rose petals for you 🌹');
    });
  }

  // Floating Hearts on Screen Tap / Click
  document.addEventListener('pointerdown', (e) => {
    // Ignore clicks on buttons, links, inputs, sliders, and controls
    if (e.target.closest('button, a, input, .nav-chapters, .display-bezel-bottom, .letterbox-bar, .lightbox-dialog')) {
      return;
    }
    spawnTapHeart(e.clientX, e.clientY);
  });

  function spawnTapHeart(x, y) {
    const heart = document.createElement('div');
    heart.className = 'floating-tap-heart';
    const emojis = ['❤️', '✨', '💖', '🌸', '💫', '🌹'];
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1600);
  }

  // Touch Swipe for Lightbox on Mobile
  let touchStartX = 0;
  if (lightboxModal) {
    lightboxModal.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) touchStartX = e.touches[0].clientX;
    }, { passive: true });

    lightboxModal.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0) {
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchEndX - touchStartX;
        if (diff > 50) {
          showGalleryItem(currentGalleryIndex - 1); // swipe right -> previous
        } else if (diff < -50) {
          showGalleryItem(currentGalleryIndex + 1); // swipe left -> next
        }
      }
    }, { passive: true });
  }

  // Keyboard Navigation Handler (Escape, Space, Left Arrow, Right Arrow)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      if (heartModal && heartModal.classList.contains('active')) {
        heartModal.classList.remove('active');
        if (heartAnimId) cancelAnimationFrame(heartAnimId);
      }
      if (isCinemaDimmed && cinemaModeBtn) {
        cinemaModeBtn.click();
      }
    } else if (e.key === 'ArrowLeft' && lightboxModal && lightboxModal.classList.contains('active')) {
      showGalleryItem(currentGalleryIndex - 1);
    } else if (e.key === 'ArrowRight' && lightboxModal && lightboxModal.classList.contains('active')) {
      showGalleryItem(currentGalleryIndex + 1);
    } else if (e.key === ' ' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
      // Space key toggles soundtrack
      e.preventDefault();
      toggleMusic();
    }
  });

  console.log('✨ "A Little Something For You" experience initialized successfully with all magical features.');
});
