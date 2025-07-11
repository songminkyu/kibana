/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import { css } from '@emotion/react';
import { EuiModal, EuiModalBody, type UseEuiTheme } from '@elastic/eui';
import { useMemoCss } from '@kbn/css-utils/public/use_memo_css';

/**
 * By default the image formatter sets the max-width to "none" on the <img /> tag
 * To render nicely the image in the modal we want max_width: 100%
 */
const setMaxWidthImage = (imgHTML: string): string => {
  const regex = new RegExp('max-width:[^;]+;', 'gm');

  if (regex.test(imgHTML)) {
    return imgHTML.replace(regex, 'max-width: 100%;');
  }

  return imgHTML;
};

interface Props {
  imgHTML: string;
  closeModal: () => void;
}

export const ImagePreviewModal = ({ imgHTML, closeModal }: Props) => {
  const styles = useMemoCss(componentStyles);

  return (
    <EuiModal onClose={closeModal}>
      <EuiModalBody>
        <div
          css={styles.previewImageModal}
          // We  can dangerously set HTML here because this content is guaranteed to have been run through a valid field formatter first.
          dangerouslySetInnerHTML={{ __html: setMaxWidthImage(imgHTML) }} // eslint-disable-line react/no-danger
        />
      </EuiModalBody>
    </EuiModal>
  );
};

const componentStyles = {
  previewImageModal: ({ euiTheme }: UseEuiTheme) =>
    css({
      padding: euiTheme.size.base,

      '& img': {
        maxWidth: '100%',
      },
    }),
};
