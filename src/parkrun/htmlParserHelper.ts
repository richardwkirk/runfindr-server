export class HtmlParserHelper {
    public static findElementsInHtml(dom, elementName) {
        const elements = dom.filter((n) => n?.type === "tag");
        const tableElements = elements.filter((e) => e.name === elementName).concat(elements.filter((e) => e.children).map((e) => this.findElementsInHtml(e.children, elementName)));
        return [].concat.apply([], tableElements);
    }

    public static getTextFromElement(element) {
        if (element.children) {
            const textElements = element.children.filter((e) => e?.type === "text");
            if (textElements.length > 0) {
                return textElements[0].data;
            }
            else {
                return element.children.filter((e) => e?.type === "tag").map((e) => this.getTextFromElement(e))[0];
            }
        }
        return null;
    }
}
