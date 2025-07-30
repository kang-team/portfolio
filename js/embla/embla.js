// $(function(){

  // ----------------------------------------------------------
  //EmblaCarouselArrowButtons
  const addTogglePrevNextBtnsActive = (emblaApi, prevBtn, nextBtn) => {
    const togglePrevNextBtnsState = () => {
      if (emblaApi.canScrollPrev()) prevBtn.removeAttribute('disabled')
      else prevBtn.setAttribute('disabled', 'disabled')

      if (emblaApi.canScrollNext()) nextBtn.removeAttribute('disabled')
      else nextBtn.setAttribute('disabled', 'disabled')
    }

    emblaApi
      .on('select', togglePrevNextBtnsState)
      .on('init', togglePrevNextBtnsState)
      .on('reInit', togglePrevNextBtnsState)

    return () => {
      prevBtn.removeAttribute('disabled')
      nextBtn.removeAttribute('disabled')
    }
  }

  const addPrevNextBtnsClickHandlers = (emblaApi, prevBtn, nextBtn) => {
    // 버튼이 없는 경우 early return
    if (!prevBtn || !nextBtn) {
      return () => {} // 빈 cleanup 함수 반환
    }

    const scrollPrev = () => {
      emblaApi.scrollPrev()
      // Reset autoplay timer
      const autoplay = emblaApi.plugins().autoplay
      if (autoplay && autoplay.isPlaying()) autoplay.reset()
    }
    const scrollNext = () => {
      emblaApi.scrollNext()
      // Reset autoplay timer
      const autoplay = emblaApi.plugins().autoplay
      if (autoplay && autoplay.isPlaying()) autoplay.reset()
    }
    prevBtn.addEventListener('click', scrollPrev, false)
    nextBtn.addEventListener('click', scrollNext, false)

    const removeTogglePrevNextBtnsActive = addTogglePrevNextBtnsActive(
      emblaApi,
      prevBtn,
      nextBtn
    )

    return () => {
      removeTogglePrevNextBtnsActive()
      prevBtn.removeEventListener('click', scrollPrev, false)
      nextBtn.removeEventListener('click', scrollNext, false)
    }
  }

  //EmblaCarouselDotButton
  const addDotBtnsAndClickHandlers = (emblaApi, dotsNode) => {
    let dotNodes = []

    const addDotBtnsWithClickHandlers = () => {
      dotsNode.innerHTML = emblaApi
        .scrollSnapList()
        .map(() => '<button class="embla__dot" type="button"></button>')
        .join('')    
        const scrollTo = (index) => {
        emblaApi.scrollTo(index)
        // Reset autoplay timer when dot is clicked
        const autoplay = emblaApi.plugins().autoplay
        if (autoplay && autoplay.isPlaying()) autoplay.reset()
      }

      dotNodes = Array.from(dotsNode.querySelectorAll('.embla__dot'))
      dotNodes.forEach((dotNode, index) => {
        dotNode.addEventListener('click', () => scrollTo(index), false)
      })
    }
    const toggleDotBtnsActive = () => {
      const previous = emblaApi.previousScrollSnap()
      const selected = emblaApi.selectedScrollSnap()
      
      // 이전 활성화 dot에서 클래스와 스크린리더 텍스트 제거
      dotNodes[previous].classList.remove('embla__dot--selected')
      const previousSrSpan = dotNodes[previous].querySelector('.sr-only')
      if (previousSrSpan) previousSrSpan.remove()
      
      // 현재 활성화 dot에 클래스와 스크린리더 텍스트 추가
      dotNodes[selected].classList.add('embla__dot--selected')
      const srSpan = document.createElement('span')
      srSpan.className = 'sr-only'
      srSpan.textContent = '- 활성화된 슬라이드'
      dotNodes[selected].appendChild(srSpan)
    }

    emblaApi
      .on('init', addDotBtnsWithClickHandlers)
      .on('reInit', addDotBtnsWithClickHandlers)
      .on('init', toggleDotBtnsActive)
      .on('reInit', toggleDotBtnsActive)
      .on('select', toggleDotBtnsActive)

    return () => {
      dotsNode.innerHTML = ''
    }
  }

  //EmblaCarouselPlayButton
  const addPlayBtnListeners = (emblaApi, playBtn) => {
    const togglePlayBtnState = (emblaApi) => {
      const autoplay = emblaApi?.plugins()?.autoplay
      if (!autoplay) return

      const buttonText = autoplay.isPlaying() ? '재생' : '정지'
      playBtn.innerHTML = buttonText
      playBtn.classList.toggle('play', autoplay.isPlaying())
      playBtn.classList.toggle('stop', !autoplay.isPlaying())
    }

    const onPlayBtnClick = () => {
      const autoplay = emblaApi?.plugins()?.autoplay
      if (!autoplay) return

      const playOrStop = autoplay.isPlaying() ? autoplay.stop : autoplay.play
      playOrStop()
    }

    playBtn.addEventListener('click', onPlayBtnClick)
    emblaApi
      .on('autoplay:play', togglePlayBtnState)
      .on('autoplay:stop', togglePlayBtnState)
    .on('pointerDown', togglePlayBtnState)

    return () => {
      playBtn.removeEventListener('click', onPlayBtnClick)
      emblaApi
        .off('autoplay:play', togglePlayBtnState)
        .off('autoplay:stop', togglePlayBtnState)
      .off('pointerDown', togglePlayBtnState)
    }
  }

  // 메인 비누얼 슬라이드 fade 초기화 함수
  const mainVisualSlide = () => {
    const emblaNode = document.querySelector('.main-visual')
    if (!emblaNode) return; 

    const OPTIONS = { loop: true, duration: 30 }

    const viewportNode = emblaNode.querySelector('.embla__viewport')
    const prevBtn = emblaNode.querySelector('.embla__button--prev')
    const nextBtn = emblaNode.querySelector('.embla__button--next')
    const dotsNode = document.querySelector('.embla__dots')
    const playBtn = document.querySelector('.embla__play')

    const emblaApi = EmblaCarousel(viewportNode, OPTIONS, [
      EmblaCarouselFade(),
      EmblaCarouselAutoplay({ playOnInit: true, delay: 4000, stopOnInteraction: false }),
      EmblaCarouselClassNames()
    ])

    const removePrevNextBtnsClickHandlers = addPrevNextBtnsClickHandlers(
      emblaApi,
      prevBtn,
      nextBtn
    );
    const removeDotBtnsAndClickHandlers = addDotBtnsAndClickHandlers(
      emblaApi,
      dotsNode
    );
    const removePlayBtnListeners = addPlayBtnListeners(emblaApi, playBtn);

    emblaApi
      .on('destroy', removePrevNextBtnsClickHandlers)
      .on('destroy', removeDotBtnsAndClickHandlers)
      .on('destroy', removePlayBtnListeners);
  }


  
  // brands 슬라이더
  const TWEEN_FACTOR_BASE = 0.2
  let tweenFactor = 0
  let tweenNodes = []

  const numberWithinRange = (number, min, max) =>
    Math.min(Math.max(number, min), max)

  const setTweenNodes = (emblaApi) => {
    tweenNodes = emblaApi.slideNodes().map((slideNode) => {
      return slideNode.querySelector('.brand-slider .embla__slide__number')
    })
  }

  const setTweenFactor = (emblaApi) => {
    tweenFactor = TWEEN_FACTOR_BASE * emblaApi.scrollSnapList().length
  }

  const tweenScale = (emblaApi, eventName) => {
    const engine = emblaApi.internalEngine()
    const scrollProgress = emblaApi.scrollProgress()
    const slidesInView = emblaApi.slidesInView()
    const isScrollEvent = eventName === 'scroll'

    emblaApi.scrollSnapList().forEach((scrollSnap, snapIndex) => {
      let diffToTarget = scrollSnap - scrollProgress
      const slidesInSnap = engine.slideRegistry[snapIndex]

      slidesInSnap.forEach((slideIndex) => {
        if (isScrollEvent && !slidesInView.includes(slideIndex)) return

        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem) => {
            const target = loopItem.target()

            if (slideIndex === loopItem.index && target !== 0) {
              const sign = Math.sign(target)

              if (sign === -1) {
                diffToTarget = scrollSnap - (1 + scrollProgress)
              }
              if (sign === 1) {
                diffToTarget = scrollSnap + (1 - scrollProgress)
              }
            }
          })
        }

        const tweenValue = 1 - Math.abs(diffToTarget * tweenFactor)
        const scale = numberWithinRange(tweenValue, 0.80, 1).toString()
        const tweenNode = tweenNodes[slideIndex]
        tweenNode.style.transform = `scaleY(${scale})`

        const img = tweenNode.querySelector('img')
        if (img) {
          const reverseScale = (1 / scale).toFixed(4)
          img.style.transform = `scaleY(${reverseScale})`
        }
      })
    })
  }

  const setupTweenScale = (emblaApi) => {
    setTweenNodes(emblaApi)
    setTweenFactor(emblaApi)
    tweenScale(emblaApi)

    emblaApi
      .on('reInit', setTweenNodes)
      .on('reInit', setTweenFactor)
      .on('reInit', tweenScale)
      .on('scroll', tweenScale)
      .on('slideFocus', tweenScale)

    return () => {
      tweenNodes.forEach((slide) => slide.removeAttribute('style'))
    }
  }

  // 메인 브랜드 슬라이드 초기화 함수
  const mainBrandsSlide = () => {
    const emblaNode = document.querySelector('.brand-slider')
    if (!emblaNode) return; 

    const OPTIONS = { loop: true }

    const viewportNode = emblaNode.querySelector('.embla__viewport')
    const prevBtn2 = emblaNode.querySelector('.embla__button--prev')
    const nextBtn2 = emblaNode.querySelector('.embla__button--next')

    const emblaApi2 = EmblaCarousel(viewportNode, OPTIONS, [EmblaCarouselClassNames()])
    const removeTweenScale = setupTweenScale(emblaApi2)

    const removePrevNextBtnsClickHandlers = addPrevNextBtnsClickHandlers(
      emblaApi2,
      prevBtn2,
      nextBtn2
    )

    emblaApi2
      .on('destroy', removeTweenScale)
      .on('destroy', removePrevNextBtnsClickHandlers)
  }




// 텍스트 분리
function wrapWords(div) {
  const rawHTML = div.innerHTML; // div 안의 원본 HTML 가져오기
  const lines = rawHTML.split(/<br\s*\/?>/i).map(line => line.trim()); // <br>을 기준으로 줄 나누기

  const wrappedHTML = lines
    .map(line => `<span class="word"><span class="inner">${line}</span></span>`)
    .join('<br>\n');

  div.innerHTML = wrappedHTML;
}
document.querySelectorAll(".text-animation").forEach(el => wrapWords(el)); 

// 스크롤 시 체크
function checkScroll() {
  const triggerLine = window.innerHeight * 0.8;

  // line과 circle 요소 체크 - 각각 한번만 실행
  const animElements = document.querySelectorAll('.inview');
  animElements.forEach(element => {
    if (!element.classList.contains('is-inviewed')) {
      const rect = element.getBoundingClientRect();
      if (rect.top < triggerLine && rect.bottom > 0) {
        element.classList.add('is-inviewed');
      }
    }
  });
}

// 초기 로드 이벤트 등록
document.addEventListener("DOMContentLoaded", () => {
  mainVisualSlide();
  mainBrandsSlide();
  checkScroll();
  window.addEventListener("scroll", checkScroll);
});




  // 브랜드 연관브랜드 스와이퍼
    var brandCarouselSwiper = (function(){
        var el, _swiper, swiperEl, containerEl, paginationEl, prevEl, nextEl, colEl;
        var titleData, idx, isLoad, itemLgt, colLgt, colWidth, containerWidth, colClass;
        function init(){
            el = $('.brand-carousel-slider');
            swiperEl = el.find('.js-carousel-swiper');
            containerEl = swiperEl.find('.swiper-container');
            paginationEl = swiperEl.find('.swiper-pagination');
            colEl = swiperEl.find('.swiper-slide .col');

            isLoad = el.length === 0;
            idx = 0;
            itemLgt = containerEl.find('.swiper-slide').length;
            colWidth = colEl.width();
            colLgt = colEl.length;
            containerWidth = colWidth * colLgt;
            colClass = 'col-1-' + colLgt;

            if(isLoad){
                return false;
            }

            swiperEl.css('opacity','1');
            bindEvent();
        }
        function bindEvent(){
            swiperFn();
        }
        function swiperFn(){
            if(itemLgt > 1){
                swiperEl.addClass('in');
                _swiper = new Swiper(containerEl, {
                    keyboard: {
                      enabled: true,
                      onlyInViewport: false,
                    },
                    speed: 400,
                    spaceBetween: 30,
                    navigation: {
                        nextEl: swiperEl.find('.swiper-button-next'),
                        prevEl: swiperEl.find('.swiper-button-prev'),
                    },
                    on: {
                        init : function(){
                            paginationEl.html('<span class="count eng-title"><span class="current">' + (this.realIndex + 1) + '</span><span class="total">/' + itemLgt + '</span></span>');
                        },
                        slideChange : function(){
                            paginationEl.find('.current').text(this.realIndex + 1);
                        }
                    }
                });
            } else {
                colEl.removeClass('col-1-5').addClass(colClass);
                containerEl.css('max-width', containerWidth);
            }
        }

        return{
            init:init
        }
    })();
    brandCarouselSwiper.init();


  
// });