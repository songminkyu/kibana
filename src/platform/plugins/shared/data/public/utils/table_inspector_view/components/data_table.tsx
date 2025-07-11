/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { css } from '@emotion/react';
import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiInMemoryTable,
  EuiToolTip,
} from '@elastic/eui';

import { FormattedMessage } from '@kbn/i18n-react';
import { i18n } from '@kbn/i18n';

import { IUiSettingsClient } from '@kbn/core/public';
import { Datatable, DatatableColumn, DatatableRow } from '@kbn/expressions-plugin/public';
import { FieldFormatsStart } from '@kbn/field-formats-plugin/public';
import { UiActionsStart } from '@kbn/ui-actions-plugin/public';
import {
  withEuiTablePersist,
  type EuiTablePersistInjectedProps,
} from '@kbn/shared-ux-table-persist/src';
import { DataViewRow, DataViewColumn } from '../types';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

interface DataTableFormatState {
  columns: DataViewColumn[];
  rows: DataViewRow[];
}

interface DataTableFormatProps {
  data: Datatable;
  uiSettings: IUiSettingsClient;
  fieldFormats: FieldFormatsStart;
  uiActions: UiActionsStart;
  isFilterable: (column: DatatableColumn) => boolean;
}

interface RenderCellArguments {
  table: Datatable;
  columnIndex: number;
  rowIndex: number;
  formattedValue: string;
  uiActions: UiActionsStart;
  isFilterable: boolean;
}

class DataTableFormatClass extends Component<
  DataTableFormatProps & EuiTablePersistInjectedProps<DatatableRow>,
  DataTableFormatState
> {
  static propTypes = {
    data: PropTypes.object.isRequired,
    uiSettings: PropTypes.object.isRequired,
    fieldFormats: PropTypes.object.isRequired,
    uiActions: PropTypes.object.isRequired,
    isFilterable: PropTypes.func.isRequired,
  };

  csvSeparator = this.props.uiSettings.get('csv:separator', ',');
  quoteValues = this.props.uiSettings.get('csv:quoteValues', true);
  state = {} as DataTableFormatState;

  static renderCell({
    table,
    columnIndex,
    rowIndex,
    formattedValue,
    uiActions,
    isFilterable,
  }: RenderCellArguments) {
    const column = table.columns[columnIndex];
    return (
      <EuiFlexGroup responsive={false} gutterSize="s" alignItems="center">
        <EuiFlexItem grow={false}>{formattedValue}</EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiFlexGroup responsive={false} gutterSize="none" alignItems="center">
            {isFilterable && (
              <EuiToolTip
                position="bottom"
                content={
                  <FormattedMessage
                    id="data.inspector.table.filterForValueButtonTooltip"
                    defaultMessage="Filter for value"
                  />
                }
              >
                <EuiButtonIcon
                  iconType="plusInCircle"
                  color="text"
                  aria-label={i18n.translate('data.inspector.table.filterForValueButtonAriaLabel', {
                    defaultMessage: 'Filter for value',
                  })}
                  data-test-subj="filterForInspectorCellValue"
                  className="insDataTableFormat__filter"
                  onClick={() => {
                    const value = table.rows[rowIndex][column.id];
                    const eventData = { table, column: columnIndex, row: rowIndex, value };
                    uiActions.executeTriggerActions('VALUE_CLICK_TRIGGER', {
                      data: { data: [eventData] },
                    });
                  }}
                />
              </EuiToolTip>
            )}

            {isFilterable && (
              <EuiFlexItem grow={false}>
                <EuiToolTip
                  position="bottom"
                  content={
                    <FormattedMessage
                      id="data.inspector.table.filterOutValueButtonTooltip"
                      defaultMessage="Filter out value"
                    />
                  }
                >
                  <EuiButtonIcon
                    iconType="minusInCircle"
                    color="text"
                    aria-label={i18n.translate(
                      'data.inspector.table.filterOutValueButtonAriaLabel',
                      {
                        defaultMessage: 'Filter out value',
                      }
                    )}
                    data-test-subj="filterOutInspectorCellValue"
                    className="insDataTableFormat__filter"
                    onClick={() => {
                      const value = table.rows[rowIndex][column.id];
                      const eventData = { table, column: columnIndex, row: rowIndex, value };
                      uiActions.executeTriggerActions('VALUE_CLICK_TRIGGER', {
                        data: { data: [eventData], negate: true },
                      });
                    }}
                  />
                </EuiToolTip>
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }

  static getDerivedStateFromProps({
    data,
    uiActions,
    fieldFormats,
    isFilterable,
  }: DataTableFormatProps) {
    if (!data) {
      return {
        columns: null,
        rows: null,
      };
    }

    const columns = data.columns.map((dataColumn: any, index: number) => {
      const formatParams = { id: 'string', ...dataColumn.meta.params };
      const fieldFormatter = fieldFormats.deserialize(formatParams);
      const filterable = isFilterable(dataColumn);
      return {
        name: dataColumn.name,
        field: dataColumn.id,
        sortable: true,
        render: (value: any) => {
          const formattedValue = fieldFormatter.convert(value);
          const rowIndex = data.rows.findIndex((row) => row[dataColumn.id] === value) || 0;

          return DataTableFormatClass.renderCell({
            table: data,
            columnIndex: index,
            rowIndex,
            formattedValue,
            uiActions,
            isFilterable: filterable,
          });
        },
      };
    });

    return { columns, rows: data.rows };
  }

  render() {
    const { columns, rows } = this.state;
    const { pageSize, sorting, onTableChange } = this.props.euiTablePersist;
    const pagination = {
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      pageSize,
    };

    return (
      <EuiInMemoryTable
        tableLayout="auto"
        className="insDataTableFormat__table eui-xScroll"
        data-test-subj="inspectorTable"
        columns={columns}
        items={rows}
        sorting={sorting}
        pagination={pagination}
        onTableChange={onTableChange}
        css={css`
          // Set a min width on each column - you can use [data-test-subj] to target specific columns
          .euiTableHeaderCell {
            min-width: 100px;
          }

          // Make sure the pagination follows the scroll
          > div:last-child {
            position: sticky;
            left: 0;
          }
        `}
      />
    );
  }
}

export const DataTableFormat = withEuiTablePersist(DataTableFormatClass, {
  tableId: 'inspectorDataTable',
  pageSizeOptions: PAGE_SIZE_OPTIONS,
  initialPageSize: 20,
});
