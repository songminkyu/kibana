/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { ReactNode } from 'react';
import type { EuiDataGridCellValueElementProps } from '@elastic/eui';

export interface RowMatches {
  rowIndex: number;
  rowMatchesCount: number;
  matchesCountPerColumnId: Record<string, number>;
}

export interface ActiveMatch {
  rowIndex: number;
  columnId: string;
  matchIndexWithinCell: number;
  matchPosition: number;
}

export interface InTableSearchHighlightsWrapperProps {
  inTableSearchTerm?: string;
  highlightColor: string;
  highlightBackgroundColor: string;
  onHighlightsCountFound?: (count: number) => void;
  children: ReactNode;
}

export type RenderCellValuePropsWithInTableSearch = EuiDataGridCellValueElementProps &
  Pick<InTableSearchHighlightsWrapperProps, 'inTableSearchTerm' | 'onHighlightsCountFound'>;

export type RenderCellValueWrapper = (props: RenderCellValuePropsWithInTableSearch) => ReactNode;

export interface InTableSearchRestorableState {
  searchTerm?: string;
  activeMatch?: ActiveMatch;
}

export interface UseFindMatchesProps {
  initialState: InTableSearchRestorableState | undefined;
  onInitialStateChange: ((state: InTableSearchRestorableState) => void) | undefined;
  inTableSearchTerm: string;
  visibleColumns: string[];
  rows: unknown[];
  renderCellValue: RenderCellValueWrapper;
  onScrollToActiveMatch: (activeMatch: ActiveMatch, animate: boolean) => void;
}

export interface UseFindMatchesState {
  term: string;
  matchesList: RowMatches[];
  matchesCount: number | null;
  activeMatchPosition: number | null;
  columns: string[];
  isProcessing: boolean;
  renderCellsShadowPortal: (() => ReactNode) | null;
}

export interface UseFindMatchesReturn
  extends Omit<UseFindMatchesState, 'matchesList' | 'columns' | 'term'> {
  goToPrevMatch: () => void;
  goToNextMatch: () => void;
  resetState: () => void;
}

export type AllCellsProps = Pick<
  UseFindMatchesProps,
  'renderCellValue' | 'visibleColumns' | 'inTableSearchTerm'
> & {
  rowsCount: number;
  onFinish: (params: {
    term: string;
    matchesList: RowMatches[];
    totalMatchesCount: number;
  }) => void;
};
