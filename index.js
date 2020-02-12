const lego = require('./lego');
const fs = require('fs');
const config = require('./config.json');
const dir = __dirname+'/searches';

const main = async () => {
    //if any parameters from the command line, use as query, else use default from config file
    let searchQuery = process.argv[2]? JSON.stringify(process.argv.slice(2).join(' ')): config.defaultSearchQuery;
    searchQuery = searchQuery.replace(/"/g, ""); //strip any quotes from the query

    const result = await lego.searchQuery(searchQuery);
    const parsed = lego.searchParse(result);

    if (!fs.existsSync(dir)) fs.mkdirSync(dir); 
    fs.writeFileSync(`${dir}/${searchQuery}_${Date.now()}.json`, JSON.stringify(parsed));
}

main();