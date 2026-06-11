document.addEventListener("BSS:changeVariantQV", (e) => {
  setTimeout(() => {
    const formId = e.detail?.formId;

    let productForm;

    if (formId) {
      productForm = document.querySelector(
        `[bss-b2b-product-form-id="${formId}"][bss-b2b-quickview-product-form]`
      );
    }

    if (!productForm) {
      productForm = document.querySelector("[bss-b2b-main-product-form]");
    }

    BSS_B2B.observer.productSubject.notifyObserver(
      'VariantChange',
      'VariantSelectChange',
      { productForm }
    );
  }, 500);
});

document.addEventListener('DOMContentLoaded', function () {
  document.body.addEventListener('click', function (e) {
    const quickViewBtn = e.target.closest('[bss-b2b-btn-quickview]');
    if (quickViewBtn) {
      setTimeout(() => {
        document.dispatchEvent(new Event('bss_b2b:QuickviewLoaded'));
      }, 2000);
    }
  });

  if (typeof BSS_B2B !== "undefined" && BSS_B2B) {
    setTimeout(() => {
      const observer = new MutationObserver((MutationList) => {
        for (let item of MutationList) {
          if (item.target.classList?.contains('halo-cart-content')) {
            BSS_B2B.observer.cartSubject.listenCartCheckout();
          }
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    }, 300);
  }
});
