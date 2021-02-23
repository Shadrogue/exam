var currentFoodProviders = [];
var currentFoodProviderIndex = 0;
var foodProvidersPageSize = 10;
var foodProvidersMaximumTableItems = 20;
var productMaximumAmount = 99;
var expressDeliveryPricePremium = 0.2;

function setupFoodProvidersSearch() {
    let searchButton = document.getElementById("SearchButton");
    searchButton.addEventListener("click", searchButtonClickListener);
    fillOptions("AreaSearchOptions", constants.areas);
    fillOptions("TypeSearchOptions", constants.types);
    fillOptions("DistrictSearchOptions", constants.districts);
    let foodProvidersTable = document.getElementById("FoodProviders");
    foodProvidersTable.addEventListener("click", selectButtonClickListener);
}

function selectButtonClickListener(event) {
    let button = event.target;
    if (button.tagName != "BUTTON") {
        return;
    }
    currentFoodProviderIndex = button.dataset.index;
    let currentFoodProvider = currentFoodProviders[currentFoodProviderIndex];
    setAdditionalOptions(currentFoodProvider);
    setMenuPrices(currentFoodProvider);
    setFoodProviderViewDetails(currentFoodProvider);
    setAdditionalOptionsDetails(currentFoodProvider);
    updateOrderTotal();
}

function setAdditionalOptionsDetails(foodProvider) {
    let additionalOptionsDetails = document.getElementById("AdditionalOptionsDetails");
    let socialPrivilegesOption = additionalOptionsDetails.querySelector(".order__social-privileges-option");
    let socialDiscountValue = socialPrivilegesOption.querySelector(".additionally-modal__value");
    socialDiscountValue.innerText = foodProvider.socialDiscount;
}

function setFoodProviderViewDetails(foodProvider) {
    let foodProviderDetails = document.getElementById("FoodProviderDetails");
    let nameValue = foodProviderDetails.querySelector(".order-modal-food-provider__name-value");
    nameValue.innerText = foodProvider.name;
    let areaValue = foodProviderDetails.querySelector(".order-modal-food-provider__area-value");
    areaValue.innerText = foodProvider.admArea;
    let districtValue = foodProviderDetails.querySelector(".order-modal-food-provider__district-value");
    districtValue.innerText = foodProvider.district;
    let addressValue = foodProviderDetails.querySelector(".order-modal-food-provider__address-value");
    addressValue.innerText = foodProvider.address;
    let ratingValue = foodProviderDetails.querySelector(".order-modal-food-provider__rating-value");
    ratingValue.innerText = foodProvider.rate;
}

function setAdditionalOptions(foodProvider) {
    let socialPrivilegesCheckBox = document.getElementById("SocialPrivilegesCheckBox");
    let socialPrivilegesCheckBoxLabel = document.getElementById("SocialPrivilegesCheckBoxLabel");
    if (foodProvider.socialPrivileges) {
        socialPrivilegesCheckBox.disabled = false;
        socialPrivilegesCheckBoxLabel.classList.remove("custom-checkbox__control-label_disabled");
    } else {
        socialPrivilegesCheckBox.checked = false;
        socialPrivilegesCheckBox.disabled = true;
        socialPrivilegesCheckBoxLabel.classList.add("custom-checkbox__control-label_disabled");
    }
}

function setMenuPrices(foodProvider) {
    let menuList = document.getElementById("MenuList");
    for (var i = 1; i <= 10; i++) {
        let menuItem = menuList.children[i - 1];
        let menuItemPrice = foodProvider["set_" + i];
        let menuItemPriceBlock = menuItem.querySelector(".order-sheet__price");
        let menuItemPriceValue = menuItemPriceBlock.querySelector(".order-sheet__price-value");
        menuItemPriceValue.innerText = menuItemPrice;
        if (menuItemPrice > 0) {
            makeElementVisible(menuItemPriceBlock);
            showElement(menuItem);
        } else {
            hideElement(menuItem);
        }
    }
}

function searchButtonClickListener(event) {
    let foodProvidersTable = document.getElementById("FoodProviders");
    let foodProvidersUnavailableMessage = document.getElementById("FoodProvidersUnavailableMessage");
    let foodProvidersNotFoundMessage = document.getElementById("FoodProvidersNotFoundMessage");
    fetch('http://exam-2020-1-api.std-400.ist.mospolytech.ru/api/data1').then(response => response.json()).then(foodProviders => {
        foodProviders = filterFoodProviders(foodProviders);
        if (foodProviders.length == 0) {
            showElement(foodProvidersNotFoundMessage);
            hideElement(foodProvidersTable);
            hideElement(foodProvidersUnavailableMessage);
            hideAlert("ErrorAlert", "FoodProvidersUnavailableAlert");
        } else {
            foodProviders.forEach(foodProvider => {
                if (!foodProvider.rate) foodProvider.rate = 0;
            });
            foodProviders.sort((a, b) => b.rate - a.rate);
            showFoodProviders(foodProviders);
            hideElement(foodProvidersNotFoundMessage);
            hideElement(foodProvidersUnavailableMessage);
            hideAlert("ErrorAlert", "FoodProvidersUnavailableAlert");
        }
    }).catch(error => {
        hideElement(foodProvidersTable);
        hideElement(foodProvidersNotFoundMessage);
        showElement(foodProvidersUnavailableMessage);
        showAlert("ErrorAlert", "FoodProvidersUnavailableAlert");
    });
    event.preventDefault();
}

function filterFoodProviders(foodProviders) {
    let typeSearchOptions = document.getElementById("TypeSearchOptions");
    let type = getSelectedOptionText(typeSearchOptions);
    if (type == constants.any) {
        type = null;
    }
    let areaSearchOptions = document.getElementById("AreaSearchOptions");
    let area = getSelectedOptionText(areaSearchOptions);
    if (area == constants.any) {
        area = null;
    }
    let districtSearchOptions = document.getElementById("DistrictSearchOptions");
    let district = getSelectedOptionText(districtSearchOptions);
    if (district == constants.any) {
        district = null;
    }
    let socialPrivilegesOptions = document.getElementById("SocialPrivilegesSearchOptions");
    let socialPrivileges = getSelectedOptionText(socialPrivilegesOptions);
    if (socialPrivileges == constants.notSelected) {
        socialPrivileges = null;
    } else if (socialPrivileges == constants.thereAre) {
        socialPrivileges = 1;
    } else {
        socialPrivileges = 0;
    }
    let filteredFoodProviders = [];
    for (var i = 0; i < foodProviders.length; i++) {
        var item = foodProviders[i];
        if (type != null && item.typeObject != type) {
            continue;
        }
        if (area != null && item.admArea != area) {
            continue;
        }
        if (district != null && item.district != district) {
            continue;
        }
        if (socialPrivileges != null && item.socialPrivileges != socialPrivileges) {
            continue;
        }
        filteredFoodProviders.push(item);
    }
    return filteredFoodProviders;
}

function showFoodProviders(foodProviders) {
    currentFoodProviders = foodProviders.slice(0, foodProvidersMaximumTableItems);
    $('#FoodProvidersPagination').bootpag({
        total: Math.ceil(currentFoodProviders.length / foodProvidersPageSize),
        page: 1,
        maxVisible: 2,
        leaps: false,
        next: "+",
        prev: "-",
        first: "←",
        last: '→',
        wrapClass: "main-switching__list switching__list pagination justify-content-center",
        activeClass: "flick-link-active",
    }).on("page", (event, pageNumber) => {
        showFoodProvidersPage(pageNumber);
    });
    applyMissingPaginationStyles();
    showFoodProvidersPage(1);
}

/*
<ul class="main-switching__list switching__list pagination justify-content-center">
    <li class="main-switching__item switching__item">
        <a class="main-switching__link flick-link" href="#">Предыдущая</a>
    </li>
    <li class="main-switching__item switching__item d-none d-sm-block">
        <a class="main-switching__link flick-link" href="#">1</a>
    </li>
    <li class="main-switching__item switching__item d-none d-sm-block">
        <a class="main-switching__link flick-link" href="#">2</a>
    </li>
    <li class="main-switching__item switching__item d-none d-sm-block">
        <a class="main-switching__link flick-link" href="#">3</a>
    </li>
    <li class="main-switching__item switching__item">
        <a class="main-switching__link flick-link" href="#">Следующая</a>
    </li>
</ul>
*/
function applyMissingPaginationStyles() {
    var paginationContainer = document.getElementById("FoodProvidersPagination");
    var listItems = Array.from(paginationContainer.querySelectorAll("li"));
    var pageNumberslistItems = listItems.slice(1, listItems.length - 1);
    pageNumberslistItems.forEach(listItem => {
        addClasses(listItem, ["main-switching__item", "switching__item", "d-none", "d-sm-block"])
    });
    var links = paginationContainer.querySelectorAll("a");
    links.forEach(link => {
        addClasses(link, ["main-switching__link", "flick-link"])
    });
}

function showFoodProvidersPage(pageNumber) {
    foodProvidersInPage = paginate(currentFoodProviders, foodProvidersPageSize, pageNumber);
    foodProviderIndex = 0 + (pageNumber - 1) * foodProvidersPageSize;
    let foodProviderItemTemplate = document.getElementById("FoodProviderItemTemplate");
    let foodProvidersTable = document.getElementById("FoodProviders");
    let foodProvidersTableBody = foodProvidersTable.querySelector("tbody");
    foodProviderItemTemplate.remove();
    removeChildren(foodProvidersTableBody);
    foodProvidersTableBody.appendChild(foodProviderItemTemplate);
    foodProvidersInPage.forEach(foodProvider => {
        let foodProviderItem = foodProviderItemTemplate.cloneNode(true);
        foodProviderItem.removeAttribute("id");
        foodProviderItem.querySelector(".food-provider__name").innerText = foodProvider.name;
        foodProviderItem.querySelector(".food-provider__type").innerText = foodProvider.typeObject;
        foodProviderItem.querySelector(".food-provider__address").innerText = foodProvider.address;
        foodProviderItem.querySelector("button").setAttribute("data-index", foodProviderIndex++);
        foodProvidersTableBody.appendChild(foodProviderItem);
        showElement(foodProviderItem);
    });
    showElement(foodProvidersTable);
}

function setupMenu() {
    let menuList = document.getElementById("MenuList");
    fetch('menu.json').then(response => response.json()).then(menuItemsData => {
        let menuItemTemplate = document.getElementById("MenuItemTemplate");
        menuItemsData.forEach(menuItemData => {
            let menuItem = menuItemTemplate.cloneNode(true);
            menuItem.removeAttribute("id");
            menuItem.classList.remove("d-none");
            menuItem.querySelector(".order-sheet__subtitle").innerText = menuItemData.name;
            menuItem.querySelector(".order-sheet__text").innerText = menuItemData.description;
            menuItem.querySelector(".order-sheet__img").src = menuItemData.imageUrl;
            menuList.appendChild(menuItem);
        });
        menuItemTemplate.remove();
    }).catch(error => {
        let menuList = document.querySelector(".order-sheet__list");
        hideElement(menuList);
        let menuUnavailableMessage = document.getElementById("MenuUnavailableMessage");
        showElement(menuUnavailableMessage);
        showAlert("ErrorAlert", "MenuUnavailableAlert");
    });
    menuList.addEventListener("click", productAmountButtonClickListener);
    menuList.addEventListener("focusout", productAmountInputFocusoutListener);
}

function productAmountInputFocusoutListener(event) {
    let input = event.target;
    if (input.tagName != "INPUT") {
        return;
    }
    updateOrderTotal();
}

function productAmountButtonClickListener(event) {
    let button = event.target;
    if (button.tagName != "BUTTON") {
        return;
    }
    if (!button.classList.contains("product__btn")) {
        return;
    }
    let productAmountBlock = button.parentElement;
    let productAmountValue = productAmountBlock.querySelector(".product__amount");
    let previousValue = parseIntOrDefault(productAmountValue.value, 0);
    let newValue = previousValue;
    if (button.classList.contains("product__btn_add") && previousValue < productMaximumAmount) {
        newValue = previousValue + 1;
    } else if (button.classList.contains("product__btn_remove") && previousValue > 0) {
        newValue = previousValue - 1;
    }
    if (newValue != previousValue) {
        productAmountValue.value = newValue;
        updateOrderTotal();
    }
}

function updateOrderTotal() {
    let currentFoodProvider = currentFoodProviders[currentFoodProviderIndex];
    if (currentFoodProvider) {
        let total = 0;
        let menuList = document.getElementById("MenuList");
        for (var i = 1; i <= 10; i++) {
            let menuItem = menuList.children[i - 1];
            let productPriceValue = menuItem.querySelector(".order-sheet__price-value");
            let productAmountValue = menuItem.querySelector(".product__amount");
            total += parseIntOrDefault(productPriceValue.innerText, 0) * parseIntOrDefault(productAmountValue.value, 0);
        }
        let socialPrivilegesCheckBox = document.getElementById("SocialPrivilegesCheckBox");
        if (currentFoodProvider.socialPrivileges && socialPrivilegesCheckBox.checked) {
            let discountMultiplier = (100 - currentFoodProvider.socialDiscount) / 100;
            total *= discountMultiplier;
        }
        let expressDeliveryCheckBox = document.getElementById("ExpressDeliveryCheckBox");
        if (expressDeliveryCheckBox.checked) {
            total *= (1 + expressDeliveryPricePremium);
        }
        let orderTotal = document.getElementById("OrderTotal");
        orderTotal.innerText = total.toFixed(2);
    }
}

function setupOptions() {
    let options = document.getElementById("AdditionalOptions");
    options.addEventListener("click", checkBoxClickListener);
}

function checkBoxClickListener() {
    let checkBox = event.target;
    if (checkBox.tagName != "INPUT") {
        return;
    }
    updateOrderTotal();
}

function setupOrder() {
    let orderButton = document.getElementById("OrderButton");
    orderButton.addEventListener("click", orderButtonClickListener);
    let orderSubmitButton = document.getElementById("OrderSubmitButton");
    orderSubmitButton.addEventListener("click", orderSubmitButtonClickListener);
}

function orderButtonClickListener() {
    updateOrderItems();
    setupAdditionalOptionsDetails();
    updateOrderFinalPrice();
}

function orderSubmitButtonClickListener() {
    showAlert("SuccessAlert", "OrderCreatedSuccessfullyAlert");
    setTimeout(scrollTop, 100);
}

function updateOrderItems() { 
    let menuList = document.getElementById("MenuList");
    let orderList = document.getElementById("OrderList");
    let orderItemTemplate = document.getElementById("OrderItemTemplate");
    orderItemTemplate.remove();
    removeChildren(orderList);
    orderList.appendChild(orderItemTemplate);
    for (var i = 1; i <= 10; i++) {
        let menuItem = menuList.children[i - 1];
        let productAmountValue = menuItem.querySelector(".product__amount");
        let productPriceValue = menuItem.querySelector(".order-sheet__price-value");
        let productAmount = parseIntOrDefault(productAmountValue.value, 0);
        let productPrice = parseIntOrDefault(productPriceValue.innerText, 0);
        if (productAmount > 0 && productPrice > 0) {
            let subTotal = productPrice * productAmount;
            let image = menuItem.querySelector(".order-sheet__img");
            let name = menuItem.querySelector(".order-sheet__subtitle");
            let orderItem = orderItemTemplate.cloneNode(true);
            orderItem.removeAttribute("id");
            orderItem.querySelector(".order__item-image").src = image.src;
            orderItem.querySelector(".order__item-name").innerText = name.innerText;
            orderItem.querySelector(".order__item-amount").innerText = productAmount;
            orderItem.querySelector(".order__item-price").innerText = productPrice;
            orderItem.querySelector(".order__item-price-summ").innerText = subTotal;
            orderList.appendChild(orderItem);
            showElement(orderItem);
        }
    }
}

function updateOrderFinalPrice() {
    let orderTotal = document.getElementById("OrderTotal");
    let deliveryPrice = document.getElementById("DeliveryPrice");
    let orderFinalPrice = document.getElementById("OrderFinalPrice");
    orderFinalPrice.innerText = parseFloat(orderTotal.innerText) + parseFloat(deliveryPrice.innerText);
}

function setupAdditionalOptionsDetails() {
    let additionalOptionsDetails = document.getElementById("AdditionalOptionsDetails");
    let socialPrivilegesCheckBox = document.getElementById("SocialPrivilegesCheckBox");
    let expressDeliveryCheckBox = document.getElementById("ExpressDeliveryCheckBox");
    let socialPrivilegesChecked = socialPrivilegesCheckBox.checked;
    let expressDeliveryChecked = expressDeliveryCheckBox.checked;
    if (socialPrivilegesChecked || expressDeliveryChecked) {
        let socialPrivilegesOption = additionalOptionsDetails.querySelector(".order__social-privileges-option");
        if (socialPrivilegesChecked) {
            showElement(socialPrivilegesOption);
        } else {
            hideElement(socialPrivilegesOption);
        }
        let expressDeliveryOption = additionalOptionsDetails.querySelector(".order__express-delivery-option");
        if (expressDeliveryChecked) {
            showElement(expressDeliveryOption);
        } else {
            hideElement(expressDeliveryOption);
        }
        showElement(additionalOptionsDetails);
    }
    else {
        hideElement(additionalOptionsDetails);
    }
}

window.addEventListener("load", () => {
    setupFoodProvidersSearch();
    setupMenu();
    setupOptions();
    setupOrder();
});

