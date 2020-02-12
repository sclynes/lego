# lego
Simple script to scrape lego site

## Prerequisites
Ensure you have NodeJS installed on your local machine

Clone this repo <br/>
**git clone https://github.com/sclynes/lego.git**

Enter the cloned directory<br/>
**cd lego**

Install all dependancies<br/>
**npm install**

## Usage

for default search of "frozen 2" <br/>
**node index.js**

for custom search<br/>
**node index.js [search query]** <br/>

e.g.<br/>
**node index.js lego** <br/>
**node index.js star wars** <br/>

<br/>
search results are found in the searches directory on the script base path<br/>
filenames are of the format [query string]_[timestamp].json

