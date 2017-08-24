/**
 * @copyright   Enovision GmbH
 * @author      Johan van de Merwe
 * @licence     MIT-Styled License
 * @date        31 Jan 2017
 * @class       PdfViewer.de.singleton.Loader
 *
 */
Ext.define('PdfViewer.de.singleton.Loader', {
    override: 'PdfViewer.singleton.Loader',

    loadingMessage: 'PDF wird geladen, ein Moment bitte...',
    beforePageText: 'Seite',
    afterPageText: 'von {0}',
    firstText: 'Erste Seite',
    prevText: 'Vorherige Seite',
    nextText: 'Nächste Seite',
    lastText: 'Letzte Seite'
});