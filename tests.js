const _noMatchingListingsHtml = 
  `<p class="userMessage">We could not find any listings with that criteria. Please try again with different criteria!</p>`;

const _listingTemplate =
  `<div class="card listing">
    <img src="{{imageSrc}}" class="card-img-top">
    <p class="city-text">{{city}}</p>
    <div class="card-body">
      <h5 class="card-title">{{title}}</h5>
    </div>
    <div class="card-footer">
      <span class="stay-type">{{stay-type}}</span>
      <span class="price">\${{price}}</span>
    </div>
  </div>`;

const _buttonElement = 
  document.querySelector("#search-button");

const _searchInputElement = 
  document.querySelector("#location-input");

const _listingContainerElement = 
  document.getElementById("listing-container");

const _filterContainerElement = 
  document.querySelector("#filter-container");

const _minRangeElement = 
  document.getElementById("min-price-range");

let _maxRangeElement = 
  document.getElementById("max-price-range");

const SearchResults = {
  shownListings: [],
  typeIndices: [],
  cityIndices: [],
  cityFilter: undefined,
  typeFilter: ['entire-place', 'private-room', 'shared-room'],
  minPriceFilter: 0,
  maxPriceFilter: 1000,
  update: function () {
    this.shownListings = [...listings];
    this.filterByCity();
    this.filterByTypes();
    this.filterByPrice();
    this.displayListings();
  },

  filterByCity: function () {
    this.cityIndices = [];
    if (this.cityFilter == undefined) {
      return;
    }
    let indices = filterByCity(this.cityFilter, 
      listings.map(l => l.city));
    if (!this.validateListingIndices(indices)) {
      return;
    }
    this.shownListings = [];
    for (let i = 0; i < indices.length; i++) {
      this.shownListings.push(listings[indices[i]]);
      this.cityIndices.push(indices[i]);
    }
  },

  filterByTypes: function () {
    this.typeIndices = []
    let indices = 
      filterByTypes(this.typeFilter, this.shownListings.map(l => l.type));
    if (!this.validateListingIndices(indices)) {
      return;
    }  
    this.shownListings = [];
    for (let i = 0; i < indices.length; i++) {
      this.typeIndices.push(indices[i]);  
    }
  },

  filterByPrice: function() {
    let tempPriceArray = []
    for (let i = 0; i <  this.typeIndices.length; i++) {
      tempPriceArray.push(listings[this.typeIndices[i]].price)
    }
    let indices =
      filterByPrice(this.minPriceFilter, this.maxPriceFilter, tempPriceArray);
    if (!this.validateListingIndices(indices)) {
      return;
    }
    this.shownListings = [];
    for (let i = 0; i < indices.length; i++) {
      this.shownListings.push(indices[i]);
    }
  },
  displayListings: function() {
    _listingContainerElement.innerHTML = "";
    _filterContainerElement.classList.remove("hidden");
    if (this.shownListings.length == 0) {
      _listingContainerElement.innerHTML = _noMatchingListingsHtml;
      return;
    }
    for (let i = 0; i < this.shownListings.length; i++) {
      let type = listings[this.cityIndices[this.typeIndices[this.shownListings[i]]]].type;
      if (type == "entire-place") {
        type = "Entire Place";
      } else if (type == "private-room") {
        type = "Private Room";
      } else {
        type = "Shared Room";
      }
      
      let newHtml = 
        _listingTemplate
          .replaceAll("{{imageSrc}}", 
            listings[this.cityIndices[this.typeIndices[this.shownListings[i]]]].img)
          .replaceAll("{{title}}", 
            listings[this.cityIndices[this.typeIndices[this.shownListings[i]]]].title)
          .replaceAll("{{price}}", 
            listings[this.cityIndices[this.typeIndices[this.shownListings[i]]]].price)
          .replaceAll("{{city}}", 
            listings[this.cityIndices[this.typeIndices[this.shownListings[i]]]].city)
          .replaceAll("{{stay-type}}", type);
      
      _listingContainerElement
        .insertAdjacentHTML('beforeend', newHtml);
    }
  },
  validateListingIndices: function(indices) {
    if (!Array.isArray(indices)) {
      return false;
    }
    
    for (let i = 0; i < indices.length; i++) {
      if (typeof(indices[i]) != "number" || 
          indices[i] < 0 ) {
        return false;
      }
    }

    return true;
  }
}

_buttonElement.addEventListener("click", () => {
  SearchResults.cityFilter = _searchInputElement.value;
  SearchResults.update();
});

_searchInputElement.addEventListener("keyup", (e) => {
  if (e.code != "Enter") {
    return;
  }

  SearchResults.cityFilter = _searchInputElement.value;
  SearchResults.update();
});

function _toggleType(typeOfPlace) {
  let checked = 
    document.querySelector(`.${typeOfPlace}`);
  let unchecked = 
    document.querySelector(`.unchecked-${typeOfPlace}`);
  let index = SearchResults.typeFilter.findIndex(type => type == typeOfPlace);
  
  if (index < 0) {
    SearchResults.typeFilter.push(typeOfPlace);
    checked.classList.add("show");
    checked.classList.remove("hide");
    unchecked.classList.remove("show");
    unchecked.classList.add("hide");

  } else {
    SearchResults.typeFilter.splice(index, 1);
    checked.classList.add("hide");
    checked.classList.remove("show");
    unchecked.classList.add("show");
    unchecked.classList.remove("hide");
  }

  SearchResults.update();
  return
}

_minRangeElement.addEventListener("input", () => {
  SearchResults.minPriceFilter = _minRangeElement.value;
  SearchResults.update();
});

_maxRangeElement.addEventListener("input", () => {
  SearchResults.maxPriceFilter = _maxRangeElement.value;
  SearchResults.update();
});


/* Tests */

class FunctionAnalysis {
  constructor(functionString) {
    try {
      this.functionString = functionString;
      this.rootNode = 
      esprima
        .parseScript(functionString, 
          {
            range: true,
            tolerant: true,
          });
      
      // Verify this is a function and have access to the body.
      if (this.rootNode.body[0].type != "FunctionDeclaration" || 
        this.rootNode.body[0].body.type != "BlockStatement" ||
        !Array.isArray(this.rootNode.body[0].body.body)) {
          throw "Syntax tree doesn't look as we expect.";
      }
      this.functionBody = this.rootNode.body[0].body.body;
      this.validSyntax = true;
    } catch {
      this.validSyntax = false;
      return;
    }  
  }

  findArrayDeclarations(node) {
    let body = this.functionBody;
    if (Array.isArray(node?.body?.body)) {
      body = node.body.body;
    }

    let matches = body.filter(s => {
      return s.type == "VariableDeclaration" &&
        s.declarations[0]?.init?.type == "ArrayExpression";
    });

    return matches;
  }

  findReturnDeclaration(node) {
    let body = this.functionBody;
    if (Array.isArray(node?.body?.body)) {
      body = node.body.body;
    }

    let matches = body.filter(s => {
      return s.type == "ReturnStatement";
    });

    return matches;
  }

  findLoops(node) {
    let body = this.functionBody;
    if (Array.isArray(node?.body?.body)) {
      body = node.body.body;
    }

    let matches = body
      .filter(s => s.type == "ForStatement" || 
                   s.type == "WhileStatement" ||
                   s.type == "DoWhileStatement");
    return matches;
  }

  findConditionals(node) {
    let body = this.functionBody;
    if (Array.isArray(node?.body?.body)) {
      body = node.body.body;
    }

    let matches = body
      .filter(s => s.type == "IfStatement");
    return matches;
  }

  getText(node) {
    if (!node) {
      return this.functionString;
    }

    return this.functionString
      .slice(node.range[0], node.range[1]);
  }
}




banner();
////////////////////////////////////////


  // no declaration of an empty array.

function cityAnalysis() {
  let f = new FunctionAnalysis(String(filterByCity));
  console.log(cityErrorMessage)

  let arrayDeclarationStatements = f.findArrayDeclarations();
  if (arrayDeclarationStatements.length === 0 || 
      arrayDeclarationStatements[0].declarations[0].init.elements.length !== 0){
      console.log(`\n`,constructHintMessage(1, "We are detecting that you may not have declared an empty array variable. Make sure you initialized an empty array and assigned it to a variable. Later we will use it to store our matching indices.", RESOURCES.arrays));
    return false;
  } 

// no loop statement.
  let loopStatements = f.findLoops();

  if (loopStatements.length === 0) {
    console.log(`\n`,constructHintMessage(2, `We are detecting that you may not have a loop. Create a ${COLOR_CODE.bright}for loop${COLOR_CODE.reset}${COLOR_CODE.cyan}. The ${COLOR_CODE.bright}for loop${COLOR_CODE.reset}${COLOR_CODE.cyan} should execute once for every index in the listingCityArray. The index of the for loop should also increment by one each time the code is ran. Do you remeber the the method that will give you the length of an array? `, RESOURCES.arrays));
    return false;
  }

  let conditionalStatements = f.findConditionals(loopStatements[0]);
  // no conditional within the first loop.
  if (conditionalStatements.length === 0) {
    console.log(`\n`, constructHintMessage(3, `We are detecting that you may not have a conditional to check for matches. Create an ${COLOR_CODE.bright}if Statement${COLOR_CODE.reset}${COLOR_CODE.cyan} inside of your ${COLOR_CODE.bright}for loop${COLOR_CODE.reset}${COLOR_CODE.cyan} that will compare targetCity to each index of listingCityArray, and run your code block if that comparson equates to true.`, RESOURCES.conditionals))
    return false;
  }

// no '.push' within the first loop.
  if (!f.getText(loopStatements[0]).includes(".push")) {
    console.log(f.getText(loopStatements[0]))
    console.log(`\n`,constructHintMessage(4,`We are detecting that you may not be pushing your matching indeces to your matches array. If your ${COLOR_CODE.bright}if statement${COLOR_CODE.reset}${COLOR_CODE.cyan} equates to true, you need to push that index to your array. Inside of your if statement, use a method on your matches that will ${COLOR_CODE.bright}push${COLOR_CODE.reset} ${COLOR_CODE.cyan}the current index (the location of the match) to your array.`, RESOURCES.push))
    return false;
  }
  let returnDeclarationStatements = f.findReturnDeclaration();
  if (returnDeclarationStatements.length === 0 ){
    console.log(`\n`,constructHintMessage(5, `We are detecting that you may not have made a return statment. After your for loop you need to ${COLOR_CODE.bright}return${COLOR_CODE.reset}${COLOR_CODE.cyan} the variable that represents your array of matches.`, RESOURCES.returnInfo));
    return false;
  } 
}

function _logfilterByCityTestParameters(targetCity,    listingCityArray) {
  let message =
    `Calling 'filterByCity' with the parameters:\n` +
    `  targetCity:  "${targetCity}"\n` +
    `  listingCityArray: [${listingCityArray}]`;
  console.log(message);
}


let cityErrorMessage = undefined


function filterByCityTest_singleMatch() {
  const TEST_NAME = "filterByCityTest";
  let targetCity = "Boston";
  let listingCityArray = ["San Diego", "Portland", "Boston"];
  let result = undefined;

  _logfilterByCityTestParameters(targetCity, listingCityArray);
  let exception = callUserCode(() => {
    result = filterByCity(targetCity, listingCityArray);
  });

  if (exception != undefined) {
    cityErrorMessage = constructErrorMessage(TEST_NAME, "?", `We encountered an error running your function.\n${exception}`);
    return false;
  } else if (!Array.isArray(result)) {
    cityErrorMessage = constructErrorMessage(TEST_NAME, "?", `This  function should return an array but got type '${typeof result}'.`);
    return false;  
  } else if (result.length != 1 || result[0] !== 2) {
    cityErrorMessage = constructErrorMessage(TEST_NAME, "?", 
    `We excepted the result '[2]' but got '[${result}]'."`);
    return false;
  }
  citySingleMatchTest = true
  return true;
}

function filterByCityTest_noMatch() {
  if (cityErrorMessage != undefined) {
    return false
  }
  const TEST_NAME = "filterByCityTest";
  let targetCity = "Tampa";
  let listingCityArray = ["San Diego", "Portland", "New York"];
  let result = undefined;

  _logfilterByCityTestParameters(targetCity, listingCityArray);
  let exception = callUserCode(() => {
    result = filterByCity(targetCity, listingCityArray);
  });

  if (exception != undefined) {
    cityErrorMessage = constructErrorMessage(TEST_NAME, "?", `We encountered an error running your function.\n\n${exception}`); 
    return false;
  } else if (!Array.isArray(result)) {
    cityErrorMessage = constructErrorMessage(TEST_NAME, "?", `This  function should return an array but got type '${typeof result}'.`);
    return false;
  } else if (result.length != 0) {
    cityErrorMessage = constructErrorMessage(TEST_NAME, "?", 
    `We excepted the result '[]' but got '[${result}]'."`);
    return false;
  }
  console.log(`Got '[${result}]' as expected, Looks good!`);
  cityNoMatchTest = true
  return true;

}

function filterByCityTest_doubleMatch() {
  if (cityErrorMessage != undefined) {
    return false
  }
  const TEST_NAME = "filterByCityTest";
  let targetCity = "San Diego";
  let listingCityArray = ["San Diego", "Portland", "san diego"];
  let result = undefined;

  _logfilterByCityTestParameters(targetCity, listingCityArray);
  let exception = callUserCode(() => {
    result = filterByCity(targetCity, listingCityArray);
  });
  if (exception != undefined) {
    cityErrorMessage = constructErrorMessage(TEST_NAME, "?", `We encountered an error running your function.\n\n${exception}`);
    cityAnalysis() 
    return false;
  } else if (!Array.isArray(result)) {
    cityErrorMessage = constructErrorMessage(TEST_NAME, "?", `This  function should return an array but got type '${typeof result}'.`);
    return false;
  } else if (result.length != 2 || !result.includes(0) || !result.includes(2)) {
    cityErrorMessage = constructErrorMessage(TEST_NAME, "?", 
    `We excepted the result '[0, 2]' but got '[${result}]'."`); 
    return false;
  }
  console.log(`Got '[${result}]' as expected, Looks good!`);
  return true;
}
/////////////////////////////////////////
function filterByCityTest() {

  let passedSingleMatch = filterByCityTest_singleMatch();
  console.log("");
  let passedNoMatch = filterByCityTest_noMatch();
  console.log("");
  let passedDoubleMatch = filterByCityTest_doubleMatch();


  if (passedSingleMatch && passedNoMatch && passedDoubleMatch) {
    console.log(`${COLOR_CODE.bright}filterByCityTest passed! ${COLOR_CODE.underscore}${COLOR_CODE.green}Great job!${COLOR_CODE.reset}`)
    return true;
  } else {
    cityAnalysis()
  }
}

function typeAnalysis() {
  let f = new FunctionAnalysis(String(filterByTypes));
  console.log(typeErrorMessage)
// no declaration of an empty array.
  let arrayDeclarationStatements = f.findArrayDeclarations();
  if (arrayDeclarationStatements.length === 0 || 
      arrayDeclarationStatements[0].declarations[0].init.elements.length !== 0){
      console.log(`\n`,constructHintMessage(1, "We are detecting that you may not have declared an empty array variable. Make sure you initialized an empty array and assigned it to a variable. Later we will use it to store our matching indices.", RESOURCES.arrays));
    return false;
  } 

// no loop statement.
  let loopStatements = f.findLoops();

  if (loopStatements.length === 0) {
    console.log(`\n`,constructHintMessage(1, `We are detecting that you may not have a loop. Create a ${COLOR_CODE.bright}for loop${COLOR_CODE.reset}${COLOR_CODE.cyan}. The ${COLOR_CODE.bright}for loop${COLOR_CODE.reset}${COLOR_CODE.cyan} should execute once for every index in the listingTypeArray. The index of the for loop should also increment by one each time the code is ran. Do you remember the the method that will give you the length of an array? `, RESOURCES.arrays));
    return false;
  }

  // no nested loop
    
  let nestedloopStatements = f.findLoops()[0].body.body[0];
  if (nestedloopStatements.type !== "ForStatement" && nestedloopStatements.type !== "WhileStatement" && nestedloopStatements.type !== "DoWhileStatement") {
    console.log(`\n`,constructHintMessage(1, `We are detecting that you may not have a nested loop. Create a nested${COLOR_CODE.bright} for loop${COLOR_CODE.reset}${COLOR_CODE.cyan}. The nested ${COLOR_CODE.bright}for loop${COLOR_CODE.reset}${COLOR_CODE.cyan} should execute once for every index in the targetTypes. The index of the for loop should also increment by one each time the code is ran. Do you remember the the method that will give you the length of an array? `, RESOURCES.arrays));
    return false;
  }


  // no conditional within the first loop.
  let conditionalStatements = f.findConditionals(nestedloopStatements);
  if (conditionalStatements.length === 0) {
    console.log(`\n`, constructHintMessage(3, `We are detecting that you may not have a conditional to check for matches. Create an ${COLOR_CODE.bright}if Statement${COLOR_CODE.reset}${COLOR_CODE.cyan} inside of your ${COLOR_CODE.bright}for loops${COLOR_CODE.reset}${COLOR_CODE.cyan} that will compare every index of targetTypes to each index of listingTypesArray, and run your code block if that comparson equates to true.`, RESOURCES.conditionals))
    return false;
  }

// no '.push' within the first loop.
  if (!f.getText(loopStatements[0]).includes(".push")) {
    console.log(f.getText(loopStatements[0]))
      console.log(`\n`,constructHintMessage(4,`We are detecting that you may not be pushing your matching indeces to your matches array. If your ${COLOR_CODE.bright}if statement${COLOR_CODE.reset}${COLOR_CODE.cyan} equates to true, you need to push that index to your array. Inside of your if statement, use a method on your matches that will ${COLOR_CODE.bright}push${COLOR_CODE.reset} ${COLOR_CODE.cyan}the current index (the location of the match) to your array.`, RESOURCES.push))
      return false;
  }

  // if return not declared
  let returnDeclarationStatements = f.findReturnDeclaration();
  if (returnDeclarationStatements.length === 0 ){
    console.log(`\n`,constructHintMessage(5, `We are detecting that you may not have made a return statment. After your for loop you need to ${COLOR_CODE.bright}return${COLOR_CODE.reset}${COLOR_CODE.cyan} the variable that represents your array of matches.`, RESOURCES.returnInfo));
    return false;
  } 
}

function _logfilterByTypesTestParameters(targetTypes, listingTypeArray) {
  let message =
    `Calling 'filterByTypes' with the parameters:\n` +
    `  targetType:  "${targetTypes}"\n` +
    `  listingTypeArray: [${listingTypeArray}]`;
  console.log(message);
}


let typeErrorMessage = undefined


function filterByTypesTest_singleMatch() {
  const TEST_NAME = "filterByTypesTest";
  let targetType = ["entire-place"];
  let listingTypesArray = ["shared-room", "private-room","entire-place"];
  let result = undefined;

  _logfilterByTypesTestParameters(targetType, listingTypesArray);
  let exception = callUserCode(() => {
    result = filterByTypes(targetType, listingTypesArray);
  });

  if (exception != undefined) {
    typeErrorMessage = constructErrorMessage(TEST_NAME, "?", `We encountered an error running your function.\n\n${exception}`);

    return false;
  } else if (!Array.isArray(result)) {
    typeErrorMessage = constructErrorMessage(TEST_NAME, "?", `This  function should return an array but got type '${typeof result}'.`);

    return false;
  } else if (result.length != 1 || result[0] !== 2) {
    typeErrorMessage = constructErrorMessage(TEST_NAME, "?", 
    `We excepted the result '[2]' but got '[${result}]'."`);

    return false;
  }
  console.log(`Got '[${result}]' as expected, Looks good!`);
  return true;
}

function filterByTypesTest_noMatch() {
  if (typeErrorMessage !== undefined) {
    return false
  }
  const TEST_NAME = "filterByTypesTest";
  let targetType = ["entire-place"];
  let listingTypesArray = ["shared-room", "shared-room", "private-room"];
  let result = undefined;

  _logfilterByTypesTestParameters(targetType, listingTypesArray);
  let exception = callUserCode(() => {
    result = filterByTypes(targetType, listingTypesArray);
  });

  if (exception != undefined) {
    typeErrorMessage = constructErrorMessage(TEST_NAME, "?", `We encountered an error running your function.\n\n${exception}`);
    return false;
  } else if (!Array.isArray(result)) {
    typeErrorMessage = constructErrorMessage(TEST_NAME, "?", `This  function should return an but got type '${typeof result}'.`);
    return false;
  } else if (result.length != 0) {
    typeErrorMessage = constructErrorMessage(TEST_NAME, "?", 
    `We excepted the result '[]' (empty array) but got '[${result}]'."`);
    return false;
  }

  console.log(`Got '[${result}]' as expected, Looks good!`);
  return true;
}

function filterByTypesTest_doubleMatch() {
  if (typeErrorMessage != undefined) {
    return false
  }
  const TEST_NAME = "filterByTypesTest";
  let targetTypes = ["shared-room"];
  let listingTypeArray = ["shared-room", "private-room", "shared-room"];
  let result = undefined;

  _logfilterByTypesTestParameters(targetTypes, listingTypeArray);
  let exception = callUserCode(() => {
    result = filterByTypes(targetTypes, listingTypeArray);
  });

  if (exception != undefined) {
    typeErrorMessage = constructErrorMessage(TEST_NAME, "?", `We encountered an error running your function.\n\n${exception}`);
    return false;
  } else if (!Array.isArray(result)) {
    typeErrorMessage = constructErrorMessage(TEST_NAME, "?", `This  function should return an but got type '${typeof result}'.`);
    return false;
  } else if (result.length != 2 || !result.includes(0) || !result.includes(2)) {
    typeErrorMessage = constructErrorMessage(TEST_NAME, "?", 
    `We excepted the result '[0, 2]' but got '[${result}]'."`);
    return false;
  }
  console.log(`Got '[${result}]' as expected, Looks good!`);
  return true;
}

///////////////////////////////////

function filterByTypesTest() {

let passedSingleMatch = filterByTypesTest_singleMatch();
console.log("");
let passedNoMatch = filterByTypesTest_noMatch();
console.log("");
let passedDoubleMatch = filterByTypesTest_doubleMatch();

  if (passedSingleMatch && passedNoMatch && passedDoubleMatch) {
    console.log(`${COLOR_CODE.bright}filterByTypesTest passed! ${COLOR_CODE.underscore}${COLOR_CODE.green}Great job!${COLOR_CODE.reset}`)
    return true;
  } else {
    typeAnalysis()
  }
}


function priceAnalysis() {
  let f = new FunctionAnalysis(String(filterByPrice));    
  console.log(priceErrorMessage)
  
  let arrayDeclarationStatements = f.findArrayDeclarations();
  if (arrayDeclarationStatements.length === 0 || 
      arrayDeclarationStatements[0].declarations[0].init.elements.length !== 0){
      console.log(`\n`,constructHintMessage(1, "We are detecting that you may not have declared an empty array variable. Make sure you initialized an empty array and assigned it to a variable. Later we will use it to store our matching indices.", RESOURCES.arrays));
    return false;
  } 

// no loop statement.
  let loopStatements = f.findLoops();

  if (loopStatements.length === 0) {
    console.log(`\n`,constructHintMessage(1, `We are detecting that you may not have a loop. Create a ${COLOR_CODE.bright}for loop${COLOR_CODE.reset}${COLOR_CODE.cyan}. The ${COLOR_CODE.bright}for loop${COLOR_CODE.reset}${COLOR_CODE.cyan} should execute once for every index in the listingPriceArray. The index of the for loop should also increment by one each time the code is ran. Do you remember the the method that will give you the length of an array? `, RESOURCES.forLoops));
    return false;
  }

  let conditionalStatements = f.findConditionals(loopStatements[0]);
  // no conditional within the first loop.
  if (conditionalStatements.length === 0) {
    console.log(`\n`, constructHintMessage(3, `We are detecting that you may not have a conditional to check for matches. Create an ${COLOR_CODE.bright}if Statement${COLOR_CODE.reset}${COLOR_CODE.cyan} inside of your ${COLOR_CODE.bright}for loop${COLOR_CODE.reset}${COLOR_CODE.cyan} that will compare each index of listingPriceArray and see if it is greater than or equal to minPrice ${COLOR_CODE.bright} and ${COLOR_CODE.reset}${COLOR_CODE.cyan}compare each index of listingPriceArray and see if it is less than or equal to maxPrice, and run your code block if those comparsons equates to true. Do you remember the AND operator for conditionals?`, RESOURCES.conditionals))
    return false;
  }

// no '.push' within the first loop.
  if (!f.getText(loopStatements[0]).includes(".push")) {
    console.log(f.getText(loopStatements[0]))
      console.log(`\n`,constructHintMessage(4,`We are detecting that you may not be pushing your matching indeces to your matches array. If your ${COLOR_CODE.bright}if statement${COLOR_CODE.reset}${COLOR_CODE.cyan} equates to true, you need to push that index to your array. Inside of your if statement, use a method on your matches that will ${COLOR_CODE.bright}push${COLOR_CODE.reset} ${COLOR_CODE.cyan}the current index (the location of the match) to your array.`, RESOURCES.push))
      return false;
  }
  let returnDeclarationStatements = f.findReturnDeclaration();
  if (returnDeclarationStatements.length === 0 ){
    console.log(`\n`,constructHintMessage(5, `We are detecting that you may not have made a return statment. After your for loop you need to ${COLOR_CODE.bright}return${COLOR_CODE.reset}${COLOR_CODE.cyan} the variable that represents your array of matches.`, RESOURCES.returnInfo));
    return false;
  } 
}

function _logfilterByPriceTestParameters(minPrice, maxPrice, listingPriceArray) {
  let message =
    `Calling 'filterByPrice' with the parameters:\n` +
    `  minPrice:  "${minPrice}"\n` +
    `  minPrice:  "${maxPrice}"\n` +
    `  listingCityArray: [${listingPriceArray}]`;
  console.log(message);
}

let priceErrorMessage = undefined

function filterByPriceTest_singleMatch() {
  const TEST_NAME = "filterByPriceTest";
  let minPrice = [900];
  let maxPrice = [999];
  let listingPriceArray = [100, 500, 950];
  let result = undefined;

  _logfilterByPriceTestParameters(minPrice, maxPrice, listingPriceArray);
  let exception = callUserCode(() => {
    result = filterByPrice(minPrice, maxPrice, listingPriceArray);
  });

  if (exception != undefined) {
    priceErrorMessage = constructErrorMessage(TEST_NAME, "?", `We encountered an error running your function.\n\n${exception}`);
    return false;
  } else if (!Array.isArray(result)) {
    priceErrorMessage = constructErrorMessage(TEST_NAME, "?", `This  function should return an array but got type '${typeof result}'.`);
    return false;
  } else if (result.length != 1 || result[0] !== 2) {
    priceErrorMessage = constructErrorMessage(TEST_NAME, "?", 
    `We excepted the result '[2]' but got '[${result}]'."`);
    return false;
  }
  console.log(`Got '[${result}]' as expected, Looks good!`);
  return true;
}


function filterByPriceTest_noMatch() {
  if (priceErrorMessage !== undefined) {
    return false
  }
  const TEST_NAME = "filterByPriceTest";
  let minPrice = [1];
  let maxPrice = [99];
  let listingPriceArray = [100, 500, 950];
  let result = undefined;

  _logfilterByPriceTestParameters(minPrice, maxPrice, listingPriceArray);
  let exception = callUserCode(() => {
    result = filterByPrice(minPrice, maxPrice, listingPriceArray);
  });

  if (exception != undefined) {
    priceErrorMessage = constructErrorMessage(TEST_NAME, "?", `We encountered an error running your function.\n\n${exception}`);
    return false;
  } else if (!Array.isArray(result)) {
    priceErrorMessage = constructErrorMessage(TEST_NAME, "?", `This  function should return an but got type '${typeof result}'.`);
    return false;
  } else if (result.length != 0) {
    priceErrorMessage = constructErrorMessage(TEST_NAME, "?", 
    `We excepted the result '[]' (empty array) but got '[${result}]'."`);
    return false;
  }
  console.log(`Got '[${result}]' as expected, Looks good!`);
  return true;
}

function filterByPriceTest_doubleMatch() {
  if (priceErrorMessage !== undefined) {
    return false
  } 
  const TEST_NAME = "filterByPriceTest";
  let minPrice = [98];
  let maxPrice = [550];
  let listingPriceArray = [100, 500, 950];
  let result = undefined;

  _logfilterByPriceTestParameters(minPrice, maxPrice, listingPriceArray);
  let exception = callUserCode(() => {
    result = filterByPrice(minPrice, maxPrice, listingPriceArray);
  });

  if (exception != undefined) {
    priceErrorMessage = constructErrorMessage(TEST_NAME, "?", `We encountered an error running your function.\n\n${exception}`);
    return false;
  } else if (!Array.isArray(result)) {
    priceErrorMessage = constructErrorMessage(TEST_NAME, "?", `This  function should return an but got type '${typeof result}'.`);
    return false;
  } else if (result.length != 2 || !result.includes(0) || !result.includes(1)) {
    priceErrorMessage = constructErrorMessage(TEST_NAME, "?", 
    `We excepted the result '[0, 1]' but got '[${result}]'."`);
    return false;
  }

  console.log(`Got '[${result}]' as expected, Looks good!`);
  return true;
}

function filterByPriceTest() {

  let passedSingleMatch = filterByPriceTest_singleMatch();
  console.log("");
  let passedNoMatch = filterByPriceTest_noMatch();
  console.log("");
  let passedDoubleMatch = filterByPriceTest_doubleMatch();

  if (passedSingleMatch && passedNoMatch && passedDoubleMatch) {
    console.log(`${COLOR_CODE.bright}filterByPriceTest passed! ${COLOR_CODE.underscore}${COLOR_CODE.green}Great job!${COLOR_CODE.reset}`)
    return true;
  } else {
    priceAnalysis()
  }
}

function runAllTests() {
  let tests = [
  filterByCityTest, 
  filterByTypesTest, 
  filterByPriceTest];
  let passed = true;

  tests.forEach((test) => {
    passed &= test();
  });

  if (passed) {
    console.log("ALL TESTS PASS!!!!");
  } else {
    console.log("TEST RUN FAILED");
  }
}

