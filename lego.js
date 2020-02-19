
const request = require('request');
const ProgressBar = require('progress');
const Bottleneck = require('bottleneck');
const config = require('./config');

const searchQuery = async query => {
    var bar = new ProgressBar(`searching: ${query} [:bar] :rate/pps :percent :etas`, {complete: '=', incomplete: ' ', width: 30, total: 1});
    const limiter = new Bottleneck({minTime: config.minimumTimeBetweenRequests, maxConcurrent: config.maxConcurrentConnections});
    const limitedSearchQuery = limiter.wrap(doSearchRequest);

    let currentPage = 1;
    let results = [];

    let response = await doSearchRequest(query, currentPage++);
    const numberOfPages = Math.ceil(response.data.search.productResult.total / config.productsPerRequest);

    bar.total = numberOfPages;
    bar.tick(1);
    results.push(...response.data.search.productResult.results);


    if(currentPage > numberOfPages) return results;
    
    let allRequests = [];
    for (let i = currentPage; i <= numberOfPages; i++) {
        allRequests.push(limitedSearchQuery(query, i)
        .then(res => {
            bar.tick(1);    //Each time a request is fulfilled then update progress bar
            return res;
        }));
    }
    const responses = await Promise.all(allRequests); //Wait for all requests to return
    results.push(...responses.map(r => r.data.search.productResult.results));
    return results.flat(); //flatten so that the array contains just products rather than products per request sub arrays
}

const doSearchRequest = (query, page) => { //private function
    const options = {
        method: "POST",
        url: "https://www.lego.com/api/graphql/SearchQuery",
        headers: {
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.100 Safari/537.36",
            "content-type": "application/json",    
            "x-locale": "en-IE"
        },
        body: JSON.stringify({
            "operationName": "SearchQuery",
            "variables": {
                "page": page,
                "isPaginated": true,
                "perPage": config.productsPerRequest, //This can be as large as 500 though you risk a client timeout if too large
                "sort": {
                    "key": "RELEVANCE",
                    "direction": "ASC"
                },
                "filters": [],
                "q": query,
                "visibility": {
                    "includeFreeProducts": false,
                    "includeRetiredProducts": true
                }
            },
            "query": "query SearchQuery($q: String!, $page: Int, $perPage: Int, $filters: [Filter!], $sort: SortInput, $isPaginated: Boolean!, $visibility: ProductVisibility, $scoreFactorAttribute: String, $scoreFactorModifier: String, $scoreFactorMultiplier: String, $scoreFactorBoostMode: String) {\n  search(query: $q, visibility: $visibility) {\n    ... on RedirectAction {\n      __typename\n      url\n    }\n    ... on ProductSearchResults {\n      __typename\n      productResult(page: $page, perPage: $perPage, filters: $filters, sort: $sort, scoring: {scoreFactorAttribute: $scoreFactorAttribute, scoreFactorModifier: $scoreFactorModifier, scoreFactorMultiplier: $scoreFactorMultiplier, scoreFactorBoostMode: $scoreFactorBoostMode}) @include(if: $isPaginated) {\n        ...Search_ProductResults\n        __typename\n      }\n      productResult(page: $page, perPage: $perPage, filters: $filters, sort: $sort, scoring: {scoreFactorAttribute: $scoreFactorAttribute, scoreFactorModifier: $scoreFactorModifier, scoreFactorMultiplier: $scoreFactorMultiplier, scoreFactorBoostMode: $scoreFactorBoostMode}) @skip(if: $isPaginated) {\n        ...Search_ProductResults\n        __typename\n      }\n      playResult {\n        total\n        __typename\n      }\n      resultFor\n    }\n    __typename\n  }\n}\n\nfragment Search_ProductResults on ProductQueryResult {\n  __typename\n  count\n  total\n  results {\n    ...Product_ProductItem\n    __typename\n  }\n  facets {\n    ...Facet_FacetSidebar\n    __typename\n  }\n  sortOptions {\n    ...Sort_SortOptions\n    __typename\n  }\n}\n\nfragment Product_ProductItem on Product {\n  __typename\n  id\n  productCode\n  name\n  slug\n  primaryImage(size: THUMBNAIL)\n  baseImgUrl: primaryImage\n  overrideUrl\n  ... on ReadOnlyProduct {\n    readOnlyVariant {\n      ...Variant_ReadOnlyProduct\n      __typename\n    }\n    __typename\n  }\n  ... on SingleVariantProduct {\n    variant {\n      ...Variant_ListingProduct\n      __typename\n    }\n    __typename\n  }\n  ... on MultiVariantProduct {\n    variants {\n      ...Variant_ListingProduct\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment Variant_ListingProduct on ProductVariant {\n  id\n  sku\n  salePercentage\n  attributes {\n    rating\n    maxOrderQuantity\n    availabilityStatus\n    availabilityText\n    vipAvailabilityStatus\n    vipAvailabilityText\n    canAddToBag\n    canAddToWishlist\n    vipCanAddToBag\n    onSale\n    isNew\n    ...ProductAttributes_Flags\n    __typename\n  }\n  ...ProductVariant_Pricing\n  __typename\n}\n\nfragment ProductVariant_Pricing on ProductVariant {\n  price {\n    formattedAmount\n    centAmount\n    currencyCode\n    formattedValue\n    __typename\n  }\n  listPrice {\n    formattedAmount\n    centAmount\n    __typename\n  }\n  attributes {\n    onSale\n    __typename\n  }\n  __typename\n}\n\nfragment ProductAttributes_Flags on ProductAttributes {\n  featuredFlags {\n    key\n    label\n    __typename\n  }\n  __typename\n}\n\nfragment Variant_ReadOnlyProduct on ReadOnlyVariant {\n  id\n  sku\n  attributes {\n    featuredFlags {\n      key\n      label\n      __typename\n    }\n    __typename\n  }\n  __typename\n}\n\nfragment Facet_FacetSidebar on Facet {\n  name\n  key\n  id\n  labels {\n    __typename\n    displayMode\n    name\n    labelKey\n    count\n    ... on FacetValue {\n      value\n      __typename\n    }\n    ... on FacetRange {\n      from\n      to\n      __typename\n    }\n  }\n  __typename\n}\n\nfragment Sort_SortOptions on SortOptions {\n  id\n  key\n  direction\n  label\n  __typename\n}\n"
        })
    }
    return new Promise( (resolve, reject) => 
        request(options, (err, res, body) => {
            if (err) resolve(err);
            else {
                const json = JSON.parse(body);
                resolve(json);
            }
        })
    )
}

const searchParse = products => {
   return {
        result: products.map(product => {
        //Each variant in the variants array would normally have to be accounted for, in search for "star wars" some products can have multiple variants
        const variant = product.variant? product.variant: product.variants[0]; 
        try {
            return {
                name: product.name,
                itemNumber: product.productCode,
                price: variant.price.formattedAmount,
                rating: variant.attributes.rating,
                availability: variant.attributes.availabilityText
            }
        } catch(err) {
            return {
                product: product.productCode,
                err: err
            }
        }
    })
}}


module.exports = {
    searchQuery,
    searchParse
}