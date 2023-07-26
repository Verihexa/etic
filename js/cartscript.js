// localStorage'dan sepeti çekin
var cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
var cartList = document.getElementById("cartList");

// Sepet içeriğini listeleyin ve toplam fiyatı hesaplayın
function showCartItems() {
    cartList.innerHTML = ""; // Sepet içeriğini temizle

    // Ürünleri gruplayarak listeleyin
    var groupedCartItems = groupCartItems(cartItems);

    for (var i = 0; i < groupedCartItems.length; i++) {
        var product = groupedCartItems[i];
        var productName = product.name;
        var productPrice = product.price;
        var productCount = product.count;

        // Ürünü sepette listele
        var listItem = document.createElement("li");
        listItem.textContent = "Ürün Adı: " + productName + ", Fiyat: " + productPrice + " TL, Adet: " + productCount;

        // Silme butonunu oluştur
        var deleteButton = document.createElement("button");
        deleteButton.textContent = "Sil";
        deleteButton.setAttribute("data-id", product.id);
        deleteButton.onclick = function () {
            var productId = this.getAttribute("data-id");
            deleteOneProductFromCart(productId);
        };

        listItem.appendChild(deleteButton);
        cartList.appendChild(listItem);
    }

    // Toplam fiyatı hesapla ve göster
    var totalPrice = calculateTotalPrice(groupedCartItems);
    var totalPriceElement = document.getElementById("totalPrice");
    totalPriceElement.textContent = totalPrice + " TL";

    // WhatsApp butonunu göster veya gizle
    var whatsappButton = document.getElementById("whatsappButton");
    whatsappButton.style.display = cartItems.length > 0 ? "inline-block" : "none";
}

// Sepet içeriğini gruplayarak listeleyin
function groupCartItems(items) {
    var groupedItems = [];
    var itemIdMap = new Map(); // Ürünleri gruplamak için Map kullanın

    items.forEach(function (item) {
        if (!itemIdMap.has(item.id)) {
            itemIdMap.set(item.id, { ...item, count: 1 }); // Yeni ürün ekle
        } else {
            var existingItem = itemIdMap.get(item.id);
            existingItem.count += 1; // Ürün adedini artır
        }
    });

    groupedItems = Array.from(itemIdMap.values()); // Map'teki değerleri alın ve gruplandırılmış ürünleri oluşturun

    return groupedItems;
}

// Sepetteki bir ürünü sil
function deleteOneProductFromCart(productId) {
    var indexToDelete = -1;
    for (var i = 0; i < cartItems.length; i++) {
        if (cartItems[i].id === productId) {
            indexToDelete = i;
            break;
        }
    }

    if (indexToDelete !== -1) {
        cartItems.splice(indexToDelete, 1);
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        showCartItems(); // Sepet içeriğini güncelle
    }
}

// Toplam fiyatı hesapla
function calculateTotalPrice(items) {
    var totalPrice = 0;
    for (var i = 0; i < items.length; i++) {
        totalPrice += items[i].price * items[i].count;
    }
    return totalPrice;
}

// Sepetteki ürünleri göster
showCartItems();

// WhatsApp iletişim linki oluştur ve butona ekle
var phoneNumber = "+905552000239";
var preFilledMessage = getCartItemsText(cartItems);
var encodedMessage = encodeURIComponent(preFilledMessage);

var whatsappButton = document.getElementById("whatsappButton");
whatsappButton.href = "https://wa.me/" + phoneNumber + "?text=" + encodedMessage;

// Sepet içeriğini sadece ürün adları ve adetleri olarak alın
function getCartItemsText(items) {
    var cartItemsText = "Sepetteki Ürünler:\n";

    // Aynı ürünleri gruplandırın ve adetlerini birleştirin
    var groupedItems = groupCartItems(items);

    groupedItems.forEach(function (product) {
        var productName = product.name;
        var productCount = product.count;
        cartItemsText += "- " + productName + ", Adet: " + productCount + "\n";
    });

    var totalPrice = calculateTotalPrice(groupedItems);
    cartItemsText += "Toplam Fiyat: " + totalPrice + " TL";
    return cartItemsText;
}