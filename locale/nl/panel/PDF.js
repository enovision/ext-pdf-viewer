/**
 * @copyright   Enovision GmbH
 * @author      Johan van de Merwe
 * @licence     MIT-Styled License
 * @date        31 Jan 2017
 * @class       PdfViewer.nl.panel.PDF
 *
 */
Ext.define('PdfViewer.nl.panel.PDF', {
    override: 'PdfViewer.view.panel.PDF',

    loadingMessage: 'PDF wordt geladen, een ogenblik...',
    beforePageText: 'Pagina',
    afterPageText: 'van {0}',
    firstText: 'Eerste pagina',
    lastText: 'Laatste pagina',
    prevText: 'Vorige pagina',
    nextText: 'Volgende pagina'
});
