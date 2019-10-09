/**
 * @copyright   Enovision GmbH
 * @author      Johan van de Merwe
 * @licence     MIT-Styled License
 * @date        31 Jan 2017
 * @class       PdfViewer.view.field.pageNumber
 * 
 */
Ext.define('PdfViewer.view.field.pageNumber', {
    extend: 'Ext.form.field.Number',
    xtype: 'pdfviewer_pagenumber',
    allowDecimals: false,
    minValue: 1,
    hideTrigger: true,
    enableKeyEvents: true,
    keyNavEnabled: false,
    selectOnFocus: true,
    submitValue: false,
    isFormField: false
});