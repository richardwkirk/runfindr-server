import { ParkrunDataLoader } from './ParkrunDataLoader';

export class AthleteDataLoader {

    private findElementsInHtml(dom, elementName) {
        const elements = dom.filter(n => n.type === 'tag');
        var tableElements = elements.filter(e => e.name === elementName).concat(elements.filter(e => e.children).map(e => this.findElementsInHtml(e.children, elementName)));
        return [].concat.apply([], tableElements);
    }

    private matchTableByCaption(table, caption) {
        return table.children.filter(e => e.name === 'caption' && e.children && e.children[0].data === caption).length > 0;
    }

    private extractResults(table) {
        var tbodyElements = this.findElementsInHtml(table, 'tbody');
        var resultRows = this.findElementsInHtml([tbodyElements[0]], 'tr');
        return resultRows.map(tr => this.createResult(tr)).filter(r => !r.event.endsWith(' juniors'));
    }

    private createResult(row) {
        var cols = this.findElementsInHtml([row], 'td');
        return {
            event: this.getTextContentFromColumn(cols, 0),
            date: this.getTextContentFromColumn(cols, 1),
            runNumber: parseInt(this.getTextContentFromColumn(cols, 2)),
            position: parseInt(this.getTextContentFromColumn(cols, 3)),
            time: this.getTextContentFromColumn(cols, 4),
            ageGrading: this.getTextContentFromColumn(cols, 5),
        }
    }

    private getTextContentFromColumn(cols, index) {
        if (cols.length > index)
        {
            return this.getTextFromElement(cols[index]);
        }
        return undefined;
    }

    private getTextFromElement(element) {
        if (element.children) {
            var textElements = element.children.filter(e => e.type === 'text');
            if (textElements.length > 0) {
                return textElements[0].data;
            }
            else {
                return element.children.filter(e => e.type === 'tag').map(e => this.getTextFromElement(e))[0];
            }
        }
        return null;
    }

    private createAthlete(athleteId, dom) {
        var resultsTable = this.findElementsInHtml(dom, 'table').filter(t => this.matchTableByCaption(t, 'All Results'));
        var results = this.extractResults(resultsTable);
        results.reverse();

        var name = this.extractName(dom);

        return {
            name: name,
            id: athleteId,
            results: results
        }
    }

    private extractName(dom) {
        var h2Elements = this.findElementsInHtml(dom, 'h2');
        if (h2Elements.length > 0) {
            var nameText = this.getTextFromElement(h2Elements[0]);
            if (nameText) {
                return nameText.replace(/\ -\ .*/, '');
            }
        }
        return 'Unknown Athlete';
    }

    public loadHistory(athleteId) {
        return new Promise((resolve, reject) => {
            try {
                const parkrunDataLoader = new ParkrunDataLoader();
                parkrunDataLoader.loadHtml(`https://www.parkrun.org.uk/results/athleteeventresultshistory/?athleteNumber=${athleteId}&eventNumber=0`).then((dom) => {
                    resolve(this.createAthlete(athleteId, dom));
                });
            }
            catch (err) {
                console.error(`Failed to load athlete history`, err);
                reject(err);
            }
        });
    }

}
