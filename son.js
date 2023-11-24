document.addEventListener("DOMContentLoaded", function () {

// 1. Dom dan elementlerı cagır
// filterProducts();

  const sepetButton = document.querySelector(".btn-secondary"); // sepet butonu

  let products = [];
  let cartItems = [];

  const productListContainer = document.getElementById("productListmain");
  const categoryElement = document.getElementById("category"); // Category yazısındakı span
  const searchInput = document.getElementById("searchInput"); // searchInput
  const sepetCount = document.getElementById("sepet"); // sepetteki sayı
  const totalAmount = document.querySelector(".offcanvas-footer h5:last-child"); // toplam tutarın miktarı
  const modalBody = document.querySelector('.modal-body')
  categoryElement.textContent ='All'
  // 2.API yi çek
  async function getAllProducts() {
    try {
      const response = await fetch(
        "https://anthonyfs.pythonanywhere.com/api/products/"
      );
// 2.1 responstakı kategorilere göre butonları olusturmak için kategorileri uniqueCategories arrayine atıyoruz
      if (response.ok) {
        products = await response.json();
      
        const uniqueCategories = products.reduce((categories, product) => {
          if (!categories.includes(product.category)) {
            categories.push(product.category);
          }
          return categories;
        }, []);
// Kategorilerin arrayine All diye bir sınıf ekliyoruz

        uniqueCategories.push("All");

// bu kategorilere göre butonları oluşturacak fonksiyonu çağırıyoruz       
        displayCategoryButtons(uniqueCategories);

// kategoriye göre ürünleri html e basan fonksiyonu çağırıyoruz        
        displayProducts(products);
      } else {
        console.error("Failed to fetch products:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

// kategoriye göre ürünleri html e basan fonksiyonu tarif ediyoruz
// products respons un json lasmıs hali bir array içinde 22 object var
  function displayProducts(products) {

// fonksiyon her çağırıldığında html i temizle ki yığılma olmasın    
    productListContainer.innerHTML = "";
// şimdi bu array i dolaşıp destuctring yapıcaz ve istediğimiz özellikleri seçicez ki onları html e basabilelim    
    products.forEach((product) => {
      const { id, image, title, description, price } = product;
     
// productCard ı ilk defa burada oluşturarak html e ürünleri ne şekilde basacağımızı ayarlıyoruz.Basacağımız yer olan productlistmain bir row section olduğu için col sınıfında bir div  
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

  // Event listener for search input bununla ekrandaki ürünleri süzeceğiz filter fonk ile
  searchInput.addEventListener("input", function () {
    filterProducts();
  });

  // Truncate fonksiyonunu yazıyoruz
  function truncateText(text, maxLength) {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  }

  // Ekrana kategori butonlarını basan fonksiyonu tarif edelim
  function displayCategoryButtons(uniqueCategories) {
   // html deki btns section una buttonları olusturup basacagız
    const btnsElement = document.getElementById("btns");
    btnsElement.innerHTML = "";
// yukarıda oluşturduğumz kategori arrayini tek tek geziyoruz boylece her butona ısmını verıcez ve rengini ayarlıyacagız
    uniqueCategories.forEach((category) => {
      const btn = document.createElement("button");
      btn.textContent = category;
// switch case ile renkleri ayarlıyoruz
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
        //butona her basışta category yazsının yanında ilgili kategori yazması için
        categoryElement.textContent = category;
        filterProducts();
      });

      btnsElement.appendChild(btn);
    });
  }

  // sımdı kategorıye gore ve inputa göre suzme fonksıyonunu tarıf edıyoruz
  function filterProducts() {

    const selectedCategory = categoryElement.textContent.toLowerCase();
    console.log(selectedCategory);
   
    const searchTerm = searchInput.value.toLowerCase();
    console.log(searchTerm);

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

    if (event.target.classList.contains("seeDetailsBtn")) {
      const productId = parseInt(event.target.getAttribute("data-product-id"));
      const productDetails = products.find((product) => product.id === productId);

      displayProductDetailsModal(productDetails);
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

    function displayProductDetailsModal(product) {
      const modalTitle = document.getElementById("exampleModalLabel");
      const modalBody = document.querySelector(".modalbody");
     
  
      modalTitle.textContent = product.title;
      
  
      const productDetailsHTML = `
      <div class='text-center'>
      <img src="${product.image}" class='p-2' height='250px' alt="..." >
      <p><strong>Description:</strong> ${product.description}</p>
        <p ><strong>Price:</strong> ${product.price} $</p>
       
      </div>
      `;
  
      modalBody.innerHTML = productDetailsHTML;
  
   
    }
  

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
