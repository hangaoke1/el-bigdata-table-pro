import { Table } from "element-ui";

import Mousewheel from "element-ui/lib/directives/mousewheel";

import VirtualTableBodyRender from "./virtual-table-body-render.js";


const ElTableBody = Table.components.TableBody;

ElTableBody.directives = {
  Mousewheel,
};

const oldDataComputed = ElTableBody.computed.data;
ElTableBody.computed.data = function () {
  const { table } = this;
  const tableData = oldDataComputed.call(this);

  if (table.useVirtual) {
    return tableData.slice(table.start, table.end);
  } else {
    return tableData;
  }
};

const oldHoverRowHandler =
  ElTableBody.watch && ElTableBody.watch["store.states.hoverRow"];
if (oldHoverRowHandler) {
  ElTableBody.watch["store.states.hoverRow"] = function (newVal, oldVal) {
    if (!this.table.useVirtual) {
      oldHoverRowHandler && oldHoverRowHandler.call(this, newVal, oldVal);
    }
  };
}

ElTableBody.methods.getIndex = function (index) {
  return this.table.start + index;
};

const oldGetRowClassHandler = ElTableBody.methods.getRowClass;
ElTableBody.methods.getRowClass = function (row, rowIndex) {
  let classes = oldGetRowClassHandler.call(this, row, rowIndex);
  return classes;
};

ElTableBody.methods.isRenderCell = function (column, cellIndex) {
  const { table } = this;
  const isFixedColumn = column.fixed;
  const isFixedColumnInSideFixedBody = isFixedColumn && this.fixed;
  const isInVisibleArea =
    cellIndex >= table.columnStart && cellIndex <= table.columnEnd;

  return table.useVirtualColumn
    ? isInVisibleArea || isFixedColumnInSideFixedBody
    : !isFixedColumn || isFixedColumnInSideFixedBody;
};

const oldRender = ElTableBody.render;
ElTableBody.render = function (h) {
  if (this.table.useVirtual) {
    return VirtualTableBodyRender.call(this, h);
  } else {
    return oldRender.call(this, h);
  }
};
