var currentFoodProviders = [];
var currentFoodProviderIndex = 0;
var currentFoodProvidersPage = 1;
var defaultMaximumSeatsCount = 100;
var foodProvidersPageSize = 10;
var foodProvidersMaximumTableItems = 100;

function setupFoodProvidersSearch() {
    let searchButton = document.getElementById("SearchButton");
    searchButton.addEventListener("click", searchButtonClickListener);
    setupDatePickers();
    fillOptions("AreaSearchOptions", constants.areas);
    fillOptions("TypeSearchOptions", constants.types);
    fillOptions("DistrictSearchOptions", constants.districts);
    let foodProvidersTable = document.getElementById("FoodProviders");
    foodProvidersTable.addEventListener("click", buttonClickListener);
}

function setupDatePickers() {
    let datepickerSettings = {
        format: 'yyyy-mm-dd',
        language: "ru",
        autoclose: true,
    };
    let minimumCreationDate = $("#MinimumCreationDate");
    minimumCreationDate.datepicker(datepickerSettings);
    minimumCreationDate[0].addEventListener("click", (event) => {
        minimumCreationDate.datepicker("show");
    });
    minimumCreationDate[0].addEventListener("change", (event) => {
        minimumCreationDate.datepicker('update', event.target.value);
        minimumCreationDate.datepicker("hide");
    });
    let maximumCreationDate = $("#MaximumCreationDate");
    maximumCreationDate.datepicker(datepickerSettings);
    maximumCreationDate[0].addEventListener("click", (event) => {
        maximumCreationDate.datepicker("show");
    });
    maximumCreationDate[0].addEventListener("change", (event) => {
        maximumCreationDate.datepicker('update', event.target.value);
        maximumCreationDate.datepicker("hide");
    });
}

function searchButtonClickListener(event) {
    currentFoodProvidersPage = 1;
    searchFoodProviders();
    event.preventDefault();
}

function searchFoodProviders() {
    let foodProvidersTable = document.getElementById("FoodProviders");
    let foodProvidersUnavailableMessage = document.getElementById("FoodProvidersUnavailableMessage");
    let foodProvidersNotFoundMessage = document.getElementById("FoodProvidersNotFoundMessage");
    fetch('http://exam-2020-1-api.std-400.ist.mospolytech.ru/api/data1').then(response => response.json()).then(foodProviders => {
        foodProviders = filterFoodProviders(foodProviders);
        if (foodProviders.length == 0) {
            showElement(foodProvidersNotFoundMessage);
            hideElement(foodProvidersTable);
            hideElement(foodProvidersUnavailableMessage);
        } else {
            foodProviders.forEach(foodProvider => {
                if (!foodProvider.rate) {
                    foodProvider.rate = 0;
                }
            });
            foodProviders.sort((a, b) => b.rate - a.rate);
            showFoodProviders(foodProviders);
            hideElement(foodProvidersNotFoundMessage);
            hideElement(foodProvidersUnavailableMessage);
        }
    }).catch(error => {
        hideElement(foodProvidersTable);
        hideElement(foodProvidersNotFoundMessage);
        showElement(foodProvidersUnavailableMessage);
    });
}

function showFoodProviders(foodProviders) {
    currentFoodProviders = foodProviders.slice(0, foodProvidersMaximumTableItems);
    $('#FoodProvidersPagination').bootpag({
        total: Math.ceil(currentFoodProviders.length / foodProvidersPageSize),
        page: currentFoodProvidersPage,
        maxVisible: 2,
        leaps: false,
        next: "+",
        prev: "-",
        first: "←",
        last: '→',
        wrapClass: "admin-switching__list switching__list pagination justify-content-center",
        activeClass: "flick-link-active",
    }).on("page", (event, pageNumber) => {
        currentFoodProvidersPage = pageNumber;
        showFoodProvidersPage(pageNumber);
    });
    applyMissingPaginationStyles();
    showFoodProvidersPage(1);
}

function applyMissingPaginationStyles() {
    var paginationContainer = document.getElementById("FoodProvidersPagination");
    var listItems = Array.from(paginationContainer.querySelectorAll("li"));
    var pageNumberslistItems = listItems.slice(1, listItems.length - 1);
    pageNumberslistItems.forEach(listItem => {
        addClasses(listItem, ["admin-switching__item", "switching__item", "d-none", "d-sm-block"])
    });
    var links = paginationContainer.querySelectorAll("a");
    links.forEach(link => {
        addClasses(link, ["admin-switching__link", "flick-link"])
    });
}

function buttonClickListener(event) {
    let button = getElementOrParentWithTagName(event.target, "BUTTON");
    if (!button) {
        return;
    }
    currentFoodProviderIndex = button.dataset.index;
    if (button.classList.contains("admin-table-btn-view")) {
        showViewModal();
    } else if (button.classList.contains("admin-table-btn-edit")) {
        showEditModal();
    } else if (button.classList.contains("admin-table-btn-delete")) {
        showDeleteModal();
    }
}

function showEditModal() {
    let currentFoodProvider = currentFoodProviders[currentFoodProviderIndex];
    var createForm = document.getElementById("EditForm");
    createForm.action = "http://exam-2020-1-api.std-400.ist.mospolytech.ru/api/data1/" + currentFoodProvider.id;
    createForm.method = "get"; // PUT method is not supported in form element
    let titleLabel = document.getElementById("EditModalLabel");
    let editTitleLabel = titleLabel.querySelector(".modal-title__edit-title");
    let creationTitleLabel = titleLabel.querySelector(".modal-title__creation-title");
    showElement(editTitleLabel);
    hideElement(creationTitleLabel);
    setFoodProviderEditDetails(currentFoodProvider);
}

function setFoodProviderEditDetails(foodProvider) {
    var editModal = document.getElementById("EditModal");
    let nameField = editModal.querySelector(".admin-list-editor__name");
    nameField.value = foodProvider.name;
    let networkField = editModal.querySelector(".admin-list-editor__network");
    networkField.value = foodProvider.isNetObject;
    let operatingCompanyField = editModal.querySelector(".admin-list-editor__operating-company");
    operatingCompanyField.value = foodProvider.operatingCompany;
    let typeField = editModal.querySelector(".admin-list-editor__type");
    typeField.value = foodProvider.typeObject; // select
    let areaField = editModal.querySelector(".admin-list-editor__area");
    areaField.value = foodProvider.admArea; // select
    let districtField = editModal.querySelector(".admin-list-editor__district");
    districtField.value = foodProvider.district; // select
    let addressField = editModal.querySelector(".admin-list-editor__address");
    addressField.value = foodProvider.address;
    let seatsCountField = editModal.querySelector(".admin-list-editor__seats-count");
    seatsCountField.value = foodProvider.seatsCount;
    let socialPrivilegesField = editModal.querySelector(".admin-list-editor__social-privileges");
    socialPrivilegesField.value = foodProvider.socialPrivileges;
    let phoneField = editModal.querySelector(".admin-list-editor__phone");
    phoneField.value = foodProvider.publicPhone;
    for (var i = 1; i <= 10; i++) {
        let menuItemPrice = foodProvider["set_" + i];
        let menuItemPriceValue = document.getElementById("MenuItem" + i + "PriceField");
        menuItemPriceValue.value = menuItemPrice;
    }
}

function showViewModal() {
    let currentFoodProvider = currentFoodProviders[currentFoodProviderIndex];
    fetch('http://exam-2020-1-api.std-400.ist.mospolytech.ru/api/data1/' + currentFoodProvider.id).then(response => response.json()).then(foodProvider => {
        setFoodProviderViewDetails(foodProvider);
        hideAlert("ErrorAlert", "FoodProvidersAdministrationUnavailableAlert");
        searchFoodProviders();
    }).catch(error => {
        $('#ViewModal').modal('hide');
        showAlert("ErrorAlert", "FoodProvidersAdministrationUnavailableAlert");
        scrollTop();
    });
}

function setFoodProviderViewDetails(foodProvider) {
    var viewModal = document.getElementById("ViewModal");
    let viewModalLabel = document.getElementById("ViewModalLabel");
    viewModalLabel.innerText = foodProvider.name;
    let nameField = viewModal.querySelector(".viewer__name");
    nameField.innerText = foodProvider.name;
    let networkField = viewModal.querySelector(".viewer__network");
    networkField.innerText = foodProvider.isNetObject === 1 ? constants.yes : constants.no;
    let operatingCompanyField = viewModal.querySelector(".viewer__operating-company");
    operatingCompanyField.innerText = foodProvider.operatingCompany;
    let typeField = viewModal.querySelector(".viewer__type");
    typeField.innerText = foodProvider.typeObject;
    let areaField = viewModal.querySelector(".viewer__area");
    areaField.innerText = foodProvider.admArea;
    let districtField = viewModal.querySelector(".viewer__district");
    districtField.innerText = foodProvider.district;
    let addressField = viewModal.querySelector(".viewer__address");
    addressField.innerText = foodProvider.address;
    let seatsCountField = viewModal.querySelector(".viewer__seats-count");
    seatsCountField.innerText = foodProvider.seatsCount;
    let socialPrivilegesField = viewModal.querySelector(".viewer__social-privileges");
    socialPrivilegesField.innerText = foodProvider.socialPrivileges === 1 ? constants.thereAre : constants.thereIsNo;
    let phoneField = viewModal.querySelector(".viewer__phone");
    phoneField.innerText = foodProvider.publicPhone;
}

function showDeleteModal() {
    let currentFoodProvider = currentFoodProviders[currentFoodProviderIndex];
    var deleteModal = document.getElementById("DeleteModal");
    var foodProviderNameValue = deleteModal.querySelector(".del-event__food-provider-name");
    foodProviderNameValue.innerText = currentFoodProvider.name;
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
        foodProviderItem.classList.remove("d-none");
        foodProviderItem.querySelector(".food-provider__name").innerText = foodProvider.name;
        foodProviderItem.querySelector(".food-provider__type").innerText = foodProvider.typeObject;
        foodProviderItem.querySelector(".food-provider__address").innerText = foodProvider.address;
        let index = foodProviderIndex++;
        let buttons = foodProviderItem.querySelectorAll("button");
        buttons.forEach(button => button.setAttribute("data-index", index));
        foodProvidersTableBody.appendChild(foodProviderItem);
    });
    showElement(foodProvidersTable);
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
    let networkOptions = document.getElementById("NetworkSearchOptions");
    let network = getSelectedOptionText(networkOptions)
    if (network == constants.notSelected) {
        network = null;
    } else if (network == constants.yes) {
        network = 1;
    } else {
        network = 0;
    }
    let namePatternField = document.getElementById("NamePattern");
    let namePattern = namePatternField.value.toLowerCase();
    let minimumSeatsCountField = document.getElementById("MinimumSeatsCount");
    let minimumSeatsCount = parseIntOrDefault(minimumSeatsCountField.value, 0);
    let maximumSeatsCountField = document.getElementById("MaximumSeatsCount");
    let maximumSeatsCount = parseIntOrDefault(maximumSeatsCountField.value, defaultMaximumSeatsCount);
    let minimumCreationDateField = document.getElementById("MinimumCreationDate");
    let minimumCreationDate = parseDateOrNull(minimumCreationDateField.value);
    let maximumCreationDateField = document.getElementById("MaximumCreationDate");
    let maximumCreationDate = parseDateOrNull(maximumCreationDateField.value);
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
        if (network != null && item.isNetObject != network) {
            continue;
        }
        if (minimumSeatsCount > 0 && item.seatsCount < minimumSeatsCount) {
            continue;
        }
        if (maximumSeatsCount > 0 && item.seatsCount > maximumSeatsCount) {
            continue;
        }
        if (minimumCreationDate != null && (item.created_at == null || item.created_at < minimumCreationDate)) {
            continue;
        }
        if (maximumCreationDate != null && (item.created_at == null || item.created_at > maximumCreationDate)) {
            continue;
        }
        if (namePattern && !item.name.toLowerCase().includes(namePattern)) {
            continue;
        }
        filteredFoodProviders.push(item);
    }
    return filteredFoodProviders;
}

function setupDeleteModal() {
    let deleteConfirmationButton = document.getElementById("FoodProviderDeleteButton");
    deleteConfirmationButton.addEventListener("click", foodProviderDeleteButtonClickListener)
}

function foodProviderDeleteButtonClickListener() {
    let currentFoodProvider = currentFoodProviders[currentFoodProviderIndex];
    fetch("http://exam-2020-1-api.std-400.ist.mospolytech.ru/api/data1/" + currentFoodProvider.id, {
        method: "DELETE",
    }).then(response => response.json()).then(response => {
        showAlert("SuccessAlert", "FoodProviderDeletedSuccessfullyAlert");
        hideAlert("ErrorAlert", "FoodProvidersAdministrationUnavailableAlert");
        scrollTop();
        searchFoodProviders();
    }).catch(error => {
        hideAlert("SuccessAlert", "FoodProviderDeletedSuccessfullyAlert");
        showAlert("ErrorAlert", "FoodProvidersAdministrationUnavailableAlert");
        scrollTop();
    });
}

function setupFoodProviderCreationButtion() {
    var createFoodProviderButton = document.getElementById("CreateFoodProviderButton");
    createFoodProviderButton.addEventListener("click", createFoodProviderButtonClickListener);
}

function createFoodProviderButtonClickListener() {
    let createForm = document.getElementById("EditForm");
    createForm.action = "http://exam-2020-1-api.std-400.ist.mospolytech.ru/api/data1";
    createForm.method = "post";
    let titleLabel = document.getElementById("EditModalLabel");
    let editTitleLabel = titleLabel.querySelector(".modal-title__edit-title");
    let creationTitleLabel = titleLabel.querySelector(".modal-title__creation-title");
    hideElement(editTitleLabel);
    showElement(creationTitleLabel);
}

function setupEditModal() {
    let submitButton = document.getElementById("EditFormSubmitButtion");
    submitButton.addEventListener("click", submitButtonClickListener);
    fillOptions("AreaEditOptions", constants.areas);
    fillOptions("TypeEditOptions", constants.types);
    fillOptions("DistrictEditOptions", constants.districts);
}

function submitButtonClickListener() {
    let editForm = document.getElementById("EditForm");
    data = new URLSearchParams(new FormData(editForm));
    let method = editForm.method == "post" ? "post" : "put"; // PUT method is not supported in form element
    fetch(editForm.action, {
        method: method,
        body: data,
    }).then(response => {
        return response.json();
    }).then(response => {
        if (method == "post") {
            showAlert("SuccessAlert", "FoodProviderCreatedSuccessfullyAlert");
        } else {
            showAlert("SuccessAlert", "FoodProviderUpdatedSuccessfullyAlert");
        }
        hideAlert("ErrorAlert", "FoodProvidersAdministrationUnavailableAlert");
        scrollTop();
        searchFoodProviders();
    }).catch(error => {
        if (method == "post") {
            hideAlert("SuccessAlert", "FoodProviderCreatedSuccessfullyAlert");
        } else {
            hideAlert("SuccessAlert", "FoodProviderUpdatedSuccessfullyAlert");
        }
        showAlert("ErrorAlert", "FoodProvidersAdministrationUnavailableAlert");
        scrollTop();
    });
}

window.addEventListener("load", () => {
    setupFoodProvidersSearch();
    setupDeleteModal();
    setupFoodProviderCreationButtion();
    setupEditModal();
});
