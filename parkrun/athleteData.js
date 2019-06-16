const parkrunData = require('./parkrunDataLoader')

function findElementsInHtml(dom, elementName) {
    const elements = dom.filter(n => n.type === 'tag');
    var tableElements = elements.filter(e => e.name === elementName).concat(elements.filter(e => e.children).map(e => findElementsInHtml(e.children, elementName)));
    return [].concat.apply([], tableElements);
}

function matchTableByCaption(table, caption) {
    return table.children.filter(e => e.name === 'caption' && e.children && e.children[0].data === caption).length > 0;
}

function extractResults(table) {
    var tbodyElements = findElementsInHtml(table, 'tbody');
    var resultRows = findElementsInHtml([tbodyElements[0]], 'tr');
    return resultRows.map(tr => createResult(tr));
}

function createResult(row) {
    var cols = findElementsInHtml([row], 'td');
    return {
        event: getTextContentFromColumn(cols, 0),
        date: getTextContentFromColumn(cols, 1),
        runNumber: parseInt(getTextContentFromColumn(cols, 2)),
        position: parseInt(getTextContentFromColumn(cols, 3)),
        time: getTextContentFromColumn(cols, 4),
        ageGrading: getTextContentFromColumn(cols, 5),
    }
}

function getTextContentFromColumn(cols, index) {
    if (cols.length > index)
    {
        return getTextFromElement(cols[index]);
    }
    return undefined;
}

function getTextFromElement(element) {  
    var textElements = element.children.filter(e => e.type === 'text');
    if (textElements.length > 0) {
        return textElements[0].data;
    }
    else {
        return element.children.filter(e => e.type === 'tag').map(e => getTextFromElement(e))[0];
    }
}

function createAthlete(results) {
    return {
        name: 'Dummy',
        id: 123456,
        results: results
    }
}

var athleteData = {
    loadHistory: (athleteId) => {
        return new Promise((resolve, reject) => {
            parkrunData.loadHtml(`https://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber=${athleteId}&eventNumber=0`).then((dom) => {
                var resultsTable = findElementsInHtml(dom, 'table').filter(t => matchTableByCaption(t, 'All Results'));
                resolve(createAthlete(extractResults(resultsTable)));
            });
        }, (err) => {
            reject(err);
        }); 
    }
}

module.exports = athleteData