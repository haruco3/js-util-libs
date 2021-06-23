(function() {
    function $(id) {
        return document.getElementById(id);
    }
    $.insert = function(tagName, parent) {
        var o = document.createElement(tagName);
        parent.appendChild(o);
        return o;
    }
    function Table() {
        this.domElement = document.createElement("div");
        this.domElement.style.overflowX = "hidden";
        this.domElement.style.border = "1px solid black";
        this.domElement.style.userSelect = "none";
        var oTable = $.insert("table", this.domElement);
        this._elements = {
            table: oTable,
            header: $.insert("tr", oTable),
            spacer: $.insert("tr", oTable),
            dataRows: []
        }
        oTable.style.width = oTable.style.height = "100%";
        oTable.style.fontFamily = "Arial, sans-serif"
        oTable.style.borderCollapse = "collapse";
        var rollingHeader, i, spacerCell;
        for (i = 0; i < arguments.length; i++) {
            rollingHeader = $.insert("td", this._elements.header);
            rollingHeader.onclick = columnHeaderClick.bind(this);
            rollingHeader.innerText = arguments[i];
            rollingHeader.style.padding = "5px";
            rollingHeader.style.cursor = "pointer";
            spacerCell = $.insert("td", this._elements.spacer);
            if (i != 0)
                rollingHeader.style.borderLeft = spacerCell.style.borderLeft = "1px solid black";
        }
        this._elements.header.style.fontWeight = "bold";
        this._elements.header.style.borderBottom = "1px solid black";
        this._elements.spacer.style.height = "100%";
        this._data = [];
        this._columnCount = arguments.length;
        this._lastSortIndex = null;
        this._lastRow = null;
        this._sortEnabled = true;
    }
    var p = Table.prototype;
    p.addRow = function() {
        if (this._sortEnabled)
            resetSort.call(this);
        if (this._lastRow)
            this._lastRow.style.borderBottom = "1px solid black";
        this._data.push(arguments);
        var row = $.insert("tr", this._elements.table),
            rollingCell;
        for (var i = 0; i < this._columnCount; i++) {
            rollingCell = $.insert("td", row);
            rollingCell.style.padding = "5px";
            if (i != 0)
                rollingCell.style.borderLeft = "1px solid black";
            if (i < arguments.length)
                rollingCell.innerText = arguments[i];
        }
        this._elements.dataRows.push(row);
        this._elements.table.appendChild(this._elements.spacer);
        this._lastRow = row;
        row.scrollIntoView();
        spacerCheck.call(this);
    }
    p.removeRow = function(iRowIndex) {
        this._data.splice(iRowIndex, 1);
        this._elements.table.removeChild(this._elements.dataRows[iRowIndex]);
        this._elements.dataRows.splice(iRowIndex, 1);
    }
    p.clear = function() {
        this._data = [];
        var rows = this._elements.dataRows;
        for (var i = 0; i < rows.length; i++) {
            this._elements.table.removeChild(rows[i]);
        }
        this._elements.dataRows = [];
        this._lastRow = null;
        this._lastSortIndex = null;
        spacerCheck.call(this);
    }
    function resetSort() {
        this._lastSortIndex = null;
        sortTable.call(this, 0);
    }
    function columnHeaderClick(oEvent) {
        var nIndex = Array.prototype.indexOf.call(this._elements.header.childNodes, oEvent.target);
        sortTable.call(this, nIndex);
    }
    function sortTable(nIndex) {
        if (this._lastRow)
            this._lastRow.style.borderBottom = "1px solid black";
        var oTable = this._elements.table,
            oaRows = this._elements.dataRows,
            bDesc = this._lastSortIndex === nIndex,
            oLastRow;
        this._lastSortIndex = bDesc ? null : nIndex;
        if (oaRows.length > 1)
            oaRows.slice()
                .sort(comparer(nIndex, !bDesc))
                .forEach(function(tr) { oLastRow = tr; oTable.appendChild(tr); });
        oTable.appendChild(this._elements.spacer);
        this._lastRow = oLastRow;
        spacerCheck.call(this);
    }
    function getCellValue(tr, idx){ return tr.children[idx].innerText; }
    function comparer(idx, asc) { return function(a, b) { return function(v1, v2) {
            return v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2);
        }(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));
    }};
    function spacerCheck() {
        this._elements.spacer.style.display = "";
        var bTableOverflow = (this.domElement.clientHeight == this.domElement.scrollHeight);
        this._elements.spacer.style.display = bTableOverflow ? "" : "none";
        if (this._lastRow)
            this._lastRow.style.borderBottom = bTableOverflow ? "1px solid black" : "";
    }
    Object.defineProperty(p, "width", {
        set: function(nWidth) {
            this.domElement.style.width = nWidth + "px";
        },
        get: function() {
            return parseInt(this.domElement.style.width, 10);
        }
    });
    Object.defineProperty(p, "height", {
        set: function(nHeight) {
            this.domElement.style.height = nHeight + "px";
            spacerCheck.call(this);
        },
        get: function() {
            return parseInt(this.domElement.style.height, 10);
        }
    });
    Object.defineProperty(p, "scale", {
        set: function(nScale) {
            this.domElement.style.transform = "scale(" + nScale + ")";
        },
        get: function() {
            return parseInt(this.domElement.style.transform, 10);
        }
    });
    Object.defineProperty(p, "font", {
        set: function(sFont) {
            this.domElement.style.font = sFont;
        },
        get: function() {
            return this.domElement.style.font;
        }
    });
    Object.defineProperty(p, "sortEnabled", {
        set: function(bEnabled) {
            this._sortEnabled = bEnabled;
            var rollingHeader, i;
            for (i = 0; i < this._elements.header.childNodes.length; i++) {
                rollingHeader = this._elements.header.childNodes[i];
                if (bEnabled) {
                    rollingHeader.onclick = columnHeaderClick.bind(this);
                    rollingHeader.style.cursor = "pointer";
                } else {
                    rollingHeader.onclick = null;
                    rollingHeader.style.cursor = "";
                }
            }
        },
        get: function() {
            return this._sortEnabled;
        }
    });
    window.qt = Table;
}());