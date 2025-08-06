document.addEventListener("DOMContentLoaded", function() {
    // 创建轮播管理器类
    class CarouselManager {
        constructor(container) {
          this.container = container;
          this.wrapper = container.querySelector('.carousel-wrapper');
          this.prevBtn = container.querySelector('.carousel-nav.prev');
          this.nextBtn = container.querySelector('.carousel-nav.next');
          this.indicators = container.parentNode.querySelectorAll('.carousel-indicator');
          this.currentSlide = 0;
          
          // 关键修改：根据实际的slide数量动态设置
          this.totalSlides = this.wrapper.querySelectorAll('.carousel-slide').length; // 自动检测slide数量
          
          this.init();
        }
      
      init() {
        this.updateCarousel();
        this.bindEvents();
      }
      
      updateCarousel() {
        // 关键修改：动态计算translateX值
        const translateX = -this.currentSlide * (100 / this.totalSlides);
        this.wrapper.style.transform = `translateX(${translateX}%)`;
        
        // 更新指示器
        this.indicators.forEach((indicator, index) => {
          indicator.classList.toggle('active', index === this.currentSlide);
        });
      }
      
      nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
        this.updateCarousel();
      }
      
      prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
        this.updateCarousel();
      }
      
      goToSlide(slideIndex) {
        this.currentSlide = slideIndex;
        this.updateCarousel();
      }
      
      
      bindEvents() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        this.indicators.forEach((indicator, index) => {
          indicator.addEventListener('click', () => this.goToSlide(index));
        });
      }
    }
    
    // 初始化所有轮播
    const carouselContainers = document.querySelectorAll('.carousel-container');
    const carousels = [];
    
    carouselContainers.forEach(container => {
      carousels.push(new CarouselManager(container));
    });
    
    // 键盘导航 - 只控制第一个轮播
    document.addEventListener('keydown', (e) => {
      if (carousels.length > 0) {
        if (e.key === 'ArrowLeft') carousels[0].prevSlide();
        if (e.key === 'ArrowRight') carousels[0].nextSlide();
      }
    });

    // 视频进度条功能
    const videoWrappers = document.querySelectorAll('.video-wrapper');
    
    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    videoWrappers.forEach(wrapper => {
      const video = wrapper.querySelector('video');
      const progressBar = wrapper.querySelector('.video-progress-bar');
      const progressContainer = wrapper.querySelector('.video-progress-container');
      const timeDisplay = wrapper.querySelector('.video-time');
      const playBtn = wrapper.querySelector('.video-play-btn');
      
      if (!video || !progressBar || !timeDisplay || !playBtn) return;
      
      function updateProgress() {
        if (video.duration) {
          const progress = (video.currentTime / video.duration) * 100;
          progressBar.style.width = progress + '%';
          timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
        }
      }
      
      function updatePlayButton() {
        playBtn.textContent = video.paused ? '▶' : '⏸';
      }
      
      video.addEventListener('loadedmetadata', () => {
        timeDisplay.textContent = `0:00 / ${formatTime(video.duration)}`;
      });
      
      video.addEventListener('timeupdate', updateProgress);
      video.addEventListener('play', updatePlayButton);
      video.addEventListener('pause', updatePlayButton);
      
      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      });
      
      progressContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        if (video.duration) {
          const rect = progressContainer.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const progress = clickX / rect.width;
          video.currentTime = progress * video.duration;
        }
      });
      
      video.addEventListener('click', (e) => {
        e.stopPropagation();
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      });
      
      updatePlayButton();
    });
    
    // Intersection Observer for auto-play when visible
    const options = {
      root: null,
      threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target.querySelector('video');
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // 自动播放失败时静默处理
          });
        } else {
          video.pause();
          video.currentTime = 0;
        }
      });
    }, options);
    
    videoWrappers.forEach(wrapper => {
      observer.observe(wrapper);
    });
  });