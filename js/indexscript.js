const productList = document.getElementById("productList");
      const searchInput = document.getElementById("searchInput");

      // Arama inputuna bir "input" olay dinleyici ekleyin.
      searchInput.addEventListener("input", filterProducts);

      function filterProducts() {
        // Arama metnini alın.
        const searchValue = searchInput.value.toLowerCase();

        // Ürün listesindeki her ürünü kontrol edin ve arama metni ile eşleşiyor mu kontrol edin.
        for (const product of productList.getElementsByTagName("li")) {
          const productName = product
            .getAttribute("data-product-name")
            .toLowerCase();

          // Eğer ürün adı arama metniyle başlamıyorsa, ürünü gizleyin, aksi takdirde gösterin.
          if (productName.startsWith(searchValue)) {
            product.style.display = "block";
          } else {
            product.style.display = "none";
          }
        }
      }
      // localStorage'dan sepeti çekin
    var cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

// Sepet içeriğindeki ürün sayısını hesaplayın
var cartItemCount = 0;
for (var i = 0; i < cartItems.length; i++) {
    cartItemCount += cartItems[i].count || 1; 
}

// Sepet içeriğindeki ürün sayısını gösterin
var cartItemCountElement = document.getElementById("cartItemCount");
cartItemCountElement.textContent = cartItemCount;
//BURASI YENİ YAZILDI DÜZENLENECEK