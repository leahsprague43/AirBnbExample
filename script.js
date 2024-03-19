
function filterByCity(targetCity, listingCityArray) {
  
  let cityIndexArray = [];
  
    for (let i = 0; i < listingCityArray.length; i++) {
      if (targetCity.toLowerCase() === listingCityArray[i].toLowerCase()) {
        cityIndexArray.push(i);
      }
    }
  return cityIndexArray;
  
}

filterByCityTest();

function filterByPrice(minPrice, maxPrice, listingPriceArray) {
  
  let priceIndexArray = [];

  for (let i = 0; i < listingPriceArray.length; i++) {
    if (listingPriceArray[i] >= minPrice && listingPriceArray[i] <= maxPrice) {
      priceIndexArray.push(i);
    }
  }

  return priceIndexArray;
  
}
filterByPriceTest()


function filterByTypes(targetTypes, listingTypeArray) {
  
  let typesIndexArray = [];

  for (i = 0; i < targetTypes.length; i++) {
    for (j = 0; j < listingTypeArray.length; j++) {
      if (listingTypeArray[j] === targetTypes[i]) {
        typesIndexArray.push(j);
      }
    } 
  } 

  return typesIndexArray;
  
}
filterByTypesTest();