document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.main-container').forEach(function (element) {
      element.addEventListener('click', function () {
        const url = element.getAttribute('data-href');
        if (url) {
          window.location.href = url;
        }
      });
    });
  });