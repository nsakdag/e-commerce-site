document.addEventListener("DOMContentLoaded", function () {
  const sepetButton = document.querySelector(".btn-secondary");
  let products = [];
  let cartItems = [];

  // DOM element selections related to product display
  const productListContainer = document.getElementById("productListmain");
  const categoryElement = document.getElementById("category");
  const searchInput = document.getElementById("searchInput");
  const sepetCount = document.getElementById("sepet");
  const totalAmount = document.querySelector(".offcanvas-footer h5:last-child");

  // Function to fetch all products from the API
  async function getAllProducts() {
    try {
      const response = await fetch(
        "https://anthonyfs.pythonanywhere.com/api/products/"
      );

      if (response.ok) {
        products = await response.json();
        const uniqueCategories = products.reduce((categories, product) => {
          if (!categories.includes(product.category)) {
            categories.push(product.category);
          }
          return categories;
        }, []);
        uniqueCategories.push("All");
        displayCategoryButtons(uniqueCategories);
        displayProducts(products);
      } else {
        console.error("Failed to fetch products:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // Function to display products in the UI
  function displayProducts(products) {
    productListContainer.innerHTML = "";

    products.forEach((product) => {
      const { id, image, title, description, price } = product;
      const productCard = document.createElement("div");
      productCard.className = "col mb-4";
      productCard.innerHTML = `
        <div class="card h-100">
          <img src="${image}" class="p-2" height="250px" alt="" />
          <div class="card-body">
            <h5 class="card-title line-clamp-1">${title}</h5>
            <p class="card-text line-clamp-3">${truncateText(
              description,
              100
            )}</p>
          </div>
          <div class="card-footer w-100 fw-bold d-flex justify-content-between gap-3">
            <span>Price:</span><span>Fiyat ${price}</span>
          </div>
          <div class="card-footer w-100 d-flex justify-content-center gap-3">
            <button class="btn btn-danger sepeteEkleBtn" data-product-id="${id}">Sepete Ekle</button>
            <button class="btn btn-primary seeDetailsBtn" data-bs-toggle="modal" data-bs-target="#exampleModal" data-product-id="${id}">
    See Details
 </button>
          </div>
        </div>
      `;

      productListContainer.appendChild(productCard);
    });
  }

  // Event listener for search input
  searchInput.addEventListener("input", function () {
    filterProducts();
  });

  // Function to truncate text to a specified length
  function truncateText(text, maxLength) {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }

  // Function to display category buttons
  function displayCategoryButtons(uniqueCategories) {
    const btnsElement = document.getElementById("btns");
    btnsElement.innerHTML = "";

    uniqueCategories.forEach((category) => {
      const btn = document.createElement("button");
      btn.textContent = category;

      switch (category.toLowerCase()) {
        case "all":
          btn.className = "btn btn-primary";
          break;
        case "electronics":
          btn.className = "btn btn-secondary";
          break;
        case "sports":
          btn.className = "btn btn-success";
          break;
        case "home":
          btn.className = "btn btn-info";
          break;
        case "shop":
          btn.className = "btn btn-warning";
          break;
        case "clothing":
          btn.className = "btn btn-danger";
          break;
        default:
          btn.className = "btn btn-primary";
      }

      btn.addEventListener("click", function () {
        categoryElement.textContent = category;
        filterProducts();
      });

      btnsElement.appendChild(btn);
    });
  }

  // Function to filter and display products based on category and search input
  function filterProducts() {
    const selectedCategory = categoryElement.textContent.toLowerCase();
    const searchTerm = searchInput.value.toLowerCase();

    const filteredProducts = products.filter((product) => {
      const isInSelectedCategory =
        selectedCategory === "all" ||
        product.category.toLowerCase() === selectedCategory;
      const matchesSearchTerm = product.title
        .toLowerCase()
        .includes(searchTerm);

      return isInSelectedCategory && matchesSearchTerm;
    });

    displayProducts(filteredProducts);
  }

  // Event listener for sepeteEkle buttons and cart buttons
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("sepeteEkleBtn")) {
      const productId = parseInt(event.target.dataset.productId);
      addToCart(productId);
    }

    if (
      event.target.classList.contains("btn-success") ||
      event.target.classList.contains("btn-warning") ||
      event.target.classList.contains("btn-danger")
    ) {
      const action = event.target.dataset.action;
      const productId = parseInt(event.target.dataset.productId);

      switch (action) {
        case "increase":
          increaseCartItem(productId);
          break;
        case "decrease":
          decreaseCartItem(productId);
          break;
        case "remove":
          removeCartItem(productId);
          break;
        default:
          break;
      }
    }
  });

  // Function to add a product to the cart
  function addToCart(productId) {
    const productToAdd = products.find((product) => product.id === productId);
    const existingItem = cartItems.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cartItems.push({ ...productToAdd, quantity: 1 });
    }

    updateCartUI();
    updateTotalAmountUI();
    updateCartCountUI();
  }

  // Function to increase the quantity of a cart item
  function increaseCartItem(productId) {
    const cartItem = cartItems.find((item) => item.id === productId);
    cartItem.quantity++;
    updateCartUI();
    updateTotalAmountUI();
    updateCartCountUI();
  }

  // Function to decrease the quantity of a cart item
  function decreaseCartItem(productId) {
    const cartItem = cartItems.find((item) => item.id === productId);
    if (cartItem.quantity > 1) {
      cartItem.quantity--;
    } else {
      removeCartItem(productId);
    }
    updateCartUI();
    updateTotalAmountUI();
    updateCartCountUI();
  }

  // Function to remove a cart item
  function removeCartItem(productId) {
    cartItems = cartItems.filter((item) => item.id !== productId);
    updateCartUI();
    updateTotalAmountUI();
    updateCartCountUI();
  }

  // Function to update the cart count in the UI
  function updateCartCountUI() {
    const cartCount = document.getElementById("sepet");
    let totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    cartCount.textContent = totalQuantity;
  }

  // Function to update the cart UI
  function updateCartUI() {
    const cartBody = document.querySelector(".offcanvas-body");

    cartBody.innerHTML = "";

    cartItems.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.className = "card mb-3";
      productCard.innerHTML = `
        <div class="row g-0">
          <div class="col-md-4">
            <img src="${product.image}" class="img-fluid rounded-start" alt="${product.title}">
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <h5 class="card-title">${product.title}</h5>
              <p class="card-text" id='miktar'>Miktar: ${product.quantity}</p>
              <p class="card-text">Fiyat: ${product.price} $</p>
              <button class="btn btn-success" data-action="increase" data-product-id="${product.id}">Artır</button>
              <button class="btn btn-warning" data-action="decrease" data-product-id="${product.id}">Eksilt</button>
              <button class="btn btn-danger" data-action="remove" data-product-id="${product.id}">Kaldır</button>
            </div>
          </div>
        </div>
      `;

      cartBody.appendChild(productCard);
    });
  }

  // Function to update the total amount in the cart UI
  function updateTotalAmountUI() {
    const totalAmountElement = document.querySelector(
      ".offcanvas-footer h5:last-child"
    );
    const totalAmountValue = calculateTotalAmount();
    totalAmountElement.innerText = `${totalAmountValue} $`;
  }

  // Function to calculate the total amount in the cart
  function calculateTotalAmount() {
    let total = 0;
    cartItems.forEach((item) => {
      total += item.price * item.quantity;
    });
    return total.toFixed(2);
  }

  // Call the function to fetch all products when the DOM is loaded
  getAllProducts();
});
