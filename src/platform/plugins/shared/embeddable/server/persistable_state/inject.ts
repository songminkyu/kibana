/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { SerializableRecord } from '@kbn/utility-types';
import { SavedObjectReference } from '@kbn/core/types';
import { PersistableState } from '@kbn/kibana-utils-plugin/common';
import { EmbeddableStateWithType } from './types';
import { injectBaseEmbeddableInput } from './migrate_base_input';

export const getInjectFunction = (
  getEmbeddableFactory: (embeddableFactoryId: string) => PersistableState<EmbeddableStateWithType>,
  getEnhancement: (enhancementId: string) => PersistableState
) => {
  return (state: EmbeddableStateWithType, references: SavedObjectReference[]) => {
    const enhancements = state.enhancements || {};
    const factory = getEmbeddableFactory(state.type);

    let updatedInput = injectBaseEmbeddableInput(state, references);

    if (factory) {
      updatedInput = factory.inject(updatedInput, references) as EmbeddableStateWithType;
    }

    updatedInput.enhancements = {};
    Object.keys(enhancements).forEach((key) => {
      if (!enhancements[key]) return;
      updatedInput.enhancements![key] = getEnhancement(key).inject(
        enhancements[key] as SerializableRecord,
        references
      );
    });

    return updatedInput;
  };
};
