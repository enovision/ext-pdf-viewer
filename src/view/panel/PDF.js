/**
 * @copyright   Enovision GmbH
 * @author      Johan van de Merwe
 * @licence     MIT-Styled License
 * @date        31 Jan 2017
 * @class       PdfViewer.view.panel.PDF
 *
 */
Ext.define('PdfViewer.view.panel.PDF', {
    extend: 'Ext.panel.Panel',
    controller: 'PdfViewerController',

    xtype: 'PdfViewerPdfPanel',

    requires: [
        'PdfViewer.view.combo.scaleCombo',
        'PdfViewer.view.field.pageNumber',
        'PdfViewer.view.panel.PDFController'
    ],

    extraBaseCls: Ext.baseCSSPrefix + 'pdf',
    extraBodyCls: Ext.baseCSSPrefix + 'pdf-body',

    autoScroll: true,

    /**
     * @cfg{Boolean} disableTextLayer
     * When set to false the Textlayer Builder will not be available
     * used for text select (copy & paste)
     */
    disableTextLayer: false,
    /**
     * @cfg{Boolean} showPerPage
     * @default false
     * when true pages will show one page at a time, otherwise it will
     * show the document as a contineous flow
     */
    showPerPage: false,
    /**
     * @cfg{Double} pageScale
     * default: 1 = 100% (f.e. 1.25 = 125% etc...)
     */
    pageScale: 1,
    /**
     * @cfg{Boolean} pageBorders
     * default: true, shows a border in the SASS $neutral_color color
     * see: sass/etc/all.scss for more details
     */
    pageBorders: true,

    /**
     * @cfg{String} src
     * URL to the PDF - Same Domain or Server with CORS Support
     */
    src: '',

    /**
     * @cfg{Boolean} disableWorker
     * @default false
     * Disable workers to avoid yet another cross-origin issue(workers need the URL of
     * the script to be loaded, and currently do not allow cross-origin scripts)
     */
    disableWorker: false,

    /**
     * @cfg{String|null} loadingMessage
     * The text displayed when loading the PDF.
     */
    loadingMessage: 'Loading PDF, please wait...',

    /**
     * @cfg{String} beforePageText
     * The text displayed before the input item.
     */
    beforePageText: 'Page',

    /**
     * @cfg{String|null} afterPageText
     * Customizable piece of the default paging text. Note that this string is formatted using
     *{0} as a token that is replaced by the number of total pages. This token should be preserved when overriding this
     * string if showing the total page count is desired.
     */
    afterPageText: 'of {0}',

    /**
     * @cfg{String|null} firstText
     * The quicktip text displayed for the first page button.
     * **Note**: quick tips must be initialized for the quicktip to show.
     */
    firstText: 'First Page',

    /**
     * @cfg{String|null} prevText
     * The quicktip text displayed for the previous page button.
     * **Note**: quick tips must be initialized for the quicktip to show.
     */
    prevText: 'Previous Page',

    /**
     * @cfg{String|null} nextText
     * The quicktip text displayed for the next page button.
     * **Note**: quick tips must be initialized for the quicktip to show.
     */
    nextText: 'Next Page',

    /**
     * @cfg{String|null} lastText
     * The quicktip text displayed for the last page button.
     * **Note**: quick tips must be initialized for the quicktip to show.
     */
    lastText: 'Last Page',

    /**
     * @cfg{Number} inputItemWidth
     * The width in pixels of the input field used to display and change the current page number.
     */
    inputItemWidth: 60,

    /**
     * @cfg{Number} inputItemWidth
     * The width in pixels of the combobox used to change display scale of the PDF.
     */
    scaleWidth: 100,
    /**
     * @cfg {Boolean|null} showLoadMaskOnInit
     * Specifies whether the loadmask should show by default
     * Defaults to true.
     */
    showLoadMaskOnInit: null,
    /**
     * @cfg{double} zoomFactor
     * @default 0.1
     * The factor for zooming (0.1 = 10%)
     *
     */
    zoomFactor: 0.1,
    /**
     * @cfg{double} minScale
     * @default 0.5
     * Minimal scale, it doesn't get smaller than this
     *
     */
    minScale: 0.5,
    /**
     * @cfg{double} maxScale
     * @default 4
     * Maximum scale, it doesn't get larger than this
     *
     */
    maxScale: 4,

    initComponent: function () {
        var me = this, dockedItems;

        dockedItems = [{
            dock: 'bottom',
            reference: 'PagingToolbar',
            xtype: 'toolbar',
            items: [{
                reference: 'first',
                tooltip: me.firstText,
                overflowText: me.firstText,
                iconCls: 'ext ext-double-chevron-left',
                disabled: true,
                handler: 'moveFirst'
            }, {
                reference: 'prev',
                tooltip: me.prevText,
                overflowText: me.prevText,
                iconCls: 'ext ext-chevron-left',
                disabled: true,
                handler: 'movePrevious'
            }, '-', me.beforePageText, {
                xtype: 'pdfviewer_pagenumber',
                reference: 'inputItem',
                name: 'inputItem',
                cls: Ext.baseCSSPrefix + 'tbar-page-number',
                width: me.inputItemWidth,
                margins: '-1 2 3 2',
                disabled: true,
                listeners: {
                    keydown: 'onPagingKeyDown',
                    blur: 'onPagingBlur'
                }
            }, {
                xtype: 'tbtext',
                reference: 'afterTextItem',
                text: Ext.String.format(me.afterPageText, 1),
                margins: '0 5 0 0'
            }, '-', {
                reference: 'next',
                tooltip: me.nextText,
                overflowText: me.nextText,
                iconCls: 'ext ext-chevron-right',
                disabled: true,
                handler: 'moveNext'
            }, {
                reference: 'last',
                tooltip: me.lastText,
                overflowText: me.lastText,
                iconCls: 'ext ext-double-chevron-right',
                disabled: true,
                handler: 'moveLast'
            }, '->', {
                xtype: 'button',
                iconCls: 'fa fa-search-plus',
                tooltip: 'Zoom in',
                handler: 'onBtnZoomInClicked'
            }, {
                reference: 'scaleCombo',
                xtype: 'PdfViewerScaleCombo',
                disabled: true,
                width: me.scaleWidth,
                listeners: {
                    change: 'onScaleChange',
                    blur: 'onScaleBlur'
                }
            }, {
                xtype: 'button',
                tooltip: 'Zoom out',
                iconCls: 'fa fa-search-minus',
                handler: 'onBtnZoomOutClicked'
            }]
        }];

        if (typeof(me.dockedItems) !== 'undefined') {
            dockedItems = dockedItems.concat(me.dockedItems);
        }

        Ext.apply(me, {
            html: '<div class="canvasWrapper"></div>',
            dockedItems: dockedItems
        });

        me.bodyCls = me.bodyCls || '';
        me.bodyCls += (' ' + me.extraBodyCls);

        me.cls = me.cls || '';
        me.cls += (' ' + me.extraBaseCls);

        me.callParent(arguments);

        if (me.disableWorker) {
            PDFJS.disableWorker = true;
        }
    },

    getPdfEl: function () {
        return this.el.dom.getElementsByClassName('canvasWrapper')[0];
    },

    setSrc: function (src) {
        this.fireEvent('onSetSrc', src);
    },

    unset: function () {
        this.fireEvent('onUnset');
    }
});