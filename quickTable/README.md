# QuickTable

Simple JS table management.

## Usage

Constructor: **qt**(column 1 heading, column 2 heading, column 3 heading...)
Creates a new table with the headings specified.
Once you have created the table, insert myTable.domElement into your document.

### Methods
**addRow**(column 1 data, column 2 data...)
Adds a new row to the table with the given data.
Blank cells will be inserted if there are fewer arguments than columns in the table.

**removeRow**(row index)
Removes a row at the given position relative to the unsorted table.

**clear**()
Empties out the table but keeps the column headings.

### Properties
**domElement**: HTMLElement
The <div> element containing the table. Created internally on construction.

**sortEnabled**: boolean, default true
Determines if the table can be sorted by clicking on the column headings.
Additionally, if set to true, the table will be sorted by the first column each time a row is inserted.
If you are inserting many rows at once, temporarily set this to false to increase performance.

**width**: integer
Width of the table in px.

**height**: integer
Height of the table in px.

**font**: string, default sans-serif
CSS Font property for the table.