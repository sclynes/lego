
const request = require('request');

const query = query => {
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
                "page": 1,
                "isPaginated": true,
                "perPage": 18,
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
            if (err) reject(err);
            else resolve(body);
        })
    )
}

parse = data => {
    const products = data.data.search.productResult.results;
    console.log(products);
}

module.exports = {
    query,
    parse
}