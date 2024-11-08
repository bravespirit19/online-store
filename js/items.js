void function () {
  'use strict';

  const priceRange = document.querySelector('#filter-price-range');
  const priceRangeValue = document.querySelector('.range-value');
  const priceRangeLeftPart = document.querySelector('.range-left-part');
  const filterTopicParams = document.querySelector('.filter-topic-params');
  const filterParamItems = document.querySelectorAll('.params-item');
  const itemsRow = document.querySelector('.items-row');
  const filterSearch = document.querySelector('.filter-search');
  const cartProductsRow = document.querySelector('.modal-product-row');
  const cartProductsTotalSum = document.querySelector('.total-sum');
  const localCartKey = 'cart-products';
  let filteredData = null;

  async function getData() {
    const url = './data/foxes.json';
    const response = await fetch(url);
    const data = await response.json()
    return data;
  }

  async function generateItems(data) {
    let template = ``;

    data.forEach(({rating, id, imgLink, name, price, type}) => {
      let stars = ``;
      for (let i = 0; i < rating; i++) {
        stars += `<img src="./img/icons/star-icon.svg" alt="">`
      }
      template += `<div class="item" item-id ="${id}">
      <div class="item-img">
        <img src="${imgLink}" alt="">
        <button class="add-to-cart-btn" item-id ="${id}">
          <div class="add-to-cart-plus">+</div>
          <div>Add</div>
        </button>
      </div>
      <div class="item-desc">
        <div class="item-name">${name}</div>
        <div class="item-price">${price}$</div>
        <div class="item-rating">${stars}</div>
        <div class="item-type">${type}</div>
      </div>
    </div>`
    })
    itemsRow.innerHTML = template;

    if (template === '') {
      itemsRow.classList.add('items-row-empty')
      itemsRow.innerHTML = '<h6>No matches found</h6>'
    } else {
      itemsRow.classList.remove('items-row-empty')
    }
    return itemsRow;
  }

  async function generateCartItems (data) {
    let template = ``;
    let itemsIds = [];
    let sum = data.reduce((acc, item) => {
      acc += +item.price;

      return acc;
    }, 0)
    data.forEach(({id, imgLink, name, price, quantity}) => {
      if(!itemsIds.some(itemId => itemId === id)) {
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

  function updateRangeColor(e) {
    priceRangeLeftPart.style.width = `${e.target.value}%`;
  }

  function updateRangeValue(e) {
    priceRangeValue.innerHTML = `Value: $${e.target.value}`;
  }

  function getLocalData (key) {
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

  filterTopicParams.addEventListener('click', async ({ target }) => {
    let data = await getData();
    let checkedParam = null;
    filterParamItems.forEach((item) => {
      item.classList.remove('params-item-checked')
    })
    if (target.classList.contains('params-item')) {
      target.classList.add('params-item-checked')
      if (target.innerHTML === 'All') {
        generateItems(data);
        filteredData = null;
      } else if (target.innerHTML === 'Foxs kids') {
        checkedParam = 'Kids';
      } else {
        checkedParam = target.innerHTML;
      }
      
      filteredData = data.filter(({type}) => checkedParam.includes(type));

      generateItems(filteredData);
    }
  })

  filterSearch.addEventListener('input', async () => {
    const searchText = filterSearch.value.trim().toLowerCase();
    const data = filteredData ? filteredData : await getData();

    const filteredItems = data.filter((item) => {
      const itemName = item.name.toLowerCase();
      return itemName.includes(searchText);
    })

    generateItems(filteredItems);
  })
  
  document.addEventListener('DOMContentLoaded', async () => {
    const data = await getData();
    generateItems(data);
    generateCartItems(getLocalData(localCartKey));
    priceRange.value = 50;
    updateRangeValue({target: priceRange})
  })

  priceRange.addEventListener('input', async () => {
    const value = priceRange.value;
    const data = filteredData ? filteredData : await getData();

    const filteredItems = data.filter(({price}) => price <= value);

    generateItems(filteredItems);
  })

  itemsRow.addEventListener('click', async ({ target }) => {
    const data = await getData();
    const button = target.closest('.add-to-cart-btn');
    if (button) {
      const itemId = +button.getAttribute('item-id');
      const selectedItem = data.find(({id}) => id === itemId);

      if(selectedItem) {
        setLocalData(selectedItem)
        generateCartItems(getLocalData(localCartKey));
      }
    }
  })

  priceRange.addEventListener('input', updateRangeValue)
  priceRange.addEventListener('input', updateRangeColor)
}()