/**
 * @copyright   Enovision GmbH
 * @author      Johan van de Merwe
 * @licence     MIT-Styled License
 * @date        31 Jan 2017
 * @class       PdfViewer.de.panel.PDF
 *
 */
Ext.define('PdfViewer.de.panel.PDF', {
    override: 'PdfViewer.view.panel.PDF',

    loadingMessage: 'PDF lädt, einen Moment bitte...',
    beforePageText: 'Seite',
    afterPageText: 'von {0}',
    firstText: 'Erste Seite',
    lastText: 'Letzte Seite',
    prevText: 'Vorherige Seite',
    nextText: 'Nächste Seite'
});
