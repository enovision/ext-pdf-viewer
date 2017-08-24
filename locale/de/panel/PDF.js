/**
 * @copyright   Enovision GmbH
 * @author      Johan van de Merwe
 * @licence     MIT-Styled License
 * @date        31 Jan 2017
 * @class       PdfViewer.de.panel.PDF
 *
 */
Ext.define('PdfViewer.de.panel.PDF', {
    override: 'PdfViewer.panel.PDF',

    loadingMessage: 'PDF ladet, ein Moment bitte...',
    beforePageText: 'Seite',
    afterPageText: 'von {0}',
    firstText: 'Erste Seite',
    prevText: 'Vorherige Seite',
    nextText: 'Nächste Seite'
});