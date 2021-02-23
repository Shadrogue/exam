function parseIntOrDefault(string, defaultValue) {
    let value = parseInt(string);
    if (isNaN(value)) {
        return defaultValue;
    }
    return value;
}

function parseDateOrNull(string) {
    let value = Date.parse(string);
    if (isNaN(value)) {
        return null;
    }
    return new Date(value);
}

function showElement(element) {
    element.classList.remove("d-none");
}

function makeElementVisible(element) {
    element.classList.remove("invisible");
}

function hideElement(element) {
    element.classList.add("d-none");
}

function getElementOrParentWithTagName(element, requestedTagName) {
    do {
        if (element.tagName == requestedTagName) {
            return element;
        }
        element = element.parentNode;
    } while (element.parentNode);
    return null;
}

function removeChildren(element) {
    while (element.firstChild) {
        element.firstChild.remove();
    }
}

function addClasses(element, classes) {
    classes.forEach(cssClass => {
        element.classList.add(cssClass);
    })
}

function paginate(array, page_size, page_number) {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
}

function hideAlert(alertId, alertMessageId) {
    let alert = document.getElementById(alertId);
    let alertMessage = document.getElementById(alertMessageId);
    hideElement(alert);
    hideElement(alertMessage);
}

function showAlert(alertId, alertMessageId) {
    let alert = document.getElementById(alertId);
    let alertMessage = document.getElementById(alertMessageId);
    showElement(alertMessage);
    showElement(alert);
    setTimeout(() => hideAlert(alertId, alertMessageId), 5000);
}

function scrollTop() {
    document.documentElement.scrollTop = 0;
}

function getSelectedOptionText(dropDownList) {
    return dropDownList.options[dropDownList.selectedIndex].text;
}

function fillOptions(dropDownListId, values) {
    let options = document.getElementById(dropDownListId);
    let optionTemplate = options.querySelector("option");
    for (var i = 0; i < values.length; i++) {
        var option = optionTemplate.cloneNode(true);
        option.innerText = values[i];
        options.appendChild(option);
    }
}

function removeEffects(selector, eventList) {
    let selectors = document.querySelectorAll(selector);
    selectors.forEach((el) => el.addEventListener(eventList, () => {
        document.activeElement.blur();
    }));
}
removeEffects('.btn-hover', 'mouseout');