const lego = require('./lego');

const main = async () => {
    const dataString = await lego.query('frozen 2');
    const dataJson = JSON.parse(dataString);
    const parsed = lego.parse(dataJson);
}

main();