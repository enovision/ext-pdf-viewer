/**
 * @copyright   Enovision GmbH
 * @author      Johan van de Merwe
 * @licence     MIT-Styled License
 * @date        31 Jan 2017
 * @class       PdfViewer.nl.singleton.Loader
 *
 */
Ext.define('PdfViewer.nl.singleton.Loader', {
    override: 'PdfViewer.singleton.Loader',

    loadingMessage: 'PDF wordt geladen, een ogenblik...',
    beforePageText: 'Pagina',
    afterPageText: 'van {0}',
    firstText: 'Eerste Pagina',
    prevText: 'Vorige Pagina',
    nextText: 'Volgende Pagina',
    lastText: 'Laatste Pagina'
});