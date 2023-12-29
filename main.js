const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/sales_website', { useNewUrlParser: true, useUnifiedTopology: true });

const Product = mongoose.model('Product', {
  name: String,
  price: String,
  image: String
});

let productInCart = localStorage.getItem('products') ? JSON.parse(localStorage.getItem('products')) : [];


//Index page
async function renderProducts() {
  let data = ``;
  for (let i = 0; i < products.length; i++) {
    let product = await Product.findById(products[i].id);
    if (!product) continue;

    data += `
      <div class='col-3'>
        <div class='card'>
          <img src='${product.image}' class='card-img-top' alt=''>
          <div class='card-body'>
            <h5 class='card-title'>${product.name}</h5>
            <p class='card-text'>${product.price}</p>
            <button onclick='addToCart("${product.id}")' class='btn btn-primary'>Add to cart</button>
          </div>
        </div>
      </div>
    `;
  }
  document.getElementById('products').innerHTML = data;
}

async function addToCart(id) {
  let product = await Product.findById(id);
  if (!product) return;

  let checkProduct = productInCart.some(value => value.id === id);

  if (!checkProduct) {
    productInCart.unshift({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    // saveToLocalStorage();
    calculatorTotal();
  } else {
    let getIndex = productInCart.findIndex(value => value.id === id);
    productInCart[getIndex] = {
      ...productInCart[getIndex],
      quantity: ++productInCart[getIndex].quantity
    };
    // saveToLocalStorage();
  }
}

function calculatorTotal () {
  document.getElementById('total').innerHTML = productInCart.length;
}

function indexLoadPage () {
  renderProducts();
  calculatorTotal();
}

//Cart page
async function renderProductsToTable() {
  let data = ``;
  for (let i = 0; i < productInCart.length; i++) {
    let product = await Product.findById(productInCart[i].id);
    if (!product) continue;

    data += `
      <tr>
        <td>${product.name}</td>
        <td><img width='100' src='${product.image}' alt=''></td>
        <td>${product.price}</td>
        <td>
          <button onclick='plusQuantity(${i})' class='btn btn-secondary'>+</button>
          <span class='mx-2'>${productInCart[i].quantity}</span>
          <button onclick='minusQuantity(${i}, ${productInCart[i].quantity})' class='btn btn-secondary'>-</button>
        </td>
        <td>${(productInCart[i].quantity * product.price.replace(/,/g, '')).toLocaleString()}</td>
        <td><button onclick='deleteProductInCart(${i})' class='btn btn-danger'>Delete</button></td>
      </tr>
    `;
  }
  document.getElementById('products-cart').innerHTML = data;
}

function plusQuantity (index) {
  productInCart[index] = {
    ...productInCart[index],
    quantity: ++productInCart[index].quantity
  };
  saveToLocalStorage();
  renderProductsToTable();
  totalMoney()
}

function minusQuantity (index, quantity) {
  if (quantity > 1) {
    productInCart[index] = {
      ...productInCart[index],
      quantity: --productInCart[index].quantity
    };
    saveToLocalStorage();
    renderProductsToTable();
    totalMoney()
  } else {
    alert('Quantity min is 1');
  }
}

async function deleteProductInCart(index) {
  let productId = productInCart[index].id;
  let product = await Product.findById(productId);
  if (!product) return;

  productInCart.splice(index, 1);
  // saveToLocalStorage();
  renderProductsToTable();
  totalMoney()
}

function totalMoney () {
  if (productInCart !== []) {
    let total = 0;
    for (let i = 0; i < productInCart.length; i++) {
      total += productInCart[i].quantity * productInCart[i].price.replace(/,/g, '');
    }
    document.getElementById("total-money").innerHTML = total.toLocaleString()
  }
}

function cartLoadPage () {
  renderProductsToTable();
  totalMoney();
}
