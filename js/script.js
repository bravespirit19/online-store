  void function () {
  'use strict';

  const cartBtn = document.querySelectorAll('.shopping-cart-icon');
  const bodyBlur = document.querySelector('.black-blur');
  const cartModal = document.querySelector('.cart-modal');
  const closeModalBtn = document.querySelector('.close-modal');
  const mobileNav = document.querySelector('.header-mobile-nav')
  const headerDots = document.querySelector('.header-mobile-dots');
  const mobileNavClose = document.querySelector('.mobile-nav-close');
  const headerIcons = document.querySelector('.header-icons');
  const headerRow = document.querySelector('.header-row');
  const cartProductsRow = document.querySelector('.modal-product-row');
  const cartProductsTotalSum = document.querySelector('.total-sum');
  const body = document.querySelector('body');
  const localCartKey = 'cart-products';

  function getLocalData(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  }

  function setLocalData(data) {
    const savedData = getLocalData(localCartKey);
    const newData = [...savedData, data];
    const item = savedData.find(({id}) => id === data.id);
    if (item) {
      item.quantity++;
    }
    localStorage.setItem(localCartKey, JSON.stringify(newData))
  }

  function deleteLocalData(itemId) {
    const savedData = getLocalData(localCartKey);
    const newData = savedData.filter(({ id }) => id != itemId);
    localStorage.setItem(localCartKey, JSON.stringify(newData))
  }

  async function generateCartItems(data) {
    let template = ``;
    let itemsIds = [];
    let sum = data.reduce((acc, {price}) => {
      acc += price;

      return acc;
    }, 0)
    data.forEach(({ id, imgLink, name, price, quantity }) => {
      if (!itemsIds.some(itemId => itemId === id)) {
        itemsIds.push(id);
        template += `
        <div class="modal-product-item" item-id=${id}>
          <div class="item-preview">
            <img src="${imgLink}" alt="" class="item-preview-img">
            <div class="item-preview-desc">
              <div class="desc-name">${name}</div>
              <div class="desc-price">${price}$</div>
            </div>
          </div>
          <div class="item-counter">
            <div class="item-count">
              <button class="item-count-minus">-</button>
              <div class="item-count-value">${quantity}</div>
              <button class="item-count-plus">+</button>
            </div>
            <div class="item-remove">
              <div>Remove</div>
              <button class="item-remove-btn" item-id=${id}>
                <img src="./img/icons/remove-icon.svg" alt="">
              </button>
            </div>
          </div>
        </div>`
      }
    })
    cartProductsRow.innerHTML = template;
    cartProductsTotalSum.innerHTML = `Total:<br><span>$</span>${sum.toFixed(2)}`

    return cartProductsRow;
  }

  cartBtn.forEach(item => {
    item.addEventListener('click', () => {
      bodyBlur.style.display = 'block';
      cartModal.style.right = '0px';
      body.style.position = 'fixed';
    })
  })

  closeModalBtn.addEventListener('click', () => {
    bodyBlur.style.display = 'none';
    cartModal.style.right = '-445px';
    body.style.position = 'static';
  })

  headerDots.addEventListener('click', () => {
    mobileNav.style.top = '0px';
    headerDots.style.display = 'none';
    headerIcons.style.display = 'none';
    headerRow.style.justifyContent = 'center';
  })

  mobileNavClose.addEventListener('click', () => {
    mobileNav.style.top = '-371px';
    headerDots.style.display = 'block';
    headerIcons.style.display = 'flex';
    headerRow.style.justifyContent = 'space-between';
  })

  cartProductsRow.addEventListener('click', async ({ target }) => {
    const data = await getLocalData(localCartKey)
    const button = target.closest('.item-remove-btn');
    const minus = target.closest('.item-count-minus');
    const plus = target.closest('.item-count-plus');
    const item = target.closest('.modal-product-item');
    const itemId = +item.getAttribute('item-id');

    if (button) {
      deleteLocalData(itemId);
      generateCartItems(getLocalData(localCartKey));
    }

    if (minus) {
      const index = data.findLastIndex(({ id }) => id === itemId);
      const newData = data;
      const item = data.find(({ id }) => id === itemId);
      if (item) item.quantity--;
      data.splice(index, 1)
      localStorage.setItem(localCartKey, JSON.stringify(newData));
      generateCartItems(getLocalData(localCartKey));
    }
    if (plus) {
      const selectedItem = data.find(({id}) => id === itemId);
      if (selectedItem) {
        setLocalData(selectedItem)
        generateCartItems(getLocalData(localCartKey));
      }
    }

  })

  document.addEventListener('DOMContentLoaded', async () => {
    generateCartItems(getLocalData(localCartKey))
  })
}()