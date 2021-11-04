import { ParkrunDataLoader } from "./parkrunDataLoader";
import { HtmlParserHelper } from "./htmlParserHelper";

export class AthleteDataLoader {

    private matchTableByCaption(table, captionRegex) {
        return table.children.filter((e) => e.name === "caption" && e.children && e.children[0].data.match(captionRegex)).length > 0;
    }

    private extractResults(table) {
        const tbodyElements = HtmlParserHelper.findElementsInHtml(table, "tbody");
        const resultRows = HtmlParserHelper.findElementsInHtml([tbodyElements[0]], "tr");
        return resultRows.map((tr) => this.createResult(tr)).filter((r) => !r.event.endsWith(" juniors"));
    }

    private extractSummaries(table) {
        const tbodyElements = HtmlParserHelper.findElementsInHtml(table, "tbody");
        const resultRows = HtmlParserHelper.findElementsInHtml([tbodyElements[0]], "tr");
        return resultRows.map((tr) => this.createSummary(tr)).filter((r) => !r.event.endsWith(" junior parkrun"));
    }

    private createResult(row) {
        const cols = HtmlParserHelper.findElementsInHtml([row], "td");
        return {
            event: this.getTextContentFromColumn(cols, 0),
            date: this.getTextContentFromColumn(cols, 1),
            runNumber: parseInt(this.getTextContentFromColumn(cols, 2)),
            position: parseInt(this.getTextContentFromColumn(cols, 3)),
            time: this.getTextContentFromColumn(cols, 4),
            ageGrading: this.getTextContentFromColumn(cols, 5),
        };
    }

    private createSummary(row) {
        const cols = HtmlParserHelper.findElementsInHtml([row], "td");
        return {
            event: this.getTextContentFromColumn(cols, 0),
            runs: parseInt(this.getTextContentFromColumn(cols, 1)),
            bestGenderPosition: parseInt(this.getTextContentFromColumn(cols, 2)),
            bestPosition: parseInt(this.getTextContentFromColumn(cols, 3)),
            bestTime: this.getTextContentFromColumn(cols, 4),
        };
    }

    private getTextContentFromColumn(cols, index) {
        if (cols.length > index)
        {
            return HtmlParserHelper.getTextFromElement(cols[index]);
        }
        return undefined;
    }

    private createAthlete(athleteId, historyDom, summaryDom) {
        const resultsTable = HtmlParserHelper.findElementsInHtml(historyDom, "table").filter((t) => this.matchTableByCaption(t, /All\s+Results/));
        const results = this.extractResults(resultsTable);
        results.reverse();

        const name = this.extractName(historyDom);

        const tables = HtmlParserHelper.findElementsInHtml(summaryDom, "table");
        const summaries = tables && tables.length > 1  ? this.extractSummaries([ tables[1] ]) : [];

        return {
            name: name,
            id: athleteId,
            results: results,
            summaries: summaries
        };
    }

    private extractName(dom) {
        const h2Elements = HtmlParserHelper.findElementsInHtml(dom, "h2");
        if (h2Elements.length > 0) {
            const nameText = HtmlParserHelper.getTextFromElement(h2Elements[0]);
            if (nameText) {
                return nameText.replace(/\ -\ .*/, "");
            }
        }
        return "Unknown Athlete";
    }

    public loadHistory(athleteId) {
        return new Promise((resolve, reject) => {
            try {
                const parkrunDataLoader = new ParkrunDataLoader();
                parkrunDataLoader.loadHtml(`https://www.parkrun.org.uk/parkrunner/${athleteId}/all/`).then((historyDom) => {
                    parkrunDataLoader.loadHtml(`https://www.parkrun.org.uk/parkrunner/${athleteId}/`).then((summaryDom) => {
                        resolve(this.createAthlete(athleteId, historyDom, summaryDom));
                    });
                });
            }
            catch (err) {
                console.error(`Failed to load athlete history`, err);
                reject(err);
            }
        });
    }

}
