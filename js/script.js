
  $(function () {
    // header.html 먼저 불러온 뒤에 이벤트 바인딩
    $('#header').load('header.html', function () {
      // 서브메뉴 호버 이벤트
      $("nav").mouseenter(function () {
        $(".submenu, .mbg").stop().slideDown(200);
      });

      $("nav").mouseleave(function () {
        $(".submenu, .mbg").stop().slideUp(200);
      });

      // AOS 초기화
      AOS.init();
    });

    // footer는 일반적으로 이벤트가 필요 없으니 별도 콜백 없어도 OK
    $('#footer').load('footer.html');

    // 🔶 브랜드 섹션 인터랙션
    $(".brand .pic").mouseenter(function () {
      $(this).find(".txt2").css({
        "display": "block",
        "color": "white"
      });
    });

    $(".brand .pic").mouseleave(function () {
      $(this).find(".txt2").css("display", "none");
    });

    // 🔶 노란 PNG 퍼지기 스크롤 이벤트
    $(window).on('scroll', function () {
      var $wt = $(window).scrollTop(); // 현재 스크롤 위치
      var winW = window.innerWidth;   // 현재 윈도우 가로 폭

      var offsetVal = 500;
      var $pot = $('.brand').offset().top - offsetVal;

      if ($wt >= $pot) {
        $('.bg_con').addClass('on');
      }
    });
  });