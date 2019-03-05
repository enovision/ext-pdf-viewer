/**
 * @copyright   Enovision GmbH
 * @author      Johan van de Merwe
 * @licence     MIT-Styled License
 * @date        31 Jan 2017
 * @class       PdfViewer.view.panel.PDFController
 *
 */
Ext.define('PdfViewer.view.panel.PDFController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.PdfViewerController',

    requires: [],

    container: null,

    pageScale: null,
    zoomFactor: null,
    minScale: null,
    maxScale: null,

    control: {
        '#': {
            boxready: 'onBoxReady',
            onSetSrc: 'onSetSrc',
            onUnset: 'onUnset',
            afterrender: 'onAfterrender'
        }
    },

    init: function (view) {
        var me = this;

        me.zoomFactor = view.zoomFactor;
        me.minScale = view.minScale;
        me.maxScale = view.maxScale;
        me.pageScale = view.pageScale;
    },

    onSetSrc: function (src) {
        var view = this.getView();

        if (!Ext.isObject(src)) {
            src = {
                url: src
            };
        }

        //mark previous request which might be still in progress as cancelled
        if (view.src) {
            view.src.isCancelled = true;
            //<debug>
            console.log(Ext.String.format('[PDFController] Marking previous request for src="{0}" as cancelled', view.src.url));
            //</debug>
        }
        view.src = src;
        view.currentPage = 1; // reset page counter
        this.showLoaderMask(view);
        this.getDocument(src);
    },

    /**
     * clears the panel
     */
    onUnset: function () {
        if (this.container !== null) {
            this.container.innerHTML = '';
            this.setToolbarProperties(0, true);
        }
    },

    onBoxReady: function () {
        var view = this.getView();

        if (view.showLoadMaskOnInit) {
            this.showLoaderMask(view);
        }
    },

    onAfterrender: function (view) {
        var me = this;
        me.container = view.getPdfEl();
        me.container.mozOpaque = true;

        if (!!view.src) {
            me.getDocument(view.src);
        }
    },

    getDocument: function (src) {
        var me = this;
        var view = me.getView();
        var options = {
            scrollbarWidth: me.getScrollbarWidth(view)
        };

        if (Ext.isObject(src)) {
            options = Ext.apply(src, options);
        } else {
            options.url = src;
        }

        //<debug>
        console.log(Ext.String.format('[PDFController] Requesting document src="{0}"', options.url));
        //</debug>

        pdfjsLib.getDocument(options).then(function getDocumentSuccess(pdfDoc) {
            if (!options.isCancelled) {
                view.pdfDoc = options.pdfDoc = pdfDoc;
                me.renderDocument(options);
            }
            else {
                console.log(Ext.String.format('[PDFController] Skipping rendering of src="{0}" (isCancelled=true)', options.url));
            }
        }, function getDocumentError(reason) {
            console.error(Ext.String.format('Error loading PDF (src="{0}"): {1}', options.url, reason));
            if (view.loader) {
                view.loader.destroy();
            }

            //clear the panel
            me.onUnset();

            //call passed "errorHandler" or show alert
            if (Ext.isFunction(options.errorHandler)) {
                options.errorHandler.call(options, me, reason);
            } else {
                Ext.Msg.show({
                    title: 'PDF preview error',
                    message: 'Could not preview PDF: ' + reason,
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.ERROR
                });
            }
        });
    },

    renderDocument: function (options) {
        try {
            var view = this.getView(),
                isEmpty = options.pdfDoc.numPages === 0;

            view.currentPage = view.currentPage || (isEmpty ? 0 : 1);
            this.renderPage(view.currentPage, options);
        }
        catch (error) {
            Ext.log({level: "warning"}, "PDF: Can't render: " + error.message);
        }
    },

    renderPage: function (page, options) {
        var me = this,
            view = me.getView(),
            pageCount,
            currPage;

        if (view.isRendering || !options.pdfDoc) {
            return;
        }

        //<debug>
        console.log(Ext.String.format('[PDFController] Start rendering src="{0}"', options.url));
        //</debug>
        options = options || {};
        view.isRendering = true;
        view.currentPage = page;

        currPage = view.currentPage;
        pageCount = view.pdfDoc.numPages;

        Ext.suspendLayouts();
        this.setToolbarProperties(currPage);

        this.container.innerHTML = '';

        var numPages = view.showPerPage ? page : pageCount;
        var idx = view.showPerPage ? page : 1;

        function cleanUpRendering() {
            Ext.resumeLayouts(true);

            view.isRendering = false;

            if (view.loader) {
                view.loader.destroy();
                view.loader = null;
            }
        }

        for (var i = idx; i <= numPages; i++) {
            if (options.isCancelled) {
                console.log(Ext.String.format('[PDFController] Skipping rendering of src="{0}" (isCancelled=true, for loop)', options.url));
                cleanUpRendering();
                break;
            }

            // Using promise to fetch the page
            view.pdfDoc.getPage(i).then(function (page) {
                //<debug>
                console.log(Ext.String.format('[PDFController] Rendering page {0} of src="{1}", (isCancelled={2})', page.pageNumber, options.url, !!options.isCancelled));
                //</debug>
                if (options.isCancelled) {
                    console.log(Ext.String.format('[PDFController] Skipping rendering of src="{0}" (isCancelled=true, getPage promise)', options.url));
                    cleanUpRendering();
                    return;
                }

                var viewport;
                
                if (view.pageScale !== 'fitwidth') {
                    viewport = page.getViewport(view.pageScale);
                } else {
                    //calculate new scale that will fit current view's width
                    viewport = page.getViewport(1);
                    var newScale = view.getWidth() / (viewport.width + (options.scrollbarWidth ? options.scrollbarWidth : 0));
                    viewport = page.getViewport(newScale);
                }

                var div = document.createElement("div");
                var id = view.getId() + "-page-" + (page.pageIndex + 1);
                div.setAttribute("id", id);
                div.setAttribute("style", "position: relative");

                me.container.appendChild(div);

                var canvas = document.createElement("canvas");
                div.appendChild(canvas);

                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                context.save();
                context.fillStyle = 'rgb(255, 255, 255)';
                context.fillRect(0, 0, canvas.width, canvas.height);
                context.restore();

                // Render PDF page into canvas context
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                var renderTask = page.render(renderContext);

                if (!view.disableTextLayer) {
                    renderTask.promise
                        .then(function () {
                            var textContent = page.getTextContent();
                            var textLayerDiv = document.createElement("div");
                            textLayerDiv.setAttribute("class", "textLayer");
                            div.appendChild(textLayerDiv);

                            pdfjsLib.renderTextLayer({
                                textContent: textContent,
                                container: textLayerDiv,
                                viewport: viewport,
                                pageIndex: page.pageIndex,
                                textDivs: []
                            });    
                        });
                }

                cleanUpRendering();

                if (view.rendered) {
                    me.updateBorder(view.body, id, 'bordered', 'add');
                    view.scrollTo(0, 0);
                    view.fireEvent('change', view, {
                        current: view.currentPage,
                        total: view.pdfDoc.numPages
                    });
                }
            });
        }
    },

    moveFirst: function () {
        var view = this.getView();
        if (view.fireEvent('beforechange', view, 1) !== false) {
            this.renderThis(1);
        }
    },

    movePrevious: function () {
        var view = this.getView(),
            prev = view.currentPage - 1;

        if (prev > 0) {
            if (view.fireEvent('beforechange', view, prev) !== false) {
                this.renderThis(prev);
            }
        }
    },

    moveNext: function () {
        var view = this.getView(),
            total = view.pdfDoc.numPages,
            next = view.currentPage + 1;

        if (next <= total) {
            if (view.fireEvent('beforechange', view, next) !== false) {
                this.renderThis(next);
            }
        }
    },

    moveLast: function () {
        var me = this.getView(),
            last = me.pdfDoc.numPages;

        if (me.fireEvent('beforechange', me, last) !== false) {
            this.renderThis(last);
        }
    },

    onPagingBlur: function (e) {
        var curPage = this.getView().currentPage;
        this.lookup('inputItem').setValue(curPage);
    },

    onPagingKeyDown: function (field, e) {
        var me = this.getView(),
            k = e.getKey(),
            increment = e.shiftKey ? 10 : 1,
            pageNum, total = me.pdfDoc.numPages;

        if (k === e.RETURN) {
            e.stopEvent();
            pageNum = this.readPageFromInput();
            if (pageNum !== false) {
                pageNum = Math.min(Math.max(1, pageNum), total);
                if (me.fireEvent('beforechange', me, pageNum) !== false) {
                    this.renderThis(pageNum);
                }
            }
        } else if (Ext.Array.indexOf([e.HOME, e.END], k) > 0) {
            e.stopEvent();
            pageNum = k == e.HOME ? 1 : total;
            field.setValue(pageNum);
        } else if (Ext.Array.indexOf([e.UP, e.PAGE_UP, e.DOWN, e.PAGE_DOWN], k) > 0) {
            e.stopEvent();
            pageNum = this.readPageFromInput();
            if (pageNum) {
                if (k === e.DOWN || k === e.PAGE_DOWN) {
                    increment *= -1;
                }
                pageNum += increment;
                if (pageNum >= 1 && pageNum <= total) {
                    field.setValue(pageNum);
                }
            }
        }
    },

    onPagingFocus: function () {
        this.lookup('inputItem').select();
    },

    onScaleBlur: function (e) {
        var me = this.getView();
        this.lookup('scaleCombo').setValue(me.pageScale);
    },

    onBtnZoomInClicked: function (b) {
        var me = this;
        me.pageScale += me.zoomFactor;
        if (me.pageScale > me.maxScale) {
            me.pageScale = me.maxScale;
        }
        this.lookup('scaleCombo').setValue(me.pageScale);
    },

    onBtnZoomOutClicked: function (b) {
        var me = this;
        me.pageScale -= me.zoomFactor;
        if (me.pageScale < me.minScale) {
            me.pageScale = me.minScale;
        }
        this.lookup('scaleCombo').setValue(me.pageScale);
    },

    getRenderPageOptions: function() {
        var me = this,
            view = me.getView();
        
        return Ext.apply(view.src, {
            scrollbarWidth: me.getScrollbarWidth(view)
        });
    },

    onScaleChange: function (combo, newValue) {
        var me = this;
        var view = me.getView();
        view.pageScale = me.pageScale = newValue;

        if (view.pdfDoc) {
            me.renderPage(view.currentPage, me.getRenderPageOptions());
        }
    },

    /**
     * Tries to determine current width of scrollbar which is then used to calculate
     * scale more accurately for "fitwidth" scale option.
     * 
     * @param {PdfViewer.view.panel.PDF} view 
     */
    getScrollbarWidth: function(view) {
        return !(view && view.getPdfEl()) ? 0 : view.getWidth() - view.getPdfEl().clientWidth;
    },

    readPageFromInput: function () {
        var view = this.getView(),
            v = this.lookup('inputItem').getValue(),
            pageNum = parseInt(v, 10);

        if (!v || isNaN(pageNum)) {
            this.lookup('inputItem').setValue(view.currentPage);
            return false;
        }
        return pageNum;
    },

    privates: {
        setToolbarProperties: function (page, reset) {
            var me = this,
                view = me.getView(),
                currPage = page,
                pageCount = view.pdfDoc ? view.pdfDoc.numPages : NaN,
                isEmpty = pageCount === 0,
                afterText = Ext.String.format(view.afterPageText, isNaN(pageCount) ? 1 : pageCount);

            if (typeof(reset) !== 'undefined') {
                isEmpty = true;
            }

            view.currentPage = isEmpty ? '' : currPage;

            me.lookup('afterTextItem').setText(afterText);
            me.lookup('inputItem').setDisabled(isEmpty).setValue(currPage);
            me.lookup('first').setDisabled(currPage === 1 || isEmpty);
            me.lookup('prev').setDisabled(currPage === 1 || isEmpty);
            me.lookup('next').setDisabled(currPage === pageCount || isEmpty);
            me.lookup('last').setDisabled(currPage === pageCount || isEmpty);
            me.lookup('scaleCombo').setDisabled(isEmpty).setValue(view.pageScale);
        },
        renderThis: function (page) {
            var me = this;
            var view = me.getView();
            if (view.showPerPage) {
                me.renderPage(page, me.getRenderPageOptions());
            } else {
                me.setToolbarProperties(page);
                var el = me.container.childNodes.item(page - 1);
                view.scrollTo(0, el.offsetTop, true);
            }
        },
        showLoaderMask: function (view) {
            //hide any previous loader
            if (view.loader) {
                view.loader.destroy();
            }

            view.loader = new Ext.LoadMask({
                msg: view.loadingMessage,
                target: view
            });
            view.loader.show();
        },
        updateBorder: function (el, id, addCls, action) {
            var elem = el.getById(id);
            var canvas = elem.dom.firstChild;
            var hasClass = canvas.hasAttribute('class');

            if (action === 'add') {
                if (hasClass) {
                    canvas.className += ' ' + addCls;
                } else {
                    canvas.setAttribute("class", addCls);
                }
            } else {
                if (hasClass) {
                    canvas.className = canvas.className.replace(new RegExp('(?:^|s)' + addCls + '(?!S)'), '');
                    if (canvas.className.length === 0) {
                        canvas.removeAttribute('class');
                    }
                }
            }
        }
    }
});