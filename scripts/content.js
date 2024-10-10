// we'll reuse these vars through out so they're kinda global
var listItems = [];
var totalItems = 0;


function brandedLogger(msg) {
    console.log('Prello: ', msg);
}

function findChildWithTestId(listElement, testId) {
    for (elem of listElement.children) {
        if (elem.dataset.testid == testId) {
            return elem;
        }
    }

}

function getListCards(listElement) {
    return findChildWithTestId(listElement, 'list-cards');
}

function enhanceHeader(listElement) {
    var headerDiv = findChildWithTestId(listElement, 'list-header');
    if (!headerDiv) {
        return;
    }

    var listCards = getListCards(listElement);
    if (!listCards) {
        return;
    }

    // check if this has a child of that type
    var headerName = headerDiv.firstChild;

    var h2Elem = findChildWithTestId(headerName, 'list-name');

    // if we already have a span then do not create one;
    var percentSpan;
    if (headerName.nextSibling.dataset.prelloType == "cards-percent") {
        percentSpan = headerName.nextSibling;
    }
    else {
        percentSpan = document.createElement('span');
        percentSpan.dataset.prelloType = "cards-percent";
        percentSpan.classList = h2Elem.classList;
        headerName.insertAdjacentElement('afterend', percentSpan);
    }

    var rawNum = listCards.childElementCount / totalItems;
    rawNum = rawNum * 100;
    percentSpan.textContent = rawNum.toFixed(1) + '%';

    // if we already have a counter element do not create one
    var counterParagraph;
    if(headerDiv.lastChild.dataset.prelloType == "cards-fractional")
    {
        counterParagraph = headerDiv.lastChild;
    }
    else {
        counterParagraph = document.createElement('p');
        counterParagraph.dataset.prelloType = "cards-fractional";
        // would be easier to copy a style but the paragraph may not exist
        counterParagraph.style="display:block; flex-basis:100%; margin:2px 0; padding-left:12px";
        headerDiv.appendChild(counterParagraph);
    }

    counterParagraph.textContent = listCards.childElementCount + "/" + totalItems + " cards";
}

function recomputeData() {
    brandedLogger("Recomputing cards");
    totalItems = 0;
    for (var list of listItems) {
        // get the list cards
        var listCards = getListCards(list);
        if (listCards) {
            totalItems += listCards.childElementCount;
        }
    }

    for (var list of listItems) {
        enhanceHeader(list);
    }
}

function runInitialSetup() {
    brandedLogger("Running initial setup");
    var elemsWithDataTestId = document.querySelectorAll('[data-testid]');
    var elems = Array.prototype.slice.call(elemsWithDataTestId)


    // find all the lists
    for (var elem of elems) {
        if (elem.dataset.testid == "list") {
            listItems.push(elem);
        }
    }
    brandedLogger("Found " + listItems.childElementCount + " lists");

    recomputeData();

    brandedLogger("Adding drop listener to cards");
    // add the drop listener
    for (var list of listItems) {
        // get the list cards
        var listCards = getListCards(list);
        for(var card of listCards.children)
        {
            card.addEventListener("drop", (evt) => {
                recomputeData();
            })
        }
    }
}


brandedLogger("Extension loaded, waiting for board to load.");

// give it a lil to load
setTimeout(runInitialSetup, 5000);
