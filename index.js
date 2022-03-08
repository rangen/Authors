/*  fetch() is not available in Node.js; it's part of the Web API that browsers support
     axios is one of the most common libraries used in its place.  It is also sometimes
    used in web apps in place of fetch() as it has a lot more options */
const axios = require('axios').default;

/*  The Math module is also not available in Node.js, so lodash is a layup to use here for
    its ceil() function, which rounds a number up to help us do integer division
    Lodash is very common to use in modern JS apps to do things like compare arrays,
    reduce Objects and more */ 
const { ceil } = require('lodash');

//  The final requirement is the native FileSystem module to write our results to disk
const fs = require('fs');

const BASE_URL = 'https://api.fisenko.net/v1';
/*  It's common to declare "environment variables" as constants at the top of your file(s).
    50 is the max results returnable from the external API */ 
const OFFSET = 50;


/*  Lines 25-29 are the "body" of this app.  An initial call is made to the /statistics
    endpoint to retrieve the number of authors currently in the database, then 
    getAuthorsByPage is called with arguments of *page 0*, *maxPages* and an empty array 
    where we'll build up our list of all Authors */
axios.get(`${BASE_URL}/statistics/en`)
    .then(response => {
        const maxPages = ceil(response.data.authors / OFFSET);
        getAuthorsByPage(0, maxPages, []);
    });

    
function getAuthorsByPage(currentPage, lastPage, acc) {
    /*  This is the "escape valve" for our recursive function
        When we've reached the last page, we'll stop recursively calling
        and write our cumulative result to disc with writeToFile */
    if (currentPage >= lastPage) {
        return writeToFile(acc);
    }
    const url = `${BASE_URL}/authors/en`;
    /*  One of the advantages of using axios: axios.get(url, options) ->
        options can take an arg 'params' that will automatically append
        query params to the url as needed instead of using string
        interpolation, i.e.  `${BASE_URL}/authors/en/?offset=${.....} */
    axios.get(url, { 
            params: { offset: currentPage * OFFSET }})
            .then(response => {
    // axios also parses json for us :)
                const newAuthors = response.data;
                console.log("retrieved page: ", currentPage);
    // recursively call the function we're in, incrementing the page to request (offset)
                return getAuthorsByPage(currentPage + 1, lastPage, acc.concat(newAuthors));
            });
}

function writeToFile(jsonObject) {
    console.log("writing file", jsonObject);
    fs.writeFileSync('authors.json', JSON.stringify(jsonObject));
}
