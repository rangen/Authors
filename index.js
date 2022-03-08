const axios = require('axios').default;
const { ceil } = require('lodash');
const fs = require('fs');

const BASE_URL = 'https://api.fisenko.net/v1';
const OFFSET = 50;

axios.get(`${BASE_URL}/statistics/en`)
    .then(response => {
        const maxPages = ceil(response.data.authors / OFFSET);
        getAuthorsByPage(0, maxPages, []);
    });

function getAuthorsByPage(currentPage, lastPage, acc) {
    if (currentPage >= lastPage) {
        return writeToFile(acc);
    }
    const url = `${BASE_URL}/authors/en`;
    axios.get(url, { 
            params: { offset: currentPage * OFFSET }})
            .then(response => {
                const newAuthors = response.data;
                console.log("retrieved page: ", currentPage);
                return getAuthorsByPage(currentPage + 1, lastPage, acc.concat(newAuthors));
            });
}

function writeToFile(jsonObject) {
    console.log("writing file", jsonObject);
    fs.writeFileSync('authors.json', JSON.stringify(jsonObject));
}
